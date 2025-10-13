import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [loading, setLoading] = useState(false);

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
  
  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancelReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/order/admin-cancel",
        { 
          orderId: selectedOrder._id, 
          reason: cancelReason 
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully");
        if (response.data.refund) {
          toast.info(`Refund initiated: ${currency}${response.data.refund.amount}`);
        }
        setShowCancelModal(false);
        setCancelReason("");
        setSelectedOrder(null);
        fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkRefundStatus = async (orderId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/refund-status",
        { orderId },
        { headers: { token } }
      );

      if (response.data.success && response.data.refund) {
        const refund = response.data.refund;
        toast.info(
          `Refund Status: ${refund.status.toUpperCase()} - ${currency}${refund.amount}`,
          { autoClose: 5000 }
        );
      } else {
        toast.info("No refund found for this order");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const openCancelModal = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancelReason("");
    setSelectedOrder(null);
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
            className={`bg-white p-5 rounded-xl shadow hover:shadow-lg transition ${
              order.cancelled ? 'border-l-4 border-red-500 bg-red-50' : ''
            }`}
          >
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

            {order.cancelled && (
              <div className="mb-4 p-2 bg-red-100 border border-red-200 rounded">
                <p className="text-red-800 text-sm font-medium">
                  ❌ CANCELLED
                </p>
                <p className="text-red-600 text-xs">
                  Reason: {order.cancelReason}
                </p>
                {order.cancelledAt && (
                  <p className="text-red-500 text-xs">
                    Date: {new Date(order.cancelledAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

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

              {order.refund && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-blue-800 text-xs font-medium">
                    💰 Refund: {currency}{order.refund.amount}
                  </p>
                  <p className="text-blue-600 text-xs">
                    Status: {order.refund.status?.toUpperCase()}
                  </p>
                </div>
              )}
            </div>

            {!order.cancelled && (
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
            )}

            <div className="flex justify-between gap-2">
              {!order.cancelled && 
               ['Order Placed', 'Packing'].includes(order.status) && (
                <button
                  onClick={() => openCancelModal(order)}
                  className="px-3 py-2 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600"
                >
                  Cancel
                </button>
              )}

              {order.refund && order.paymentMethod === 'Stripe' && (
                <button
                  onClick={() => checkRefundStatus(order._id)}
                  className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                >
                  Check Refund
                </button>
              )}

              <button
                onClick={() => deleteOrder(order._id)}
                className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
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

      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-container">
          
            <div className="modal-header">
              <h3 className="modal-title">Cancel Order</h3>
            </div>
            
            <div className="modal-body">
            
              <div className="order-info">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Order ID: <span className="text-blue-600">#{selectedOrder?._id.slice(-6)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Customer: <span className="font-medium">{selectedOrder?.address.firstName} {selectedOrder?.address.lastName}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Total Amount: <span className="font-medium">{currency}{selectedOrder?.amount}</span>
                </p>
              </div>

              {selectedOrder?.paymentMethod === 'Stripe' && selectedOrder?.payment && (
                <div className="refund-notice">
                  <p className="refund-notice-title">
                    ⚠️ Automatic Refund Warning
                  </p>
                  <p className="refund-notice-text">
                    This order was paid via Stripe. A refund of {currency}{selectedOrder.amount} will be processed automatically if you proceed.
                  </p>
                </div>
              )}

              <div>
                <label className="form-label required">
                  Cancellation Reason:
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter reason for cancellation..."
                  className="form-textarea"
                  rows="3"
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                onClick={closeCancelModal}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleCancelOrder}
                className="btn btn-danger"
                disabled={loading || !cancelReason.trim()}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Processing...
                  </>
                ) : (
                  'Confirm Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;