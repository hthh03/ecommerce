import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

const ProductItem = ({ id, image, name, price }) => {
    const { currency } = useContext(ShopContext);
    
    return (
        <Link className='text-gray-700 cursor-pointer' to={`/product/${id}`}>
            <div className='overflow-hidden rounded-md'>
                <img 
                    className='w-full h-auto object-cover hover:scale-110 transition-transform duration-300 ease-in-out' 
                    src={image} 
                    alt={name}
                />
            </div>
            <p className='pt-3 pb-1 text-sm truncate'>{name}</p>
            <p className='text-sm font-medium'>{currency}{price}</p>
        </Link>
    );
};

export default ProductItem;