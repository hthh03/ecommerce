import express from 'express'
import {
    placeOrder, 
    placeOrderStripe, 
    allOrders, 
    userOrders, 
    updateStatus, 
    verifyStripe, 
    removeOrder,
    cancelOrder,        // 🔹 NEW
    checkRefundStatus   // 🔹 NEW
} from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

// Order Management
orderRouter.post("/remove", removeOrder);

//Admin Features
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)

//Payment Features
orderRouter.post('/place', authUser, placeOrder)
orderRouter.post('/stripe', authUser, placeOrderStripe)

//User Features
orderRouter.post('/userorders', authUser, userOrders)

//Verify payment
orderRouter.post('/verifyStripe', authUser, verifyStripe)

// 🔹 NEW: Cancel & Refund Features
orderRouter.post('/cancel', authUser, cancelOrder)              // User cancel their order
orderRouter.post('/admin-cancel', adminAuth, cancelOrder)       // Admin cancel any order
orderRouter.post('/refund-status', authUser, checkRefundStatus) // Check refund status

export default orderRouter