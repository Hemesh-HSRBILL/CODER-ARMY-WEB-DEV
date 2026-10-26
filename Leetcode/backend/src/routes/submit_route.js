const express = require("express");
const submitRouter = express.Router();
const {submit_problem ,runCode }= require("../controller/submit_problem")
const userMiddleware = require("../middleware/userMiddleware");

submitRouter.post("/submit/:id", userMiddleware, submit_problem)
submitRouter.post("/run/:id",userMiddleware,runCode)
module.exports = submitRouter;