import { useContext, useEffect, useState } from 'react'
import Title from '../components/Title'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';
import { toast } from 'react-toastify'; // 1. Import toast

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate, token } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  
  // 2. Thêm state để theo dõi lỗi
  const [stockError, setStockError] = useState({}); // { "productId_size": true }

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item]
            })
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products]);

  const handleCheckout = () => {
    if (cartData.length === 0) return;
    
    if (!token) {
      navigate('/login');
    } else {
      navigate('/place-order');
    }
  }

  // 3. Hàm xử lý thay đổi số lượng MỚI
  const handleQuantityChange = (e, item, maxStock) => {
    const newValue = Number(e.target.value);
    const key = `${item._id}_${item.size}`; // Khóa duy nhất cho item + size

    if (newValue > maxStock) {
      // Nếu số lượng mới VƯỢT QUÁ tồn kho
      toast.error(`Only ${maxStock} items available for this size.`);
      e.target.value = maxStock; // Đặt giá trị input về tối đa
      updateQuantity(item._id, item.size, maxStock); // Cập nhật giỏ hàng về tối đa
      setStockError(prev => ({ ...prev, [key]: true })); // Đặt trạng thái lỗi (viền đỏ)
    
    } else if (newValue <= 0) {
      // Nếu xóa (đặt về 0 hoặc số âm)
      setStockError(prev => ({ ...prev, [key]: false }));
      updateQuantity(item._id, item.size, 0); // Xóa khỏi giỏ hàng
    
    } else {
      // Nếu số lượng hợp lệ
      setStockError(prev => ({ ...prev, [key]: false })); // Xóa trạng thái lỗi
      updateQuantity(item._id, item.size, newValue); // Cập nhật giỏ hàng
    }
  };

  return (
    <div className='border-t pt-14'>
      <div className='text-2xl mb-3'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>
      
      <div>
        {
          cartData.map((item, index) => {
            const productData = products.find((product) => product._id === item._id);

            // 4. Lấy số lượng tồn kho tối đa
            let maxStock = 0;
            if (productData && productData.sizes) {
              const sizeInfo = productData.sizes.find(s => s.size === item.size);
              if (sizeInfo) {
                maxStock = sizeInfo.stock; // Đây là số lượng tối đa
              }
            }
            const key = `${item._id}_${item.size}`;
            const isError = stockError[key] === true;
            
            if (!productData) return null; // Bỏ qua nếu sản phẩm không còn tồn tại

            return (
              <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                <div className='flex items-start gap-6'>
                  <img className='w-16 sm:w-20' src={productData.image[0]} alt='' />
                  <div>
                    <p className='text-xs sm:text-lg font-medium'>{productData.name}</p>
                    <div className='flex items-center gap-5 mt-2'>
                      <p> {currency}{productData.price}</p>
                      <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50'>{item.size}</p>
                    </div>
                    {/* Hiển thị số lượng tồn kho (tùy chọn) */}
                    {maxStock > 0 && maxStock <= 10 && (
                       <p className='text-xs text-red-500 mt-1'>Only {maxStock} left in stock!</p>
                    )}
                  </div>
                </div>

                {/* 5. Cập nhật Input */}
                <input 
                  onChange={(e) => handleQuantityChange(e, item, maxStock)}
                  // Thêm class viền đỏ nếu có lỗi
                  className={`border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1 rounded ${
                    isError 
                      ? 'border-red-500 ring-1 ring-red-500' 
                      : 'border-gray-300'
                  }`} 
                  type='number' 
                  min={1}
                  max={maxStock} // Thêm thuộc tính max của HTML5
                  defaultValue={item.quantity}
                />
                
                <img onClick={() => updateQuantity(item._id, item.size, 0)} className='w-4 mr-4 sm:w-5 cursor-pointer' src={assets.bin_icon} alt='' />
              </div>
            )
          })
        }
      </div>

      <div className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px]'>
          <CartTotal />
          {!token && cartData.length > 0 && (
            <p className='text-sm text-orange-600 mb-2'>
              Please login to continue checkout
            </p>
          )}
          <button 
            onClick={handleCheckout} 
            disabled={cartData.length === 0}
            className={`text-sm my-8 px-8 py-3 w-full
              ${cartData.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-black text-white active:bg-gray-700'}`}
          >
            {!token ? 'LOGIN TO CHECKOUT' : 'PROCEED TO CHECKOUT'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Cart