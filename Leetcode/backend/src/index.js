const express = require("express")
const path = require("path")
require('dotenv').config({ path: path.join(__dirname, "..", ".env") });
const app = express();
const main = require("./config/db")
const cookieParser = require('cookie-parser')
const redisclient = require("./config/redis")
const authRouter = require("./routes/userAuth")
const problemRouter = require("./routes/problem_route")
const submitRouter = require("./routes/submit_route")
const aiRouter = require("./routes/aiChatting")
const videoRouter = require("./routes/videoCreator")
const cors = require("cors");

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true // means able send user data 
}))
app.use('/user', authRouter);
app.use('/problem',problemRouter);
app.use("/problem",submitRouter);
app.use("/ai", aiRouter);
app.use("/video", videoRouter);


async function check_connect() {
    try {
        await Promise.all([main(), redisclient.connect()])
        console.log("Db and Redis is connected")
    } catch (error) {
        console.error("Database or Redis connection failed:", error.message)
        console.error("The API was not started. Check MongoDB Atlas Network Access and your environment variables.")
        process.exit(1)
    }

    app.listen(process.env.Port, () => {
        console.log("server is connected on port " + (process.env.Port))
    })
}

check_connect()