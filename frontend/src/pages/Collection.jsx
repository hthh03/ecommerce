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
        subCategoryList,
    } = useContext(ShopContext);

    const [filterProducts, setFilterProducts] = useState([]);
    const [sortType, setSortType] = useState('relevant');
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(8); 

    const handleToggleCategory = (value) => {
        if (category.includes(value)) {
            setCategory(prev => prev.filter(c => c !== value));
        } else {
            setCategory(prev => [...prev, value]);
        }
    }

    const handleToggleSubCategory = (value) => {
        if (subCategory.includes(value)) {
            setSubCategory(prev => prev.filter(c => c !== value));
        } else {
            setSubCategory(prev => [...prev, value]);
        }
    }

    const clearFilters = () => {
        setCategory([]);
        setSubCategory([]);
        setSortType('relevant');
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
        let fpCopy = [...filterProducts];
        switch (sortType) {
            case 'low-high':
                setFilterProducts(fpCopy.sort((a, b) => a.price - b.price));
                break;
            case 'high-low':
                setFilterProducts(fpCopy.sort((a, b) => b.price - a.price));
                break;
            default:
                break;
        }
    }
    
    useEffect(() => {
        setCurrentPage(1); 
        applyFilter();
    }, [category, subCategory, search, showSearch, products]);

    useEffect(() => {
        sortProduct();
    }, [sortType]);

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filterProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filterProducts.length / productsPerPage); i++) {
        pageNumbers.push(i);
    }

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className='flex flex-col gap-8 pt-10 border-t'>
            <div className="w-full flex justify-center px-4">
                <div className='w-full max-w-5xl p-4 border rounded-lg bg-gray-50 flex flex-col gap-4'>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-lg">Filters</h3>
                        <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">Clear all filters</button>
                    </div>
                    <div className='flex flex-wrap items-center gap-4'>
                        <p className='font-medium min-w-[80px]'>Category:</p>
                        <div className='flex gap-2'>
                            {['Men', 'Women', 'Kids'].map(cat => (
                                <button key={cat} onClick={() => handleToggleCategory(cat)} className={`px-4 py-1.5 text-sm border rounded-md transition-colors ${category.includes(cat) ? 'bg-black text-white border-black' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className='flex flex-wrap items-center gap-4'>
                        <p className='font-medium min-w-[80px]'>Type:</p>
                        <div className="relative">
                            <button onClick={() => setIsTypeDropdownOpen(prev => !prev)} className="px-4 py-1.5 text-sm border rounded-md bg-white flex items-center gap-2">
                                Select product type {subCategory.length > 0 && `(${subCategory.length})`}
                                <img src={assets.dropdown_icon} alt="dropdown" className={`w-3 h-3 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isTypeDropdownOpen && (
                                <div className="absolute top-full mt-2 w-60 bg-white border rounded-lg shadow-lg z-10 p-4">
                                    <div className='flex flex-col gap-2 text-sm text-gray-700'>
                                        {subCategoryList.map(sub => (
                                            <label key={sub._id} className='flex gap-2 items-center cursor-pointer'>
                                                <input className='w-4 h-4 accent-black' type="checkbox" value={sub.name} onChange={() => handleToggleSubCategory(sub.name)} checked={subCategory.includes(sub.name)} /> 
                                                {sub.name}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className='flex-1 px-4'>
                <div className='flex justify-between text-base sm:text-2xl mb-4'>
                    <Title text1={'ALL'} text2={'COLLECTIONS'}/>
                    <select onChange={(e) => setSortType(e.target.value)} value={sortType} className='border-2 border-gray-300 text-sm px-2 py-1 rounded-md'>
                        <option value="relevant">Sort by: Relevant</option>
                        <option value="low-high">Sort by: Price Low to High</option>
                        <option value="high-low">Sort by: Price High to Low</option>
                    </select>
                </div>
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
                    {currentProducts.length > 0 ? (
                        currentProducts.map((item) => (
                            <ProductItem 
                                key={item._id} 
                                id={item._id} 
                                image={item.image[0]} 
                                name={item.name} 
                                price={item.price} 
                            />
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-500 py-10">No products found.</p>
                    )}
                </div>
            </div>

            {filterProducts.length > productsPerPage && (
                <div className="flex justify-center items-center gap-2 mt-10 mb-5">
                    {pageNumbers.map(number => (
                        <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`px-4 py-2 border rounded transition-colors ${
                                currentPage === number
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-black hover:bg-gray-100'
                            }`}
                        >
                            {number}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Collection;