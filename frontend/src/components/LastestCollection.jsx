import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const LastestCollection = () => {
    
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);
  const [category, setCategory] = useState('All'); // State để lưu danh mục đang chọn

  useEffect(() => {
    let filtered = products.slice();

    // Lọc theo danh mục nếu không phải là 'All'
    if (category !== 'All') {
        filtered = filtered.filter(item => item.category === category);
    }

    // Lấy 10 sản phẩm mới nhất của danh mục đó
    setLatestProducts(filtered.slice(0, 10));
  }, [products, category]);

  return (
    <div className='my-10'>
      <div className='text-center py-8 text-3xl'>
        <Title text1={'LATEST'} text2={'COLLECTION'}/>
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Discover the newest arrivals from <b>Flora Gems</b>. Each piece is crafted to bring timeless elegance.
        </p>
        
        {/* --- CÁC NÚT LỌC DANH MỤC --- */}
        <div className='flex justify-center gap-4 mt-6'>
            {['All', 'Men', 'Women', 'Kids'].map((cat) => (
                <button 
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 text-sm border rounded-full transition-all duration-300 
                    ${category === cat ? 'bg-black text-white' : 'bg-white text-gray-700 border-gray-300 hover:border-black'}`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {/* Rendering Products */}
     <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {latestProducts.length > 0 ? (
            latestProducts.map((item, index) => (
            <ProductItem 
                key={index} 
                id={item._id} 
                image={item.image[0]} 
                name={item.name} 
                price={item.price} 
            />
            ))
        ) : (
            <p className="col-span-full text-center text-gray-500">No products found in this category.</p>
        )}
      </div>
    </div>
  )
}

export default LastestCollection