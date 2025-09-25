import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';

const Orders = () => {
  const { backendUrl, token, currency, getOrderTotal, delivery_fee } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null); // order đang mở

  const loadOrderData = async () => {
    try {
      if (!token) return;
      const response = await axios.post(
        backendUrl + '/api/order/userorders',
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        // giữ nguyên danh sách orders (không flatten)
        setOrders(response.data.orders.reverse());
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  const toggleExpand = (index) => {
    setExpandedOrder(expandedOrder === index ? null : index);
  };

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

      <div className="mt-6">
        {orders.map((order, index) => (
          <div
            key={index}
            className="border rounded-xl shadow-sm p-6 mb-6 bg-white hover:shadow-md transition" >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Order <span className="text-blue-600">#{order._id.slice(-6)}</span>
                </h3>
                <p className="text-sm text-gray-500">
                  Date: <span className="font-medium">{new Date(order.date).toDateString()}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Payment: <span className="font-medium">{order.paymentMethod}</span>
                </p>
              </div>

              {/* Status + Total + Button */}
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                {/* Status */}
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    order.status === 'Delivered'
                      ? 'bg-green-100 text-green-700'
                      : order.status === 'Order Placed'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {order.status}
                </span>

                {/* Total */}
                <p className="text-base font-semibold text-gray-800">
                  Total: {currency} {getOrderTotal(order.items) + delivery_fee}
                </p>

                {/* Button */}
                <button
                  onClick={() => toggleExpand(index)}
                  className="ml-3 px-4 py-2 text-sm border rounded-md hover:bg-gray-100 transition"
                >
                  {expandedOrder === index ? 'Hide Details' : 'View Details'}
                </button>
              </div>
            </div>

            {/* Details */}
            {expandedOrder === index && (
              <div className="space-y-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 border-b pb-3">
                    <img
                      src={item.image[0]}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {currency}{item.price} × {item.quantity} ({item.size})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>


        ))}
      </div>
    </div>
  );
};

export default Orders;
