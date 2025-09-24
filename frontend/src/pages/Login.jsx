import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      let response;
      if (currentState === 'Sign Up') {
        response = await axios.post(`${backendUrl}/api/user/register`, { name, email, password });
      } else {
        response = await axios.post(`${backendUrl}/api/user/login`, { email, password });
      }

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        toast.success(`${currentState === 'Sign Up' ? 'Account created' : 'Logged in'} successfully!`);
        setName(''); setEmail(''); setPassword('');
      } else {
        toast.error(response.data.message || 'Something went wrong');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Network error';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {currentState === 'Sign Up' && (
        <input onChange={(e) => setName(e.target.value)} value={name} type="text" placeholder="Full Name"
          className="w-full px-3 py-2 border border-gray-800" required disabled={isLoading} />
      )}

      <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder="Email Address"
        className="w-full px-3 py-2 border border-gray-800" required disabled={isLoading} />

     {/* Password */}
      <div className="relative w-full">
        <input
          onChange={(e) => setPassword(e.target.value)} 
          value={password}
          type={showPassword ? "text" : "password"} 
          placeholder="Password"
          className="w-full px-3 py-2 pr-10 border border-gray-800"
          required 
          disabled={isLoading} 
          minLength="6"
        />
        <button 
          type="button" 
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
        >
          {showPassword ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Forgot Password + Toggle Login/Signup */}
      <div className="w-full flex justify-between text-sm mt-[-8px]">
        {currentState === 'Login' ? (
          <p onClick={() => navigate('/forgot-password')} className="cursor-pointer hover:text-gray-600">Forgot Your Password?</p>
        ) : (
          <p onClick={() => setCurrentState('Login')} className="cursor-pointer hover:text-gray-600">Already have account?</p>
        )}

        {currentState === 'Login' ? (
          <p onClick={() => setCurrentState('Sign Up')} className="cursor-pointer hover:text-gray-600">Create Account</p>
        ) : (
          <p onClick={() => setCurrentState('Login')} className="cursor-pointer hover:text-gray-600">Login Here</p>
        )}
      </div>

      <button type="submit" disabled={isLoading}
        className="bg-black text-white font-light px-8 py-2 mt-4 hover:bg-gray-800 disabled:opacity-50">
        {isLoading ? "Please wait..." : (currentState === 'Login' ? 'Sign In' : 'Sign Up')}
      </button>
    </form>
  );
};

export default Login;
