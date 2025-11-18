import React, {useContext, useEffect, useState } from "react"
import { ShopContext } from "../context/ShopContext";
import Title from './Title';
import ProductItem from './ProductItem';

const BestSeller = () => {

    const { products } = useContext(ShopContext);
    const [bestSeller, setBestSeller] = useState([]);
    const [category, setCategory] = useState('All'); // State lọc danh mục

    useEffect(() => {
        // Lọc tất cả sản phẩm có flag 'bestseller' trước
        let bestProducts = products.filter((item) => item.bestseller);

        // Sau đó lọc theo category nếu được chọn
        if (category !== 'All') {
            bestProducts = bestProducts.filter(item => item.category === category);
        }

        setBestSeller(bestProducts.slice(0, 5));
    }, [products, category]);

  return (
    <div className="my-10">
        <div className="text-center text-3xl py-8">
            <Title text1={'BEST'} text2={'SELLERS'}/>
            <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
            Our bestsellers are handpicked pieces that combine artistry, sparkle, and timeless design.
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
            {bestSeller.length > 0 ? (
                bestSeller.map((item, index) => (
                <ProductItem 
                    key={index} 
                    id={item._id} 
                    image={item.image[0]} 
                    name={item.name} 
                    price={item.price}
                />
                ))
            ) : (
                <p className="col-span-full text-center text-gray-500">No bestsellers found in this category.</p>
            )}
        </div>
    </div>
  )
}

export default BestSeller