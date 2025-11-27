import React, { useContext, useEffect, useState } from 'react' 
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import RelatedProducts from '../components/RelatedProducts'
import axios from 'axios';
import { toast } from 'react-toastify';

const Product = () => {
  const {productId} = useParams();
  const {products, currency, addToCart, backendUrl, cartItems } = useContext(ShopContext);
  const [productData, setProductData] = useState(false); 
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [selectedSizeStock, setSelectedSizeStock] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('description');

  const handleSizeToggle = (selectedSizeObj) => {
        if (size === selectedSizeObj.size) {
            setSize('');
            setSelectedSizeStock(null);
        } else {
            setSize(selectedSizeObj.size);
            setSelectedSizeStock(selectedSizeObj.stock);
        }
    };
  
  const fetchProductData = async () => {
    if (!products || !Array.isArray(products) || products.length === 0) {
      return;
    }
    const foundProduct = products.find(item => item._id === productId);
    if (foundProduct) {
      setProductData(foundProduct);
      setImage(foundProduct.image[0]);
    }
  }

  const fetchReviews = async () => {
    if (!productId) return;
    try {
      const response = await axios.get(`${backendUrl}/api/review/list/${productId}`);
      if (response.data.success) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.log("Failed to fetch reviews", error);
    }
  };

  const handleAddToCart = () => {
    if (!size) {
      toast.error("Please select a size");
      return;
    }
    const currentQtyInCart = cartItems[productData._id]?.[size] || 0;

    if (currentQtyInCart >= selectedSizeStock) {
        toast.error(`Sorry, only ${selectedSizeStock} items available in stock!`);
        return;
    }
    addToCart(productData._id, size);
  };

  useEffect(() =>{
    fetchProductData();
  },[productId, products]); 

  useEffect(() => {
    if(productId) {
      fetchReviews(); 
    }
  }, [productId]);

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {
              productData.image && productData.image.map((item, index) => (
                <img 
                  onClick={() => setImage(item)} 
                  src={item} 
                  key={index} 
                  className={`w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer rounded-lg
                    ${image === item ? 'border-2 ' : 'border border-transparent'}`}
                />
              ))
            }
          </div>
          <div className='w-full sm:w-[80%]'>
            <img className='w-full h-auto' src={image} alt="" />
          </div>
        </div>


        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          
          <div className='flex items-center gap-2 mt-2'>
            {productData.numReviews > 0 ? (
              <p className='text-sm text-gray-600'>({productData.numReviews} reviews)</p>
            ) : (
              <p className='text-sm text-gray-500'></p>
            )}
          </div>
          
          <p className='mt-5 text-3xl font-medium'>{currency}{productData.price}</p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description} </p>

          <div className='flex flex-col gap-4 my-8'>
            <div className='flex items-center justify-between'>
              <p>Select Size</p>
            </div>
            <div className='flex gap-2'>
              {productData.sizes && productData.sizes.map((item, index) => (
                <button 
                    onClick={() => handleSizeToggle(item)} 
                    className={`border py-2 px-4 transition-all ${
                        item.size === size ? 'border-orange-500 bg-orange-50' : 'hover:border-gray-400'
                    } ${item.stock === 0 ? 'bg-gray-200 text-gray-400 line-through cursor-not-allowed' : ''}`}
                    key={index}
                    disabled={item.stock === 0}
                >
                    {item.size}
                </button>
            ))}
            </div>
            {size && (
            <p className='mt-2 text-sm'>
                {selectedSizeStock > 0 ? `In Stock: ${selectedSizeStock} available` : 'Out of Stock'}
            </p>
            )}
          </div>

          <button 
            onClick={handleAddToCart}
            className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed mt-4'
            disabled={!size || selectedSizeStock === 0}
            >
           ADD TO CART
          </button>
          
          <hr className='mt-8 sm:w-4/5'/>
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Original product</p>
            <p>Cash on delivery is available on this product.</p> 
            <p>Easy return and exchange policy within 7 days.</p> 
          </div>
        </div>
      </div>

      <div className='mt-20'>
        <div className='flex'>
          <b 
            onClick={() => setActiveTab('description')}
            className={`border px-5 py-3 text-sm cursor-pointer ${activeTab === 'description' ? 'bg-gray-100 border-b-transparent' : 'border-b-black'}`}
          >
            Description
          </b>
          <p 
            onClick={() => setActiveTab('reviews')}
            className={`border px-5 py-3 text-sm cursor-pointer ${activeTab === 'reviews' ? 'bg-gray-100 border-b-transparent' : 'border-b-black'}`}
          >
            Reviews ({reviews.length})
          </p>
        </div>

        {activeTab === 'description' && (
          <div className='flex flex-col gap-4 border border-t-0 px-6 py-6 text-sm text-gray-500'>
            <p>{productData.description}</p>
            <p> An e-commerce website is an online platform that facilitates the buying and selling of products or service .....</p>
            <p> E-commerce website typically display products or services along with detailed description ....</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className='border border-t-0 px-6 py-6 text-sm text-gray-500'>
            {reviews.length > 0 ? (
              <div className='space-y-6'>
                {reviews.map((review) => (
                  <div key={review._id} className="border-b pb-4">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800">{review.userName}</p>
                      <span className="text-xs text-gray-400">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No reviews for this product yet.</p>
            )}
          </div>
        )}
      </div>

      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
    </div>
  ) : <div className='opacity-0'></div> 
}

export default Product