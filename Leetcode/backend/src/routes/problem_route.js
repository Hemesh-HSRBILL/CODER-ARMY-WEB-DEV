const express = require('express')
const problemRouter = express.Router()

const adminMiddleware = require("../middleware/adminMiddleware")
const { problem_create,problem_update, problem_delete, problem_getById, getAll_problem,submittedProblem , solved_problem_user } = require('../controller/userproblem')
const userMiddleware = require('../middleware/userMiddleware')

problemRouter.post("/create",adminMiddleware, problem_create)
problemRouter.put("/update/:id",adminMiddleware,problem_update)
problemRouter.post("/delete/:id",adminMiddleware, problem_delete)

problemRouter.get("/problem_getById/:id",userMiddleware, problem_getById)
problemRouter.get("/get_All_Problem",userMiddleware, getAll_problem)
problemRouter.get("/submittedProblem/:id",userMiddleware,submittedProblem)
problemRouter.get("/solvedProblem",userMiddleware,solved_problem_user)


module.exports = problemRouter