import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import mongoose from 'mongoose';

export const getSummary = async (req, res) => {
    try {
        const totalUsersPromise = userModel.countDocuments();
        const totalOrdersPromise = orderModel.countDocuments({ payment: true });
        const totalRevenuePromise = orderModel.aggregate([
            { $match: { payment: true } },
            { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
        ]);
        const [userCount, orderCount, revenueResult] = await Promise.all([
            totalUsersPromise,
            totalOrdersPromise,
            totalRevenuePromise
        ]);
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

export const getTopProduct = async (req, res) => {
    try {
        const topProductAgg = await orderModel.aggregate([
            { $match: { payment: true } }, 
            { $unwind: "$items" }, 
            {
                $group: {
                    _id: { $toObjectId: "$items.productId" }, 
                    totalQuantity: { $sum: "$items.quantity" } 
                }
            },
            { $sort: { totalQuantity: -1 } }, 
            { $limit: 1 }, 
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: "$productDetails" }, 
            {
                $project: {
                    _id: 0,
                    name: "$productDetails.name",
                    image: { $arrayElemAt: ["$productDetails.image", 0] },
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

export const getTopCustomer = async (req, res) => {
    try {
        const topCustomerAgg = await orderModel.aggregate([
            { $match: { payment: true } }, 
            {
                $group: {
                    _id: { $toObjectId: "$userId" }, 
                    totalSpent: { $sum: "$amount" } 
                }
            },
            { $sort: { totalSpent: -1 } }, 
            { $limit: 1 }, 
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'customerDetails'
                }
            },
            { $unwind: "$customerDetails" }, 
            {
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