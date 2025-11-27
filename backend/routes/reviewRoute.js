import express from 'express';
import { addReview, getProductReviews, getUserReview, editReview } from '../controllers/reviewController.js';
import authUser from '../middleware/auth.js'; 

const reviewRouter = express.Router();

reviewRouter.post('/add', authUser, addReview);
reviewRouter.post('/user-review', authUser, getUserReview);
reviewRouter.post('/edit', authUser, editReview);
reviewRouter.get('/list/:productId', getProductReviews);

export default reviewRouter;