import express from 'express'
import {
    placeOrder, 
    placeOrderStripe, 
    allOrders, 
    userOrders, 
    updateStatus, 
    verifyStripe, 
    removeOrder,
    cancelOrder,       
    checkRefundStatus   
} from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

orderRouter.post("/remove", removeOrder);
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)
orderRouter.post('/place', authUser, placeOrder)
orderRouter.post('/stripe', authUser, placeOrderStripe)
orderRouter.post('/userorders', authUser, userOrders)
orderRouter.post('/verifyStripe', authUser, verifyStripe)
orderRouter.post('/cancel', authUser, cancelOrder)              
orderRouter.post('/admin-cancel', adminAuth, cancelOrder)      
orderRouter.post('/refund-status', authUser, checkRefundStatus) 

export default orderRouter