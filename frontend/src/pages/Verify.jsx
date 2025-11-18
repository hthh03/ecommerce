import React, { useContext, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Verify = () => {
    const { token, backendUrl } = useContext(ShopContext);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const success = searchParams.get('success');
    const orderId = searchParams.get('orderId');

    const verifyPayment = async () => {
        console.log("Attempting to verify payment. Token available:", !!token);

        if (!token) {
            return;
        }

        try {
            console.log("Sending verification request to backend with orderId:", orderId);
            const response = await axios.post(
                `${backendUrl}/api/order/verifyStripe`,
                { success, orderId },
                { headers: { token } }
            );

            console.log("Backend response:", response.data);

            if (response.data.success) {
                toast.success("Payment Successful!");
                navigate('/orders');
            } else {
                toast.error("Payment Failed or Cancelled.");
                navigate('/'); 
            }
        } catch (error) {
            console.error("Verification API call failed:", error);
            toast.error("An error occurred during payment verification.");
            navigate('/'); 
        }
    };

    useEffect(() => {
        if (token && success && orderId) {
            verifyPayment();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, success, orderId]); // Phụ thuộc vào token, success, và orderId

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-black"></div>
            <p className="text-gray-600 text-lg">Verifying your payment, please wait...</p>
        </div>
    );
};

export default Verify;