import express from 'express';
import { adminLogin, registerUser, loginUser, getProfile, updateProfile, changePassword } from '../controllers/userController.js'
import authUser from '../middleware/auth.js';
import upload from "../middleware/upload.js";  

const userRouter = express.Router();

userRouter.post ('/register', registerUser)
userRouter.post ('/login', loginUser)
userRouter.post ('/admin', adminLogin)
userRouter.get("/profile", authUser, getProfile);
userRouter.put("/profile", authUser, upload.single("avatar"), updateProfile);
userRouter.put("/change-password", authUser, changePassword);
export default userRouter;
