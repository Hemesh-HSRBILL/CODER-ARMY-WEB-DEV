const express = require("express")
const authRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware")
const { register, login, logout, adminRegister , deleteProfile , authinfo} = require("../controller/userAuthen")

authRouter.post('/register', register);
authRouter.post('/login', login)
authRouter.post('/logout', userMiddleware, logout)
authRouter.post('/admin/register',adminMiddleware, adminRegister);
authRouter.delete('/deleteProfile',userMiddleware,deleteProfile);
authRouter.get("/check",userMiddleware,authinfo)
// authRouter.get('/getProfile',getProfile);
module.exports = authRouter;
