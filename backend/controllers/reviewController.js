import reviewModel from '../models/reviewModel.js';
import productModel from '../models/productModel.js';
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';

const updateProductReviewCount = async (productId) => {
    try {
        const reviews = await reviewModel.find({ productId });
        const numReviews = reviews.length;
        
        await productModel.findByIdAndUpdate(productId, {
            numReviews: numReviews 
        });
    } catch (error) {
        console.error("Error updating product review count:", error);
    }
};

export const addReview = async (req, res) => {
    try {
        const { productId, orderId, comment } = req.body; 
        const userId = req.userId;
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
        
        const itemInOrder = order.items.find(item => item.productId.toString() === productId);
        if (!itemInOrder) {
            return res.json({ success: false, message: "Product not found in this order" });
        }
        const alreadyReviewed = await reviewModel.findOne({
            productId,
            userId,
            orderId
        });
        if (alreadyReviewed) {
            return res.json({ success: false, message: "Product already reviewed for this order" });
        }
        
        const user = await userModel.findById(userId);

        const review = new reviewModel({
            productId,
            userId,
            orderId,
            userName: user.name,
            comment,
        });

        await review.save();
        await updateProductReviewCount(productId); 

        res.json({ success: true, message: "Review added successfully" });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await reviewModel.find({ productId }).sort({ date: -1 });
        res.json({ success: true, reviews });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

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
        review.comment = comment;
        review.date = Date.now();
        
        await review.save();

        res.json({ success: true, message: "Review updated successfully" });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};