import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js"; 
import Stripe from 'stripe';

// global variables
const currency = 'usd';
const deliveryCharge = 10;

// gateway initialize 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper: Hàm trừ kho an toàn (Ép kiểu số)
const deductStock = async (productId, size, quantity) => {
    await productModel.updateOne(
        { _id: productId, 'sizes.size': size },
        { $inc: { 'sizes.$.stock': -Number(quantity) } } // Ép về số để trừ chính xác
    );
};

// Helper: Hàm cộng kho an toàn
const restockItem = async (productId, size, quantity) => {
    await productModel.updateOne(
        { _id: productId, 'sizes.size': size },
        { $inc: { 'sizes.$.stock': Number(quantity) } } // Ép về số để cộng chính xác
    );
};

// Place order using COD
const placeOrder = async (req, res) => {
    try {
        const userId = req.userId;   
        const { items, amount, address } = req.body;

        if (!userId) return res.json({ success: false, message: "User ID missing. Login again." });

        // --- VALIDATION TỒN KHO ---
        for (const item of items) {
            const product = await productModel.findById(item.productId);
            if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });

            const sizeVariant = product.sizes.find(s => s.size === item.size);
            if (!sizeVariant) return res.status(404).json({ success: false, message: `Size not found: ${item.name} (${item.size})` });

            if (sizeVariant.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Not enough stock for ${item.name}. Left: ${sizeVariant.stock}` });
            }
        }
        
        // --- TRỪ KHO ---
        for (const item of items) {
            await deductStock(item.productId, item.size, item.quantity);
        }

        const newOrder = new orderModel({
            userId,
            items,
            amount,
            address,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        });
        await newOrder.save();

        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({ success: true, message: "Order Placed Successfully" });
    } catch (error) {
        console.error("COD Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Place order using Stripe
const placeOrderStripe = async (req, res) => {
    try {
        const userId = req.userId;
        const { items, amount, address } = req.body;
        const { origin } = req.headers;

        // BẢO VỆ: Kiểm tra userId để tránh sập server
        if (!userId) {
            return res.json({ success: false, message: "Not Authorized. Please login again." });
        }

        // --- VALIDATION ---
        for (const item of items) {
            const product = await productModel.findById(item.productId);
            if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
            
            const sizeVariant = product.sizes.find(s => s.size === item.size);
            if (!sizeVariant) return res.status(404).json({ success: false, message: `Size not found: ${item.name}` });
            
            if (sizeVariant.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Stock error: ${item.name}` });
            }
        }
        
        // --- TRỪ KHO ---
        for (const item of items) {
            await deductStock(item.productId, item.size, item.quantity);
        }

        const newOrder = new orderModel({
            userId,
            items,
            amount,
            address,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now()
        });
        await newOrder.save();

        const line_items = items.map((item) => ({
            price_data: {
                currency: 'usd',
                product_data: { name: item.name },
                unit_amount: Math.round(parseFloat(item.price) * 100)  
            },
            quantity: item.quantity
        }));

        line_items.push({
            price_data: {
                currency: 'usd',
                product_data: { name: 'Delivery Charges' },
                unit_amount: 10 * 100 
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/place-order`,
            line_items,
            mode: 'payment',
            metadata: {
                orderId: newOrder._id.toString()
            }
        });

        res.json({ success: true, session_url: session.url });
    } catch (error)
    {
        console.error("Stripe Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verify Stripe
const verifyStripe = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success === 'true') {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            const order = await orderModel.findById(orderId);
            if (order) {
                await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
            }
            res.json({ success: true }); 
        } else {
            // THANH TOÁN LỖI -> HOÀN LẠI KHO
            const order = await orderModel.findById(orderId);
            if (order) {
                for (const item of order.items) {
                    await restockItem(item.productId, item.size, item.quantity);
                }
            }
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false }); 
        }
    } catch (error) {
        console.error("Verify Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Cancel Order Function
const cancelOrder = async (req, res) => {
    try {
        const { orderId, reason, stockAction } = req.body;
        const order = await orderModel.findById(orderId);
        
         if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Logic hoàn kho
        if (!order.cancelled) {
            const action = stockAction || 'refund'; 

            for (const item of order.items) {
                if (action === 'refund') {
                    await restockItem(item.productId, item.size, item.quantity);
                } else if (action === 'setZero') {
                    await productModel.updateOne(
                        { _id: item.productId, 'sizes.size': item.size },
                        { $set: { 'sizes.$.stock': 0 } }
                    );
                }
            }
        }

        let refundResult = null;
        // Logic Stripe Refund
        if (order.paymentMethod === 'Stripe' && order.payment) {
            try {
                const sessions = await stripe.checkout.sessions.list({ limit: 100 });
                const session = sessions.data.find(s => s.metadata && s.metadata.orderId === orderId);

                if (session && session.payment_intent) {
                    const refund = await stripe.refunds.create({
                        payment_intent: session.payment_intent,
                        amount: order.amount * 100, 
                        reason: 'requested_by_customer',
                        metadata: { orderId: orderId }
                    });
                    refundResult = {
                        refundId: refund.id,
                        status: refund.status,
                        amount: refund.amount / 100,
                        currency: refund.currency
                    };
                }
            } catch (stripeError) {
                console.error('Stripe Refund Error:', stripeError);
                // Không return lỗi ở đây để vẫn cho phép hủy đơn trong DB
            }
        }

        const updateData = {
            status: 'Cancelled',
            cancelled: true,
            cancelledAt: new Date(),
            cancelReason: reason // Lưu lý do
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
        console.error('Cancel Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Check Refund Status
const checkRefundStatus = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await orderModel.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        if (!order.refund || !order.refund.refundId) {
            return res.json({ success: true, message: "No refund found", refund: null });
        }
        
        try {
            const refund = await stripe.refunds.retrieve(order.refund.refundId);
            if (refund.status !== order.refund.status) {
                await orderModel.findByIdAndUpdate(orderId, { 'refund.status': refund.status });
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
            res.status(400).json({ success: false, message: stripeError.message });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// All orders for Admin
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, orders: orders }); 
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Orders of logged-in user
const userOrders = async (req, res) => {
    try {
        const userId = req.userId; 
        const orders = await orderModel.find({ userId: userId });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const removeOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    await orderModel.findByIdAndDelete(orderId);
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update order status (Admin only)
const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
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
    cancelOrder,      
    checkRefundStatus 
};