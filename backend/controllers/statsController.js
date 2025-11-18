import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import mongoose from 'mongoose';

/**
 * @route   GET /api/stats/summary
 * @desc    Lấy dữ liệu tóm tắt (Tổng doanh thu, Tổng đơn hàng, Tổng người dùng)
 * @access  Private (Admin)
 */
export const getSummary = async (req, res) => {
    try {
        // 1. Lấy tổng số người dùng
        const totalUsersPromise = userModel.countDocuments();

        // 2. Lấy tổng số đơn hàng đã thanh toán
        const totalOrdersPromise = orderModel.countDocuments({ payment: true });

        // 3. Tính tổng doanh thu từ các đơn hàng đã thanh toán
        const totalRevenuePromise = orderModel.aggregate([
            { $match: { payment: true } },
            { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
        ]);

        // Chạy song song 3 truy vấn
        const [userCount, orderCount, revenueResult] = await Promise.all([
            totalUsersPromise,
            totalOrdersPromise,
            totalRevenuePromise
        ]);

        // Lấy kết quả doanh thu, mặc định là 0 nếu không có đơn hàng
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        res.json({
            success: true,
            totalUsers: userCount,
            totalOrders: orderCount,
            totalRevenue: totalRevenue
        });

    } catch (error) {
        console.error("Error fetching summary:", error);
        res.json({ success: false, message: error.message });
    }
};

/**
 * @route   GET /api/stats/top-product
 * @desc    Lấy sản phẩm bán chạy nhất
 * @access  Private (Admin)
 */
export const getTopProduct = async (req, res) => {
    try {
        const topProductAgg = await orderModel.aggregate([
            { $match: { payment: true } }, // Chỉ tính các đơn hàng đã thanh toán
            { $unwind: "$items" }, // Tách các sản phẩm trong mảng 'items' ra
            {
                $group: {
                    // Gom nhóm dựa trên productId.
                    // Chúng ta cần chuyển đổi productId (String) thành ObjectId để $lookup
                    _id: { $toObjectId: "$items.productId" }, 
                    totalQuantity: { $sum: "$items.quantity" } // Tính tổng số lượng bán ra
                }
            },
            { $sort: { totalQuantity: -1 } }, // Sắp xếp giảm dần
            { $limit: 1 }, // Lấy 1 sản phẩm đầu tiên
            {
                // Tham chiếu đến collection 'products' để lấy thông tin chi tiết
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: "$productDetails" }, // Tách mảng kết quả $lookup
            {
                // Định dạng lại đầu ra
                $project: {
                    _id: 0,
                    name: "$productDetails.name",
                    image: { $arrayElemAt: ["$productDetails.image", 0] }, // Lấy ảnh đầu tiên
                    quantity: "$totalQuantity"
                }
            }
        ]);

        if (topProductAgg.length === 0) {
            return res.json({ success: true, product: null, message: "No sales data found." });
        }

        res.json({ success: true, product: topProductAgg[0] });

    } catch (error) {
        console.error("Error fetching top product:", error);
        res.json({ success: false, message: error.message });
    }
};

/**
 * @route   GET /api/stats/top-customer
 * @desc    Lấy khách hàng chi tiêu nhiều nhất
 * @access  Private (Admin)
 */
export const getTopCustomer = async (req, res) => {
    try {
        const topCustomerAgg = await orderModel.aggregate([
            { $match: { payment: true } }, // Chỉ tính các đơn hàng đã thanh toán
            {
                $group: {
                    // Gom nhóm dựa trên userId.
                    // Chuyển đổi userId (String) thành ObjectId để $lookup
                    _id: { $toObjectId: "$userId" }, 
                    totalSpent: { $sum: "$amount" } // Tính tổng số tiền đã chi tiêu
                }
            },
            { $sort: { totalSpent: -1 } }, // Sắp xếp giảm dần
            { $limit: 1 }, // Lấy 1 khách hàng đầu tiên
            {
                // Tham chiếu đến collection 'users' để lấy thông tin chi tiết
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'customerDetails'
                }
            },
            { $unwind: "$customerDetails" }, // Tách mảng kết quả $lookup
            {
                // Định dạng lại đầu ra
                $project: {
                    _id: 0,
                    name: "$customerDetails.name",
                    email: "$customerDetails.email",
                    totalSpent: "$totalSpent"
                }
            }
        ]);

        if (topCustomerAgg.length === 0) {
            return res.json({ success: true, customer: null, message: "No sales data found." });
        }

        res.json({ success: true, customer: topCustomerAgg[0] });

    } catch (error) {
        console.error("Error fetching top customer:", error);
        res.json({ success: false, message: error.message });
    }
};