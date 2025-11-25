import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';
import { cloudinary } from "../config/cloudinary.js";
import fs from "fs";
import userModel from "../models/userModel.js";
import nodemailer from "nodemailer";
import orderModel from '../models/orderModel.js'

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// 🔹 User Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ success: false, message: "Email and password are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User doesn't exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔹 User Register
const registerUser = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const exists = await userModel.findOne({ email });
    if (exists) return res.json({ success: false, message: "User already exists" });

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Please enter a strong password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = createToken(user._id);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔹 Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Server error" });
  }
};

// 🔹 Get Profile
const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");
    if (!user) return res.json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔹 Update Profile (name + avatar + phone + address)
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    let avatarUrl = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "avatars" });
      avatarUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (avatarUrl) updateData.avatar = avatarUrl;

    const user = await userModel.findByIdAndUpdate(req.userId, updateData, {
      new: true,
    }).select("-password");

    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Change Password
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await userModel.findById(req.userId);

    if (!user) return res.json({ success: false, message: "User not found" });

    // --- LOGIC KIỂM TRA MẬT KHẨU CŨ (QUAN TRỌNG) ---
    // Điều kiện cần kiểm tra mật khẩu cũ:
    // 1. User đăng ký bằng Email thường (authType !== 'google')
    // 2. HOẶC User đăng ký bằng Google NHƯNG ĐÃ đặt mật khẩu rồi (isPasswordSet === true)
    
    const shouldCheckOldPass = user.authType !== 'google' || user.isPasswordSet;

    if (shouldCheckOldPass) {
        if (!oldPassword) {
            return res.json({ success: false, message: "Current password is required" });
        }
        
        // So sánh mật khẩu cũ với mật khẩu trong DB
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Current password is incorrect" }); // <-- Chặn đứng tại đây nếu sai pass
        }
    }
    // --------------------------------------------------

    // Nếu vượt qua kiểm tra trên thì mới cho đổi pass
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Đánh dấu là đã có mật khẩu
    user.isPasswordSet = true;

    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔹 Forgot Password - Send New Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const generateRandomPassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let password = '';
      for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const newPassword = generateRandomPassword();
    
    // Hash mật khẩu mới và lưu vào database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.password = hashedPassword;
    await user.save();

    // Gửi mail với mật khẩu mới
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your New Password - Flora Gems",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Your password has been reset successfully. Here is your new password:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #007bff;">
            <h3 style="margin: 0; color: #007bff;">New Password:</h3>
            <p style="font-size: 18px; font-weight: bold; margin: 10px 0; color: #333;">${newPassword}</p>
          </div>
          
          <p><strong>Important:</strong> Please login with this new password and change it immediately for security reasons.</p>
          
          <p>If you didn't request this password reset, please contact us immediately.</p>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: "New password sent to your email!" 
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// 🔹 Reset Password with Temporary Password
const resetPassword = async (req, res) => {
  try {
    const { email, tempPassword, newPassword } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // So sánh mật khẩu tạm (được gửi email trước đó)
    const isMatch = await bcrypt.compare(tempPassword, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Temporary password is incorrect" });
    }

    // Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset password with temp error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all users (Admin only)
const listUsers = async (req, res) => {
    try {
        const users = await userModel.find({}).select('-password').sort({ date: -1 })
        res.json({
            success: true,
            users
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

// Block/Unblock user
const blockUser = async (req, res) => {
    try {
        const { userId, block } = req.body
        
        await userModel.findByIdAndUpdate(userId, { blocked: block })
        
        res.json({
            success: true,
            message: block ? 'User blocked successfully' : 'User unblocked successfully'
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

// Delete user
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.body
        
        // Optional: Also delete user's orders
        // await orderModel.deleteMany({ userId })
        
        await userModel.findByIdAndDelete(userId)
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

// Get user orders
const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.body
        
        const orders = await orderModel.find({ userId }).sort({ date: -1 })
        
        res.json({
            success: true,
            orders
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture } = payload; 

        // Kiểm tra user
        let user = await userModel.findOne({ email });

        if (user) {
            // Đã có -> Login
            if (!user.avatar) {
                user.avatar = picture;
                await user.save();
            }
        } else {
            // Chưa có -> TẠO MỚI (Khắc phục lỗi User not found)
            const randomPassword = Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            const newUser = new userModel({
                name: name,
                email: email,
                password: hashedPassword, 
                avatar: picture,
                authType: 'google',
                isPasswordSet: false
            });
            user = await newUser.save();
        }

        const token = createToken(user._id);
        res.json({ success: true, token });

    } catch (error) {
        console.log("Google Login Error:", error);
        res.json({ success: false, message: error.message });
    }
};

export { loginUser, registerUser, adminLogin, getProfile, updateProfile, changePassword, forgotPassword, resetPassword,
  listUsers, blockUser, deleteUser, getUserOrders, googleLogin};