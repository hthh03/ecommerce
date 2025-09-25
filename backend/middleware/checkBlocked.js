import userModel from "../models/userModel.js"

export const checkBlocked = async (req, res, next) => {
    try {
        const { email } = req.body   // lấy email từ login request
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        if (user.blocked) {
            return res.status(403).json({ success: false, message: "Your account has been blocked. Please contact admin." })
        }

        next() // cho phép đi tiếp nếu chưa bị block
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: "Server error" })
    }
}
