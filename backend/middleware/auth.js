import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {
    const token = req.headers.token; // lấy token trong headers

    if (!token) {
        return res.json({ success: false, message:'Not Authorized. Please login again.' })
    }

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = token_decode.id;   // gán vào req.userId
        next();

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export default authUser;
