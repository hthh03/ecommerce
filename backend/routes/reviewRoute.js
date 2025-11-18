import express from 'express';
// Import thêm getUserReview và editReview
import { addReview, getProductReviews, getUserReview, editReview } from '../controllers/reviewController.js';
import authUser from '../middleware/auth.js'; 

const reviewRouter = express.Router();

// Thêm đánh giá
reviewRouter.post('/add', authUser, addReview);

// ⬇️ --- ROUTE MỚI ---
// Lấy đánh giá của user (để check xem đã review chưa và điền vào modal)
reviewRouter.post('/user-review', authUser, getUserReview);

// Chỉnh sửa đánh giá
reviewRouter.post('/edit', authUser, editReview);
// ⬆️ ------------------

// Lấy danh sách đánh giá (công khai)
reviewRouter.get('/list/:productId', getProductReviews);

export default reviewRouter;