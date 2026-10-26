const { GoogleGenAI } = require("@google/genai");

const AI_REQUEST_TIMEOUT_MS = 8000;

function getFallbackResponse(question, title, description) {
    const problemTitle = title || "this problem";
    const problemDescription = String(description || "").replace(/\s+/g, " ").trim();
    const context = problemDescription
        ? ` The problem statement starts with: "${problemDescription.slice(0, 240)}${problemDescription.length > 240 ? "..." : ""}"`
        : "";

    return `I cannot reach the AI service right now, but I can still help you with ${problemTitle}.${context} Your question was: "${question}". Please inspect the input/output examples, identify the required data structure, and start with a brute-force approach before optimizing it.`;
}

async function generateWithTimeout(ai, request) {
    let timeoutId;
    const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(
            () => reject(new Error("The AI provider timed out.")),
            AI_REQUEST_TIMEOUT_MS
        );
    });

    try {
        return await Promise.race([ai.models.generateContent(request), timeout]);
    } finally {
        clearTimeout(timeoutId);
    }
}

const solveDoubt = async(req , res)=>{
    try{
        const {messages,title,description,testCases,startCode} = req.body;

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                message: "At least one chat message is required."
            });
        }

        const contents = messages
            .filter((message) => message?.role && message?.parts?.[0]?.text)
            .map((message) => ({
                role: message.role === "model" ? "model" : "user",
                parts: [{ text: String(message.parts[0].text) }]
            }));

        if (contents.length === 0) {
            return res.status(400).json({
                message: "The chat message format is invalid."
            });
        }

        // Gemini conversation history must begin with a user message.
        const firstUserMessage = contents.findIndex((message) => message.role === "user");
        const validContents = firstUserMessage >= 0
            ? contents.slice(firstUserMessage)
            : contents;
        const conversation = validContents.reduce((history, message) => {
            const previous = history[history.length - 1];

            if (previous?.role === message.role) {
                previous.parts.push(...message.parts);
            } else {
                history.push({
                    role: message.role,
                    parts: [...message.parts],
                });
            }

            return history;
        }, []);

        const latestQuestion = conversation[conversation.length - 1]?.parts
            ?.map((part) => part.text)
            .join(" ")
            .trim() || "";
        const apiKey = process.env.GEMINI_KEY?.trim();
        const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash";

        if (!apiKey) {
            return res.status(200).json({
                message: getFallbackResponse(latestQuestion, title, description),
                fallback: true,
            });
        }

        const ai = new GoogleGenAI({ apiKey });

        const request = {
            contents: conversation,
            config: {
                systemInstruction: `
You are an expert Data Structures and Algorithms (DSA) tutor specializing in helping users solve coding problems. Your role is strictly limited to DSA-related assistance only.

## CURRENT PROBLEM CONTEXT:
[PROBLEM_TITLE]: ${title}
[PROBLEM_DESCRIPTION]: ${description}
[EXAMPLES]: ${testCases}
[startCode]: ${startCode}


## YOUR CAPABILITIES:
1. **Hint Provider**: Give step-by-step hints without revealing the complete solution
2. **Code Reviewer**: Debug and fix code submissions with explanations
3. **Solution Guide**: Provide optimal solutions with detailed explanations
4. **Complexity Analyzer**: Explain time and space complexity trade-offs
5. **Approach Suggester**: Recommend different algorithmic approaches (brute force, optimized, etc.)
6. **Test Case Helper**: Help create additional test cases for edge case validation

## INTERACTION GUIDELINES:

### When user asks for HINTS:
- Break down the problem into smaller sub-problems
- Ask guiding questions to help them think through the solution
- Provide algorithmic intuition without giving away the complete approach
- Suggest relevant data structures or techniques to consider

### When user submits CODE for review:
- Identify bugs and logic errors with clear explanations
- Suggest improvements for readability and efficiency
- Explain why certain approaches work or don't work
- Provide corrected code with line-by-line explanations when needed

### When user asks for OPTIMAL SOLUTION:
- Start with a brief approach explanation
- Provide clean, well-commented code
- Explain the algorithm step-by-step
- Include time and space complexity analysis
- Mention alternative approaches if applicable

### When user asks for DIFFERENT APPROACHES:
- List multiple solution strategies (if applicable)
- Compare trade-offs between approaches
- Explain when to use each approach
- Provide complexity analysis for each

## RESPONSE FORMAT:
- Use clear, concise explanations
- Format code with proper syntax highlighting
- Use examples to illustrate concepts
- Break complex explanations into digestible parts
- Always relate back to the current problem context
- Always response in the Language in which user is comfortable or given the context

## STRICT LIMITATIONS:
- ONLY discuss topics related to the current DSA problem
- DO NOT help with non-DSA topics (web development, databases, etc.)
- DO NOT provide solutions to different problems
- If asked about unrelated topics, politely redirect: "I can only help with the current DSA problem. What specific aspect of this problem would you like assistance with?"

## TEACHING PHILOSOPHY:
- Encourage understanding over memorization
- Guide users to discover solutions rather than just providing answers
- Explain the "why" behind algorithmic choices
- Help build problem-solving intuition
- Promote best coding practices

Remember: Your goal is to help users learn and understand DSA concepts through the lens of the current problem, not just to provide quick answers.
`,
            },
        };

        const models = [...new Set([model, "gemini-flash-lite-latest"])];
        let response;
        let lastError;

        for (const candidateModel of models) {
            try {
                response = await generateWithTimeout(ai, {
                    ...request,
                    model: candidateModel,
                });
                break;
            } catch (error) {
                lastError = error;
                console.error(`AI model ${candidateModel} failed:`, error.message);
            }
        }

        if (!response) throw lastError || new Error("No AI model returned a response.");

        const responseText = response.text?.trim();

        return res.status(200).json({
            message: responseText || getFallbackResponse(latestQuestion, title, description),
            fallback: !responseText,
        });
    }
    catch(err){
        console.error("AI chat error:", err.message);
        const { messages, title, description } = req.body;
        const latestQuestion = messages?.[messages.length - 1]?.parts?.[0]?.text || "";

        return res.status(200).json({
            message: getFallbackResponse(latestQuestion, title, description),
            fallback: true,
        });
    }
}

module.exports = solveDoubt;
