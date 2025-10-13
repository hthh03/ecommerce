import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {
  const { 
    products, 
    search, 
    showSearch, 
    category, 
    setCategory, 
    subCategory, 
    setSubCategory, 
    showFilter, 
    setShowFilter 
  } = useContext(ShopContext);

  const [filterProducts, setFilterProducts] = useState([]);
  const [sortType, setSortType] = useState('relevant');

  const toggleCategory = (e) => {
    const value = e.target.value;
    if (category.includes(value)) {
      setCategory(prev => prev.filter(c => c !== value));
    } else {
      setCategory(prev => [...prev, value]);
    }
  }

  const toggleSubCategory = (e) => {
    const value = e.target.value;
    if (subCategory.includes(value)) {
      setSubCategory(prev => prev.filter(c => c !== value));
    } else {
      setSubCategory(prev => [...prev, value]);
    }
  }

  const applyFilter = () => {
    let filtered = products.slice();

    if (showSearch && search) {
      filtered = filtered.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
    }

    if (category.length > 0) {
      filtered = filtered.filter(item => category.includes(item.category));
    }

    if (subCategory.length > 0) {
      filtered = filtered.filter(item => subCategory.includes(item.subCategory));
    }

    setFilterProducts(filtered);
  }

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();
    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a, b) => a.price - b.price));
        break;
      case 'high-low':
        setFilterProducts(fpCopy.sort((a, b) => b.price - a.price));
        break;
      default:
        applyFilter();
        break;
    }
  }

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch, products]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>

      <div className='min-w-60'>
        <p 
          onClick={() => setShowFilter(!showFilter)} 
          className='my-2 text-xl flex items-center cursor-pointer gap-2'>
          FILTERS
        </p>
        <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt=""/>

        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' :'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {['Men','Women','Kids'].map(cat => (
              <p key={cat} className='flex gap-2 items-center'>
                <input 
                  className='w-3' 
                  type="checkbox" 
                  value={cat} 
                  onChange={toggleCategory} 
                  checked={category.includes(cat)} 
                /> 
                {cat}
              </p>
            ))}
          </div>
        </div>

        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' :'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>TYPE</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {['Ring','Necklace','Bracelet'].map(sub => (
              <p key={sub} className='flex gap-2 items-center'>
                <input 
                  className='w-3' 
                  type="checkbox" 
                  value={sub} 
                  onChange={toggleSubCategory} 
                  checked={subCategory.includes(sub)} 
                /> 
                {sub}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className='flex-1'>
        <div className='flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1={'ALL'} text2={'COLLECTIONS'}/>
          
          <select 
            onChange={(e) => setSortType(e.target.value)} 
            className='border-2 border-gray-300 text-sm px-2'>
            <option value="relevant">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {filterProducts.map((item, index) => (
            <ProductItem 
              key={index} 
              id={item._id} 
              image={item.image} 
              name={item.name} 
              price={item.price} 
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Collection;
