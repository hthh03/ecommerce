import React, { useContext, useState } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
  const [method, setMethod] = useState('cod');
  const navigate = useNavigate();
  const { backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: ''
  });

  // 🔹 NEW: Utility function to fix floating point precision
 const formatPrice = (price) => {
  const num = parseFloat(price);
  if (isNaN(num)) return 0;
  return Math.round(num * 100) / 100;
};

  // 🔹 NEW: Safe calculation of total amount
  const getTotalAmount = () => {
    const cartTotal = getCartAmount();
    const total = cartTotal + delivery_fee;
    return formatPrice(total);
  };

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    
    if (!formData.phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    try {
      let orderItems = [];

      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = JSON.parse(JSON.stringify(products.find((product) => product._id === items)));
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              // 🔹 IMPORTANT: Ensure price is properly formatted
              itemInfo.price = formatPrice(itemInfo.price);
              orderItems.push(itemInfo);
            }
          }
        }
      }

      // Check if cart is empty
      if (orderItems.length === 0) {
        toast.error('Your cart is empty');
        return;
      }

      const orderData = {
        address: formData,
        items: orderItems,
        amount: getTotalAmount(), // 🔹 Use safe calculation
      };

      // Debug log to check amounts
      console.log('Order Data:', {
        cartAmount: getCartAmount(),
        deliveryFee: delivery_fee,
        totalAmount: getTotalAmount(),
        items: orderItems.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      });

      switch (method) {
        //API Calls for COD
        case 'cod': {
          const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } });
          if (response.data.success) {
            setCartItems({});
            toast.success('Order placed successfully!');
            navigate('/orders');
          } else {
            toast.error(response.data.message);
          }
          break;
        }

        case 'stripe': {
          const responseStripe = await axios.post(backendUrl + '/api/order/stripe', orderData, {
            headers: { 
              token,
              origin: window.location.origin // Add origin for redirect URLs
            }
          });
          
          if (responseStripe.data.success) {
            const { session_url } = responseStripe.data;
            // Show loading message before redirect
            toast.info('Redirecting to payment...');
            window.location.replace(session_url);
          } else {
            toast.error(responseStripe.data.message);
          }
          break; 
        }
        
        default:
          toast.error('Please select a payment method');
          break;
      }
    } catch (error) {
      console.error('Order submission error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
      {/* Left Side */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={'DELIVERY'} text2={'INFORMATION'} />
        </div>
        <div className="flex gap-3">
          <input 
            required 
            onChange={onChangeHandler} 
            name="firstName" 
            value={formData.firstName} 
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full focus:border-black focus:outline-none" 
            type="text" 
            placeholder="First name" 
          />
          <input 
            required 
            onChange={onChangeHandler} 
            name="lastName" 
            value={formData.lastName} 
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full focus:border-black focus:outline-none" 
            type="text" 
            placeholder="Last name" 
          />
        </div>
        <input 
          required 
          onChange={onChangeHandler} 
          name="email" 
          value={formData.email} 
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full focus:border-black focus:outline-none" 
          type="email" 
          placeholder="Email address" 
        />
        <input 
          required 
          onChange={onChangeHandler} 
          name="street" 
          value={formData.street} 
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full focus:border-black focus:outline-none" 
          type="text" 
          placeholder="Street" 
        />
        <div className="flex gap-3">
          <input 
            required 
            onChange={onChangeHandler} 
            name="city" 
            value={formData.city} 
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full focus:border-black focus:outline-none" 
            type="text" 
            placeholder="City" 
          />
          <input 
            required 
            onChange={onChangeHandler} 
            name="state" 
            value={formData.state} 
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full focus:border-black focus:outline-none" 
            type="text" 
            placeholder="State" 
          />
        </div>
        <div className="flex gap-3">
          <input 
            required 
            onChange={onChangeHandler} 
            name="zipcode" 
            value={formData.zipcode} 
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full focus:border-black focus:outline-none" 
            type="number" 
            placeholder="Zipcode" 
          />
          <input 
            required 
            onChange={onChangeHandler} 
            name="country" 
            value={formData.country} 
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full focus:border-black focus:outline-none" 
            type="text" 
            placeholder="Country" 
          />
        </div>
        <input 
          required 
          onChange={onChangeHandler} 
          name="phone" 
          value={formData.phone} 
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full focus:border-black focus:outline-none" 
          type="tel" 
          placeholder="Phone" 
        />
      </div>

      {/* Right Side */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>
        <div className="mt-12">
          <Title text1={'PAYMENT'} text2={'METHOD'} />
          <div className="flex gap-3 flex-col lg:flex-row">
            <div 
              onClick={() => setMethod('stripe')} 
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer hover:border-gray-400 transition"
            >
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
              <img className="h-5 mx-4" src={assets.stripe_logo} alt="Stripe" />
            </div>
            <div 
              onClick={() => setMethod('cod')} 
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer hover:border-gray-400 transition"
            >
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
              <p className="text-gray-500 text-sm font-medium mx-4">CASH ON DELIVERY</p>
            </div>
          </div>
          
          {/* Payment method validation message */}
          {!method && (
            <p className="text-red-500 text-sm mt-2">Please select a payment method</p>
          )}
          
          <div className="w-full text-end mt-8">
            <button 
              type="submit" 
              className="bg-black text-white px-16 py-3 text-sm hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!method}
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;