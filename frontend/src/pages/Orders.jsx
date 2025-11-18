import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';

const Orders = () => {
  const { backendUrl, token, currency, getOrderTotal, delivery_fee } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null); 
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [loading, setLoading] = useState(false);

  const loadOrderData = async () => {
    try {
      if (!token) return;
      const response = await axios.post(
        backendUrl + '/api/order/userorders',
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load orders');
    }
  };

  const toggleExpand = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancelReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/order/cancel",
        { 
          orderId: selectedOrder._id, 
          reason: cancelReason 
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully");
        if (response.data.refund) {
          toast.info(`Refund initiated: ${currency}${response.data.refund.amount}`, {
            autoClose: 5000
          });
        }
        setShowCancelModal(false);
        setCancelReason("");
        setSelectedOrder(null);
        loadOrderData(); 
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
        const statusColor = {
          'pending': 'text-yellow-600',
          'succeeded': 'text-green-600',
          'failed': 'text-red-600',
          'canceled': 'text-gray-600'
        };
        
        toast.info(
          <div>
            <p className="font-medium">Refund Status</p>
            <p className={statusColor[refund.status] || 'text-blue-600'}>
              {refund.status.toUpperCase()}: {currency}{refund.amount}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(refund.created).toLocaleDateString()}
            </p>
          </div>,
          { autoClose: 8000 }
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

  const canCancelOrder = (order) => {
    const cancelableStatuses = ['Order Placed', 'Packing'];
    return !order.cancelled && cancelableStatuses.includes(order.status);
  };

  const getStatusColor = (status, cancelled) => {
    if (cancelled) return 'bg-red-100 text-red-700';
    
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-700';
      case 'Order Placed':
        return 'bg-yellow-100 text-yellow-700';
      case 'Packing':
        return 'bg-blue-100 text-blue-700';
      case 'Shipped':
        return 'bg-purple-100 text-purple-700';
      case 'Out for delivery':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

      <div className="mt-6">
        {orders.map((order) => (
          <div key={order._id} className={`border rounded-xl shadow-sm p-6 mb-6 bg-white hover:shadow-md transition`}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Order <span className="text-blue-600">#{order._id.slice(-6)}</span>
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <p className="text-sm text-gray-500">
                    Date: <span className="font-medium">{new Date(order.date).toDateString()}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Payment: <span className="font-medium">{order.paymentMethod}</span>
                  </p>
                  <p className={`text-sm font-medium ${order.payment ? 'text-green-600' : 'text-red-600'}`}>
                    {order.payment ? '✓ Paid' : '✗ Pending'}
                  </p>
                </div>

                {/* Cancelled Info */}
                {order.cancelled && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-800 text-sm font-medium">❌ CANCELLED</p>
                    <p className="text-red-600 text-xs">Reason: {order.cancelReason}</p>
                    {order.cancelledAt && (
                      <p className="text-red-500 text-xs">
                        Cancelled on: {new Date(order.cancelledAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Refund Info */}
                {order.refund && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-blue-800 text-sm font-medium">
                      💰 Refund: {currency}{order.refund.amount}
                    </p>
                    <p className="text-blue-600 text-xs">
                      Status: <span className="font-medium">{order.refund.status?.toUpperCase()}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Status + Total + Actions */}
              <div className="flex flex-col md:items-end gap-3 mt-4 md:mt-0">
                {/* Status Badge */}
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status, order.cancelled)}`}
                >
                  {order.cancelled ? 'Cancelled' : order.status}
                </span>

                {/* Total */}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total: </span>
                  <span>
                    {currency} {(getOrderTotal(order.items) + delivery_fee).toFixed(2)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button onClick={() => toggleExpand(order._id)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100 transition">
                    {expandedOrderId === order._id ? 'Hide Details' : 'View Details'}
                  </button>

                  {/* Cancel Button - Only show for cancelable orders */}
                  {canCancelOrder(order) && (
                    <button
                      onClick={() => openCancelModal(order)}
                      className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                    >
                      Cancel Order
                    </button>
                  )}

                  {/* Check Refund Button - Only show for refunded orders */}
                  {order.refund && order.paymentMethod === 'Stripe' && (
                    <button
                      onClick={() => checkRefundStatus(order._id)}
                      className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                    >
                      Check Refund
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Order Details - Expanded View */}
            {expandedOrderId === order._id && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 border-b pb-2">Order Items</h4>
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <img
                        src={item.image} 
                        alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">Size: {item.size}</p>
                      <p className="text-sm text-gray-600">
                        {currency}{item.price} × {item.quantity} = {currency}{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Order Summary */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{currency} {(getOrderTotal(order.items)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee:</span>
                    <span>{currency} {delivery_fee}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>
                      {currency} {(getOrderTotal(order.items) + delivery_fee).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Shipping Address</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <p>{order.address.firstName} {order.address.lastName}</p>
                    <p>{order.address.street}</p>
                    <p>{order.address.city}, {order.address.state} {order.address.zipcode}</p>
                    <p>{order.address.country}</p>
                    <p>Phone: {order.address.phone}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Orders Message */}
      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No orders found</p>
          <p className="text-gray-400 text-sm mt-2">Your order history will appear here</p>
        </div>
      )}

      {/* 🔹 Cancel Order Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            {/* Header */}
            <div className="modal-header">
              <h3 className="modal-title">Cancel Order</h3>
            </div>
            
            <div className="modal-body">
              {/* Order Info */}
              <div className="order-info">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Order ID: <span className="text-blue-600">#{selectedOrder?._id.slice(-6)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Total Amount: <span className="font-medium">{currency}{selectedOrder?.amount}</span>
                </p>
              </div>
              
              {/* Refund Notice for Stripe Orders */}
              {selectedOrder?.paymentMethod === 'Stripe' && selectedOrder?.payment && (
                <div className="refund-notice">
                  <p className="refund-notice-title">
                    💰 Refund Information
                  </p>
                  <p className="refund-notice-text">
                    Since you paid via Stripe, a full refund of {currency}{selectedOrder.amount} will be processed automatically.
                  </p>
                  <p className="text-amber-600 text-xs mt-1">
                    Refunds typically take 5-10 business days to appear in your account.
                  </p>
                </div>
              )}

              {/* Reason Input */}
              <div>
                <label className="form-label required">
                  Why are you cancelling this order?
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason for cancellation..."
                  className="form-textarea"
                  rows="4"
                  maxLength="500"
                />
                <p className="character-count">
                  {cancelReason.length}/500 characters
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="modal-actions">
              <button
                onClick={closeCancelModal}
                className="btn btn-secondary"
                disabled={loading}
              >
                Keep Order
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
                  'Cancel Order'
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