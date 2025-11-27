import React, { useContext, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Verify = () => {
    const { token, backendUrl, getProductsData, setCartItems } = useContext(ShopContext);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const success = searchParams.get('success');
    const orderId = searchParams.get('orderId');

    const verifyPayment = async () => {
        if (!token) return;

        try {
            const response = await axios.post(
                `${backendUrl}/api/order/verifyStripe`,
                { success, orderId },
                { headers: { token } }
            );

            if (response.data.success) {
                setCartItems({}); 
                await getProductsData();

                toast.success("Payment Successful!");
                navigate('/orders');
            } else {
                toast.error("Payment Failed or Cancelled.");
                navigate('/'); 
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during payment verification.");
            navigate('/'); 
        }
    };

    useEffect(() => {
        if (token && success && orderId) {
            verifyPayment();
        }
    }, [token, success, orderId]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-black"></div>
            <p className="text-gray-600 text-lg">Verifying your payment...</p>
        </div>
    );
};

export default Verify;