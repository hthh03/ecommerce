import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    if (!token) return;
    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: event.target.value },
        { headers: { token } }
      );
      if (response.data.success) {
        fetchAllOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const response = await axios.post(
        backendUrl + "/api/order/remove",
        { orderId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Order deleted successfully");
        fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div className="p-6">
      <h3 className="text-2xl font-semibold mb-6">Order Management</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={assets.parcel_icon}
                  alt="parcel"
                  className="w-12 h-12"
                />
                <div>
                  <p className="font-medium">
                    {order.address.firstName} {order.address.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{order.address.phone}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(order.date).toLocaleDateString()}
              </span>
            </div>

            {/* Items */}
            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-2">Products:</h4>
              <div className="space-y-1">
                {order.items.map((item, i) => (
                  <p key={i} className="text-sm text-gray-700">
                    {item.name} x {item.quantity}{" "}
                    <span className="text-xs text-gray-500">{item.size}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Payment & Amount */}
            <div className="mb-4">
              <p className="text-sm">
                Payment Method:{" "}
                <span className="font-medium">{order.paymentMethod}</span>
              </p>
              <p
                className={`text-sm font-medium ${
                  order.payment ? "text-green-600" : "text-red-600"
                }`}
              >
                {order.payment ? "Done" : "Pending"}
              </p>
              <p className="font-semibold">
                {currency} {order.amount}
              </p>
            </div>

            {/* Status */}
            <div className="mb-4">
              <label className="text-sm font-medium block mb-1">
                Order Status:
              </label>
              <select
                onChange={(event) => statusHandler(event, order._id)}
                value={order.status}
                className="p-2 border rounded w-full text-sm"
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
              <button
                onClick={() => deleteOrder(order._id)}
                className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <p className="text-gray-500 text-center mt-10">No orders available.</p>
      )}
    </div>
  );
};

export default Orders;
