import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe';

// global variables
const currency = 'inr';
const deliveryCharge = 10;

// gateway initialize 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Place order using COD
const placeOrder = async (req, res) => {
    try {
        const userId = req.userId;   // 🔹 lấy từ authUser
        const { items, amount, address } = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({ success: true, message: "Order Placed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Place order using Stripe
const placeOrderStripe = async (req, res) => {
    try {
        const userId = req.userId;
        const { items, amount, address } = req.body;
        const { origin } = req.headers;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: { name: item.name },
                unit_amount: Math.round(parseFloat(item.price) * 100)  // 🔹 FIX: Math.round + parseFloat
            },
            quantity: item.quantity
        }));

        line_items.push({
            price_data: {
                currency: currency,
                product_data: { name: 'Delivery Charges' },
                unit_amount: Math.round(deliveryCharge * 100)  // 🔹 FIX: Math.round
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
            metadata: {
                orderId: newOrder._id.toString()
            }
        });

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Verify Stripe
const verifyStripe = async (req, res) => {
    const { orderId, success } = req.body;
    const userId = req.userId;   // 🔹 lấy từ authUser

    try {
        if (success === 'true') {
            // Lấy thông tin session để lưu payment_intent_id
            const order = await orderModel.findById(orderId);
            if (order) {
                // Cập nhật order với payment = true
                await orderModel.findByIdAndUpdate(orderId, { 
                    payment: true,
                    status: 'Order Placed'
                });
                await userModel.findByIdAndUpdate(userId, { cartData: {} });
            }
            res.json({ success: true });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// 🔹 NEW: Cancel Order Function
const cancelOrder = async (req, res) => {
    try {
        const { orderId, reason } = req.body;
        const userId = req.userId; // For user cancellation
        
        // Tìm order
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: "Order not found" 
            });
        }

        // Kiểm tra quyền cancel (user chỉ có thể cancel order của mình)
        if (userId && order.userId !== userId) {
            return res.status(403).json({ 
                success: false, 
                message: "You can only cancel your own orders" 
            });
        }

        // Kiểm tra trạng thái order có thể cancel được không
        const cancelableStatuses = ['Order Placed', 'Packing'];
        if (!cancelableStatuses.includes(order.status)) {
            return res.status(400).json({ 
                success: false, 
                message: "Order cannot be cancelled at this stage" 
            });
        }

        let refundResult = null;

        // Nếu đã thanh toán bằng Stripe, thực hiện hoàn tiền
        if (order.paymentMethod === 'Stripe' && order.payment) {
            try {
                // Tìm payment intent từ Stripe
                const sessions = await stripe.checkout.sessions.list({
                    limit: 100,
                });

                // Tìm session có metadata.orderId khớp
                const session = sessions.data.find(s => 
                    s.metadata && s.metadata.orderId === orderId
                );

                if (session && session.payment_intent) {
                    // Thực hiện refund
                    const refund = await stripe.refunds.create({
                        payment_intent: session.payment_intent,
                        amount: order.amount * 100, // Convert to cents
                        reason: 'requested_by_customer',
                        metadata: {
                            orderId: orderId,
                            reason: reason || 'Customer requested cancellation'
                        }
                    });

                    refundResult = {
                        refundId: refund.id,
                        status: refund.status,
                        amount: refund.amount / 100,
                        currency: refund.currency
                    };
                }
            } catch (stripeError) {
                console.error('Stripe refund error:', stripeError);
                return res.status(400).json({ 
                    success: false, 
                    message: "Failed to process refund: " + stripeError.message 
                });
            }
        }

        // Cập nhật order status và thông tin cancel
        const updateData = {
            status: 'Cancelled',
            cancelled: true,
            cancelledAt: new Date(),
            cancelReason: reason || 'No reason provided'
        };

        if (refundResult) {
            updateData.refund = refundResult;
        }

        await orderModel.findByIdAndUpdate(orderId, updateData);

        res.json({ 
            success: true, 
            message: "Order cancelled successfully",
            refund: refundResult
        });

    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// 🔹 NEW: Check Refund Status
const checkRefundStatus = async (req, res) => {
    try {
        const { orderId } = req.body;
        
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: "Order not found" 
            });
        }

        if (!order.refund || !order.refund.refundId) {
            return res.json({ 
                success: true, 
                message: "No refund found for this order",
                refund: null
            });
        }

        // Kiểm tra status từ Stripe
        try {
            const refund = await stripe.refunds.retrieve(order.refund.refundId);
            
            // Cập nhật status trong database nếu có thay đổi
            if (refund.status !== order.refund.status) {
                await orderModel.findByIdAndUpdate(orderId, {
                    'refund.status': refund.status
                });
            }

            res.json({ 
                success: true, 
                refund: {
                    id: refund.id,
                    status: refund.status,
                    amount: refund.amount / 100,
                    currency: refund.currency,
                    created: new Date(refund.created * 1000),
                    reason: refund.reason
                }
            });

        } catch (stripeError) {
            console.error('Stripe refund check error:', stripeError);
            res.status(400).json({ 
                success: false, 
                message: "Failed to check refund status: " + stripeError.message 
            });
        }

    } catch (error) {
        console.error('Check refund status error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// All orders for Admin
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Orders of logged-in user
const userOrders = async (req, res) => {
    try {
        const userId = req.userId;   // 🔹 lấy từ authUser
        const orders = await orderModel.find({ userId });
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const removeOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "OrderId is required" });
    }

    const deletedOrder = await orderModel.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      message: "Order deleted successfully",
      data: deletedOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update order status (Admin only)
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: 'Status Updated' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { 
    verifyStripe, 
    placeOrder, 
    placeOrderStripe, 
    allOrders, 
    userOrders, 
    updateStatus, 
    removeOrder,
    cancelOrder,      // 🔹 NEW
    checkRefundStatus // 🔹 NEW
};