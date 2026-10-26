const validate_problem = (data)=>{

    const mendatory_field = [ title , discription , tag , difficulty, visible_testcases , hidden_testcases , start_code,
         ref_solution];

         const IsAllow = mendatory_field.every((k)=>Object.keys(data).includes(k));

         if(!IsAllow){
            res.status(500).send("Invalid Schema")
         }
}

const axios = require("axios");

const judge0Url = (
    process.env.JUDGE0_URL || "http://127.0.0.1:2358"
).replace(/\/$/, "");

// 1. Get Judge0 Language ID

const getLanguageById = (lang) => {

    const language = {
        "c": 50,
        "c++": 54,
        "cpp": 54,
        "java": 62,
        "javascript": 63,
        "js": 63,
        "php": 68,
        "python": 71
    };

    const languageId = language[lang.toLowerCase()];

    if (!languageId) {
        throw new Error("Language not supported: " + lang);
    }

    return languageId;
};


// 2. Convert normal text to Base64 

const encodeBase64=(value)=>{
    return Buffer
    .from(value ?? "", "utf-8")
    .toString("base64");
};

// 3. Convert Judge0 Base64 output to normal text

const decodeBase64 = (value)=>{

    if(!value){
        return "";
    }

    return Buffer
    .from(value , "base64")
    .toString("utf-8");
};


// 4. Submit Batch to Local Judge0

const submitBatch = async(submissions)=>{

    try{
        const response = await axios.post(
             `${judge0Url}/submissions/batch`,

             {
                submissions
             },

             {
                headers :{
                    "Content-Type" : "application/json"
                 },
                 params: {
                     base64_encoded: true
                 }
             }

        );

        return response.data;
    }
    catch(error){
        console.log("Judge0 Batch Error:", 
            error.response?.data || error.message
        );

        if (error.code === "ECONNREFUSED") {
            throw new Error(
                `Judge0 is unavailable at ${judge0Url}. Start Judge0 or set JUDGE0_URL in backend/.env.`
            );
        }

        throw error;
    }
};

// 5. Wait Function

const Waiting = (timer) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(1);
        }, timer);
    });
};

// 6. Send Tokens Again to Judge0
//    and Get Final Result

const submitToken = async(resultToken)=>{

    while(true){
        try{
            const response = await axios.get(

                `${judge0Url}/submissions/batch`,
                {
                    //These are query parameters that get appended to the URL automatically by Axios.
                    //Axios will turn this into a URL like: http://localhost:2358/submissions/batch?tokens=abc123,def456&fields=*

                    params:{
                        // Convert token array into:
                        // token1,token2,token3

                        tokens : resultToken.join(","),

                        //This tells Judge0 to return all available fields in the response
                        //(like stdout, stderr, compile output, status, etc.).
                        //Without this, Judge0 might only return minimal info.
                        fields : "*" 
                        ,
                        base64_encoded: true
                    }
                }
            );
            const result = response.data;

        //every where we do console.log for only check on terminal is tere issue on not at that point 
            console.log(
                "Judge0 Result:",
                result
            )

            // Check if ALL submissions are finished

            const IsAllow = result.submissions.every((r)=>r.status.id>2)

               // If all finished → return results
            if(IsAllow){
                return result.submissions
            }
              // If still processing → wait 1 second
            await Waiting(1000);
        }
        catch(error){

            console.log(
                "Judge0 token submissions error :",
                error.response?.data || error.message

            )

            if (error.code === "ECONNREFUSED") {
                throw new Error(
                    `Judge0 is unavailable at ${judge0Url}. Start Judge0 or set JUDGE0_URL in backend/.env.`
                );
            }

            throw error
        }
    }
}

module.exports = {
    getLanguageById,
    encodeBase64,
    decodeBase64,
    submitBatch,
    submitToken
};