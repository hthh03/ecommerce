import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js"; 
import Stripe from 'stripe';

// global variables
const currency = 'usd';
const deliveryCharge = 10;

// gateway initialize 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Place order using COD
const placeOrder = async (req, res) => {
    try {
        const userId = req.userId;   
        const { items, amount, address } = req.body;

        // --- LOGIC QUẢN LÝ TỒN KHO ---
        // 1. Kiểm tra tồn kho trước khi tạo đơn hàng
        for (const item of items) {
            // Giả định rằng mỗi 'item' trong giỏ hàng có chứa: productId, size, và quantity
            const product = await productModel.findById(item.productId);
            if (!product) {
                return res.status(404).json({ success: false, message: `Không tìm thấy sản phẩm: ${item.name}` });
            }

            const sizeVariant = product.sizes.find(s => s.size === item.size);
            if (!sizeVariant) {
                return res.status(404).json({ success: false, message: `Không tìm thấy kích cỡ cho sản phẩm: ${item.name}` });
            }

            if (sizeVariant.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Không đủ hàng cho ${item.name} - Cỡ ${item.size}. Chỉ còn ${sizeVariant.stock} sản phẩm.` });
            }
        }
        
        // 2. Nếu tất cả sản phẩm đều đủ hàng, tiến hành trừ kho
        for (const item of items) {
            await productModel.updateOne(
                { _id: item.productId, 'sizes.size': item.size },
                { $inc: { 'sizes.$.stock': -item.quantity } }
            );
        }
        // --- KẾT THÚC LOGIC TỒN KHO ---

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

        // Xóa giỏ hàng sau khi đặt hàng thành công
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({ success: true, message: "Đặt hàng thành công" });
    } catch (error) {
        console.error("Lỗi khi đặt hàng (COD):", error);
        res.status(500).json({ success: false, message: "Đã xảy ra lỗi máy chủ" });
    }
};

// Place order using Stripe
const placeOrderStripe = async (req, res) => {
    try {
        const userId = req.userId;
        const { items, amount, address } = req.body;
        const { origin } = req.headers;

        // --- LOGIC QUẢN LÝ TỒN KHO ---
        // 1. Kiểm tra tồn kho (tương tự như COD)
        for (const item of items) {
            const product = await productModel.findById(item.productId);
            if (!product) {
                return res.status(404).json({ success: false, message: `Không tìm thấy sản phẩm: ${item.name}` });
            }
            const sizeVariant = product.sizes.find(s => s.size === item.size);
            if (!sizeVariant) {
                return res.status(404).json({ success: false, message: `Không tìm thấy kích cỡ cho sản phẩm: ${item.name}` });
            }
            if (sizeVariant.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Không đủ hàng cho ${item.name} - Cỡ ${item.size}. Chỉ còn ${sizeVariant.stock} sản phẩm.` });
            }
        }
        
        // 2. Trừ kho (tương tự như COD)
        for (const item of items) {
            await productModel.updateOne(
                { _id: item.productId, 'sizes.size': item.size },
                { $inc: { 'sizes.$.stock': -item.quantity } }
            );
        }
        // --- KẾT THÚC LOGIC TỒN KHO ---

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
                unit_amount: 10 * 100 // Phí giao hàng
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
        console.error("Lỗi khi đặt hàng (Stripe):", error);
        res.status(500).json({ success: false, message: "Đã xảy ra lỗi máy chủ" });
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
            const order = await orderModel.findById(orderId);
            if (order) {
                // Hoàn lại tồn kho khi thanh toán thất bại hoặc bị hủy
                for (const item of order.items) {
                    await productModel.updateOne(
                        { _id: item.productId, 'sizes.size': item.size },
                        { $inc: { 'sizes.$.stock': item.quantity } }
                    );
                }
            }
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false }); 
        }
    } catch (error) {
        console.error("Error verifying Stripe payment:", error);
        res.status(500).json({ success: false, message: "Server error during verification" });
    }
};

// ==========================================================
// C-ancel Order Function (ĐÃ CẬP NHẬT)
// ==========================================================
const cancelOrder = async (req, res) => {
    try {
        // Nhận 'reason' và 'stockAction' từ req.body
        const { orderId, reason, stockAction } = req.body;
        const order = await orderModel.findById(orderId);
        
         if (!order) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }

        // --- LOGIC HOÀN KHO CÓ ĐIỀU KIỆN ---
        if (!order.cancelled) {
            // Nếu không có stockAction (từ khách hàng), mặc định là 'refund'
            const action = stockAction || 'refund'; 

            for (const item of order.items) {
                
                if (action === 'refund') {
                    // 1. CỘNG HÀNG TRỞ LẠI (Mặc định)
                    await productModel.updateOne(
                        { _id: item.productId, 'sizes.size': item.size },
                        { $inc: { 'sizes.$.stock': item.quantity } }
                    );

                } else if (action === 'setZero') {
                    // 2. KHÓA SẢN PHẨM (Set stock = 0)
                    await productModel.updateOne(
                        { _id: item.productId, 'sizes.size': item.size },
                        { $set: { 'sizes.$.stock': 0 } }
                    );
                
                }
                // 3. Nếu action === 'noChange', không làm gì
            }
        }
        // --- KẾT THÚC LOGIC HOÀN KHO ---

        let refundResult = null;

        // Logic hoàn tiền Stripe
        if (order.paymentMethod === 'Stripe' && order.payment) {
            try {

                const sessions = await stripe.checkout.sessions.list({
                    limit: 100,
                });

                const session = sessions.data.find(s => 
                    s.metadata && s.metadata.orderId === orderId
                );

                if (session && session.payment_intent) {
                    const refund = await stripe.refunds.create({
                        payment_intent: session.payment_intent,
                        amount: order.amount * 100, 
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

        // Dữ liệu để cập nhật đơn hàng
        const updateData = {
            status: 'Cancelled',
            cancelled: true,
            cancelledAt: new Date(),
            cancelReason: reason // <-- ĐÃ THÊM: Lưu lý do
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

// Check Refund Status
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
        try {
            const refund = await stripe.refunds.retrieve(order.refund.refundId);
            
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
        res.json({ success: true, orders: orders }); 
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Lỗi" });
    }
};

// Orders of logged-in user
const userOrders = async (req, res) => {
    try {
        const userId = req.userId; 
        const orders = await orderModel.find({ userId: userId });
        res.json({ success: true, orders });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ success: false, message: "Error fetching user orders" });
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
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Trạng thái đã được cập nhật" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Lỗi" });
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