import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';

const Orders = () => {
  const { backendUrl, token, currency, getOrderTotal, delivery_fee, getProductsData } = useContext(ShopContext);
  
  // --- State cho Đơn hàng ---
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null); 
  const [loading, setLoading] = useState(false);

  // --- State cho Hủy Đơn ---
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  // --- State cho Bình luận (Review/Comment) ---
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null); 
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Xác định là Viết mới hay Sửa

  // Tải danh sách đơn hàng
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

  // --- HÀM XỬ LÝ HỦY ĐƠN ---
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
        
        // 2. GỌI HÀM NÀY ĐỂ CẬP NHẬT LẠI SỐ LƯỢNG TỒN KHO TỨC THÌ
        await getProductsData(); 

        setShowCancelModal(false);
        setCancelReason("");
        setSelectedOrder(null);
        loadOrderData(); // Tải lại danh sách đơn hàng
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM MỞ MODAL BÌNH LUẬN (KIỂM TRA REVIEW CŨ) ---
  const openReviewModal = async (product, orderId) => {
    setReviewProduct({ ...product, orderId });
    setReviewLoading(true); // Hiển thị loading khi đang check

    try {
        // Gọi API kiểm tra xem user đã review sản phẩm này trong đơn này chưa
        // (Bạn cần đảm bảo backend đã có route /api/review/user-review như hướng dẫn trước)
        const response = await axios.post(
            backendUrl + "/api/review/user-review",
            { productId: product.productId, orderId: orderId },
            { headers: { token } }
        );

        if (response.data.success) {
            // Đã có review -> Chế độ EDIT
            setIsEditMode(true);
            setReviewComment(response.data.review.comment); // Điền sẵn comment cũ
        } else {
            // Chưa có review -> Chế độ ADD
            setIsEditMode(false);
            setReviewComment("");
        }
        setShowReviewModal(true);

    } catch (error) {
        console.error(error);
        // Nếu lỗi (ví dụ 404 not found), mặc định là Add mới
        setIsEditMode(false);
        setReviewComment("");
        setShowReviewModal(true);
    } finally {
        setReviewLoading(false);
    }
  };

  // --- HÀM GỬI BÌNH LUẬN (ADD HOẶC EDIT) ---
  const handleReviewSubmit = async () => {
    if (!reviewComment.trim()) {
      toast.error("Please provide a comment");
      return;
    }
    setReviewLoading(true);
    
    try {
      // Xác định API endpoint dựa trên chế độ
      const endpoint = isEditMode ? "/api/review/edit" : "/api/review/add";
      
      const response = await axios.post(
        backendUrl + endpoint,
        {
          productId: reviewProduct.productId, 
          orderId: reviewProduct.orderId,
          comment: reviewComment
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(isEditMode ? "Comment updated!" : "Comment submitted!");
        closeReviewModal();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setReviewLoading(false);
    }
  };

  // Các hàm helper nhỏ
  const closeReviewModal = () => {
    setShowReviewModal(false);
    setReviewProduct(null);
    setReviewComment("");
  };
  
  const openCancelModal = (order) => { setSelectedOrder(order); setShowCancelModal(true); };
  const closeCancelModal = () => { setShowCancelModal(false); setCancelReason(""); setSelectedOrder(null); };
  
  const checkRefundStatus = async (orderId) => {
     try {
       const res = await axios.post(backendUrl + "/api/order/refund-status", { orderId }, { headers: { token } });
       if (res.data.success && res.data.refund) {
         toast.info(`Refund Status: ${res.data.refund.status.toUpperCase()} - ${currency}${res.data.refund.amount}`);
       } else { toast.info("No refund found"); }
     } catch (e) { toast.error(e.message); }
  };

  const getStatusColor = (status, cancelled) => { 
    if (cancelled) return 'bg-red-100 text-red-700';
    if (status === 'Delivered') return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
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
        {/* KIỂM TRA: Nếu có đơn hàng thì map, không có thì hiện thông báo */}
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order._id} className="border rounded-xl shadow-sm p-6 mb-6 bg-white hover:shadow-md transition">
              
              {/* --- HEADER ĐƠN HÀNG --- */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Order <span className="text-blue-600">#{order._id.slice(-6)}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                     <p className="text-sm text-gray-500">Date: {new Date(order.date).toDateString()}</p>
                     <p className="text-sm text-gray-500">Payment: {order.paymentMethod}</p>
                  </div>
                  {/* Hiển thị lý do hủy */}
                  {order.cancelled && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-800 text-sm font-medium">❌ CANCELLED</p>
                      <p className="text-red-600 text-xs">Reason: {order.cancelReason || 'N/A'}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:items-end gap-3 mt-4 md:mt-0">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status, order.cancelled)}`}>
                    {order.cancelled ? 'Cancelled' : order.status}
                  </span>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total: {currency} {(getOrderTotal(order.items) + delivery_fee).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex gap-2">
                     <button onClick={() => toggleExpand(order._id)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100">
                        {expandedOrderId === order._id ? 'Hide Details' : 'View Details'}
                     </button>
                     {/* Nút Hủy chỉ hiện khi chưa giao hàng */}
                     {!order.cancelled && ['Order Placed', 'Packing'].includes(order.status) && (
                        <button onClick={() => openCancelModal(order)} className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-md">Cancel</button>
                     )}
                     {order.refund && order.paymentMethod === 'Stripe' && (
                        <button onClick={() => checkRefundStatus(order._id)} className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md">Refund Status</button>
                     )}
                  </div>
                </div>
              </div>

              {/* --- CHI TIẾT SẢN PHẨM (MỞ RỘNG) --- */}
              {expandedOrderId === order._id && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 border-b pb-2">Order Items</h4>
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">Size: {item.size} | Qty: {item.quantity}</p>
                        <p className="text-sm text-gray-600">{currency}{item.price}</p>
                      </div>

                      {/* NÚT COMMENT / EDIT - Chỉ hiện khi đã giao hàng */}
                      {order.status === 'Delivered' && (
                        <button
                          onClick={() => openReviewModal(item, order._id)}
                          className="px-4 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition self-center shadow-sm whitespace-nowrap"
                        >
                          Write / Edit Comment
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {/* Địa chỉ giao hàng */}
                  <div className="border-t pt-4">
                     <p className="text-sm text-gray-600 font-medium">Delivery Address:</p>
                     <p className="text-sm text-gray-500">
                       {order.address.firstName} {order.address.lastName}, {order.address.street}, {order.address.city}
                     </p>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          // --- GIAO DIỆN KHI CHƯA CÓ ĐƠN HÀNG ---
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <p className="text-4xl grayscale">📦</p> 
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">You have no orders yet</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Looks like you haven't made your choice yet. Explore our collection and find something you love!
            </p>
            <a 
              href="/collection" 
              className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors shadow-lg"
            >
              Start Shopping
            </a>
          </div>
        )}
      </div>

      {/* --- MODAL HỦY ĐƠN --- */}
      {showCancelModal && (
         <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header"><h3 className="modal-title">Cancel Order</h3></div>
                <div className="modal-body">
                    <div className="order-info">
                        <p className="text-sm text-gray-600">Are you sure you want to cancel Order #{selectedOrder?._id.slice(-6)}?</p>
                    </div>
                    <label className="form-label required mt-3">Reason:</label>
                    <textarea 
                        className="form-textarea" 
                        value={cancelReason} 
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Why are you cancelling?"
                    />
                </div>
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={closeCancelModal}>Back</button>
                    <button className="btn btn-danger" onClick={handleCancelOrder} disabled={loading}>Confirm Cancel</button>
                </div>
            </div>
         </div>
      )}

      {/* --- MODAL BÌNH LUẬN (COMMENT ONLY) --- */}
      {showReviewModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">
                  {isEditMode ? 'Edit Your Comment' : 'Write a Comment'}
              </h3>
            </div>
            
            <div className="modal-body">
              {/* Thông tin sản phẩm */}
              <div className="flex items-center gap-4 mb-4 bg-gray-50 p-3 rounded-lg">
                <img src={reviewProduct.image} alt={reviewProduct.name} className="w-12 h-12 rounded object-cover" />
                <div>
                  <p className="font-medium text-sm">{reviewProduct.name}</p>
                  <p className="text-xs text-gray-500">Size: {reviewProduct.size}</p>
                </div>
              </div>

              {/* Ô nhập bình luận */}
              <div className="mt-2">
                <label className="form-label required">Your Experience:</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                  className="form-textarea"
                  rows="5"
                  maxLength="500"
                  disabled={reviewLoading} 
                />
                <p className="text-right text-xs text-gray-400 mt-1">{reviewComment.length}/500</p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={closeReviewModal}
                className="btn btn-secondary"
                disabled={reviewLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                className="btn btn-danger"
                disabled={reviewLoading || !reviewComment.trim()}
              >
                {reviewLoading ? 'Processing...' : (isEditMode ? 'Update Comment' : 'Submit Comment')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;