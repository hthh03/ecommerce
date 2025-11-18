import reviewModel from '../models/reviewModel.js';
import productModel from '../models/productModel.js';
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';

// Đổi tên hàm và đơn giản hóa: chỉ đếm số bình luận
const updateProductReviewCount = async (productId) => {
    try {
        const reviews = await reviewModel.find({ productId });
        const numReviews = reviews.length;
        
        await productModel.findByIdAndUpdate(productId, {
            // rating: 0, // <-- XÓA DÒNG NÀY
            numReviews: numReviews // <-- GIỮ LẠI DÒNG NÀY
        });
    } catch (error) {
        console.error("Error updating product review count:", error);
    }
};

/**
 * @desc    Thêm một đánh giá mới
 * @route   POST /api/review/add
 * @access  Private
 */
export const addReview = async (req, res) => {
    try {
        // --- BẮT ĐẦU CHỈNH SỬA ---
        const { productId, orderId, comment } = req.body; // <-- XÓA 'rating'
        const userId = req.userId;
        // --- KẾT THÚC CHỈNH SỬA ---

        // 1. Kiểm tra đơn hàng (Không đổi)
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }
        if (order.userId.toString() !== userId) {
            return res.json({ success: false, message: "Not authorized to review this order" });
        }
        if (order.status !== "Delivered") {
            return res.json({ success: false, message: "Product must be delivered to review" });
        }
        
        // 2. Kiểm tra sản phẩm trong đơn hàng (Không đổi)
        const itemInOrder = order.items.find(item => item.productId.toString() === productId);
        if (!itemInOrder) {
            return res.json({ success: false, message: "Product not found in this order" });
        }

        // 3. Kiểm tra đã đánh giá chưa (Không đổi)
        const alreadyReviewed = await reviewModel.findOne({
            productId,
            userId,
            orderId
        });
        if (alreadyReviewed) {
            return res.json({ success: false, message: "Product already reviewed for this order" });
        }
        
        // 4. Lấy tên người dùng (Không đổi)
        const user = await userModel.findById(userId);

        // 5. Tạo đánh giá mới (Đã xóa rating)
        const review = new reviewModel({
            productId,
            userId,
            orderId,
            userName: user.name,
            // rating: Number(rating), // <-- XÓA DÒNG NÀY
            comment,
        });

        await review.save();

        // 6. Cập nhật lại số lượng bình luận (dùng hàm mới)
        await updateProductReviewCount(productId); // <-- ĐÃ THAY ĐỔI

        res.json({ success: true, message: "Review added successfully" });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

/**
 * @desc    Lấy tất cả đánh giá của 1 sản phẩm
 * @route   GET /api/review/list/:productId
 * @access  Public
 */
// HÀM NÀY KHÔNG CẦN THAY ĐỔI
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await reviewModel.find({ productId }).sort({ date: -1 });
        res.json({ success: true, reviews });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

/**
 * @desc    Lấy đánh giá của user cho 1 sản phẩm cụ thể trong đơn hàng (để hiển thị lên modal edit)
 * @route   POST /api/review/user-review
 * @access  Private
 */
export const getUserReview = async (req, res) => {
    try {
        const { productId, orderId } = req.body;
        const userId = req.userId;

        const review = await reviewModel.findOne({
            userId,
            productId,
            orderId
        });

        if (review) {
            res.json({ success: true, review });
        } else {
            res.json({ success: false, message: "No review found" });
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

/**
 * @desc    Chỉnh sửa đánh giá đã tồn tại
 * @route   POST /api/review/edit
 * @access  Private
 */
export const editReview = async (req, res) => {
    try {
        const { productId, orderId, comment } = req.body;
        const userId = req.userId;

        const review = await reviewModel.findOne({
            userId,
            productId,
            orderId
        });

        if (!review) {
            return res.json({ success: false, message: "Review not found" });
        }

        // Cập nhật nội dung và ngày
        review.comment = comment;
        review.date = Date.now();
        
        await review.save();

        res.json({ success: true, message: "Review updated successfully" });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};