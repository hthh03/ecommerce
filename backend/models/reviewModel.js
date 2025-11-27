import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order',
        required: true
    },
    userName: { type: String, required: true },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

reviewSchema.index({ productId: 1, userId: 1, orderId: 1 }, { unique: true });

const reviewModel = mongoose.models.review || mongoose.model('review', reviewSchema);

export default reviewModel;