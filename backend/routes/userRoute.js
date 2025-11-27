import express from 'express';
import { adminLogin, registerUser, loginUser, getProfile, updateProfile, changePassword, forgotPassword, resetPassword} from '../controllers/userController.js'
import { listUsers, blockUser, deleteUser, getUserOrders, googleLogin } from '../controllers/userController.js'
import authUser from '../middleware/auth.js';
import upload from "../middleware/upload.js"; 
import adminAuth from "../middleware/adminAuth.js";
import { checkBlocked } from "../middleware/checkBlocked.js"

const userRouter = express.Router();

userRouter.post ('/register', registerUser)
userRouter.post ('/login', checkBlocked, loginUser)
userRouter.post ('/admin', adminLogin)
userRouter.get("/profile", authUser, getProfile);
userRouter.put("/profile", authUser, upload.single("avatar"), updateProfile);
userRouter.put("/change-password", authUser, changePassword);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);
userRouter.post('/google-login', googleLogin);

userRouter.post('/list', adminAuth, listUsers)
userRouter.post('/block', adminAuth, blockUser)
userRouter.post('/delete', adminAuth, deleteUser) 
userRouter.post('/orders', adminAuth, getUserOrders)

export default userRouter;
