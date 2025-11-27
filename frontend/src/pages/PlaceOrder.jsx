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
  const { backendUrl, token, setToken, cartItems, setCartItems, getCartAmount, delivery_fee, products, getProductsData } = useContext(ShopContext);

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

  const formatPrice = (price) => {
    const num = parseFloat(price);
    if (isNaN(num)) return 0;
    return Math.round(num * 100) / 100;
  };

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
    
    if (!token) {
        toast.error("You must be logged in to place an order.");
        navigate('/login');
        return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.street.trim()) {
      toast.error('Please fill in all required delivery information.');
      return;
    }

    try {
      let orderItems = [];

      for (const itemId in cartItems) {
            const productInfo = products.find((product) => product._id === itemId);
            if (productInfo) {
                for (const size in cartItems[itemId]) {
                    if (cartItems[itemId][size] > 0) {
                        orderItems.push({
                            productId: productInfo._id,
                            name: productInfo.name,
                            price: formatPrice(productInfo.price),
                            image: productInfo.image[0],
                            size: size,
                            quantity: cartItems[itemId][size]
                        });
                    }
                }
            }
        }
      
      if (orderItems.length === 0) {
        toast.error('Your cart is empty');
        return;
      }

      const orderData = {
        address: formData,
        items: orderItems,
        amount: getTotalAmount(), 
      };

      switch (method) {
        case 'cod': {
          const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } });
          if (response.data.success) {
            setCartItems({});
            await getProductsData(); 
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
              origin: window.location.origin 
            }
          });
          
          if (responseStripe.data.success) {
            const { session_url } = responseStripe.data;
            window.location.replace(session_url);
          } else {
            if (responseStripe.data.message.includes("Not Authorized")) {
                setToken('');
                localStorage.removeItem('token');
                toast.error("Session expired. Please login again.");
                navigate('/login');
            } else {
                toast.error(responseStripe.data.message);
            }
          }
          break; 
        }
        
        default:
          toast.error('Please select a payment method');
          break;
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const inputStyle = "w-full border border-gray-300 rounded-md px-4 py-2.5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors bg-white";

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] pt-10 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        <div className="flex-1 flex flex-col gap-6">
          <div className="text-2xl font-medium">
            <Title text1={'DELIVERY'} text2={'INFORMATION'} />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input required name="firstName" value={formData.firstName} onChange={onChangeHandler} className={inputStyle} type="text" placeholder="First name" />
            <input required name="lastName" value={formData.lastName} onChange={onChangeHandler} className={inputStyle} type="text" placeholder="Last name" />
          </div>
          
          <input required name="email" value={formData.email} onChange={onChangeHandler} className={inputStyle} type="email" placeholder="Email address" />
          <input required name="street" value={formData.street} onChange={onChangeHandler} className={inputStyle} type="text" placeholder="Street address" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input required name="city" value={formData.city} onChange={onChangeHandler} className={inputStyle} type="text" placeholder="City" />
            <input required name="state" value={formData.state} onChange={onChangeHandler} className={inputStyle} type="text" placeholder="State/Province" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input required name="zipcode" value={formData.zipcode} onChange={onChangeHandler} className={inputStyle} type="number" placeholder="Zipcode" />
            <input required name="country" value={formData.country} onChange={onChangeHandler} className={inputStyle} type="text" placeholder="Country" />
          </div>
          
          <input required name="phone" value={formData.phone} onChange={onChangeHandler} className={inputStyle} type="tel" placeholder="Phone number" />
        </div>

        <div className="flex-1 lg:max-w-[450px]">
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <CartTotal />

            <div className="mt-8">
              <h3 className="text-md font-semibold text-gray-700 mb-4 uppercase tracking-wide">Payment Method</h3>
              
              <div className="flex flex-col gap-3">
                <div 
                  onClick={() => setMethod('stripe')} 
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all duration-200 ${method === 'stripe' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-200 hover:bg-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${method === 'stripe' ? 'border-green-600' : 'border-gray-400'}`}>
                        {method === 'stripe' && <div className="w-2 h-2 bg-green-600 rounded-full"></div>}
                    </div>
                    <span className="font-medium text-gray-700">Stripe (Credit Card)</span>
                  </div>
                  <img className="h-6" src={assets.stripe_logo} alt="Stripe" />
                </div>

                <div 
                  onClick={() => setMethod('cod')} 
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all duration-200 ${method === 'cod' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-200 hover:bg-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${method === 'cod' ? 'border-green-600' : 'border-gray-400'}`}>
                         {method === 'cod' && <div className="w-2 h-2 bg-green-600 rounded-full"></div>}
                    </div>
                    <span className="font-medium text-gray-700">Cash on Delivery</span>
                  </div>
                  <span className="text-gray-400 text-sm">Pay when you receive</span>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-black text-white mt-8 py-4 rounded-lg font-semibold text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-md"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>

      </div>
    </form>
  );
};

export default PlaceOrder;