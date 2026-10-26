import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../../../utils/axios";

function ChatAi({problem}) {
    const [messages, setMessages] = useState([
        { role: 'model', parts:[{text: "Hi, How are you"}]},
        { role: 'user', parts:[{text: "I am Good"}]}
    ]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm();
    const messagesEndRef = useRef(null);

    function getLocalFallback(message) {
        const title = problem?.title || "this problem";
        return `I cannot reach the AI service right now, but I can still help you with ${title}. Your question was: "${message}". Start by identifying the input, output, and constraints, then write a brute-force approach before optimizing it.`;
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        const message = data.message.trim();
        const nextMessages = [
            ...messages,
            { role: 'user', parts:[{text: message}] }
        ];

        setMessages(nextMessages);
        reset();

        try {
            const response = await axiosClient.post("/ai/chat", {
                messages: nextMessages,
                title: problem?.title,
                description: problem?.description ?? problem?.discription,
                testCases: problem?.visibleTestCases ?? problem?.visible_testcases ?? [],
                startCode: problem?.startCode ?? problem?.start_code ?? []
            }, {
                timeout: 30000
            });

            setMessages(prev => [...prev, { 
                role: 'model', 
                parts:[{text: response.data?.message || getLocalFallback(message)}] 
            }]);
        } catch (error) {
            console.error("Chat request error:", error);
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts:[{
                    text: error.response?.data?.message || getLocalFallback(message)
                }]
            }]);
        }
    };

    return (
        <div className="flex h-full wrap-min-h-[400px] min-w-0 max-w-full flex-col overflow-hidden">
            <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden p-4">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
                    >
                        <div className="chat-bubble max-w-[85%] wrap-break-words bg-base-200 text-base-content">
                            {msg.parts[0].text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="shrink-0 border-t bg-base-100 p-4"
            >
                <div className="flex min-w-0 items-center gap-2">
                    <input 
                        placeholder="Ask me anything" 
                        className="input input-bordered min-w-0 flex-1" 
                        {...register("message", { required: true, minLength: 2 })}
                    />
                    <button 
                        type="submit" 
                        className="btn btn-ghost shrink-0"
                        disabled={Boolean(errors.message) || isSubmitting}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="m22 2-7 20-4-9-9-4Z" />
                            <path d="M22 2 11 13" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChatAi;