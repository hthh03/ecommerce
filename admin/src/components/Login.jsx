import React, { useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi' // Import icons

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false) // State để bật/tắt mật khẩu
  const [isLoading, setIsLoading] = useState(false)

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault()
      setIsLoading(true)
      
      const response = await axios.post(backendUrl + '/api/user/admin', { email, password })
      
      if (response.data.success) {
        setToken(response.data.token)
        toast.success('Welcome back, Admin!')
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        
        {/* Header Section */}
        <div className='text-center'>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Admin Portal
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Please sign in to access the dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className='bg-white py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-gray-100'>
          <form className='space-y-6' onSubmit={onSubmitHandler}>
            
            {/* Email Input */}
            <div>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                Email Address
              </label>
              <div className='mt-1 relative rounded-md shadow-sm'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FiMail className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='email'
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  type='email'
                  required
                  className='focus:ring-black focus:border-black block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 transition-all'
                  placeholder='admin@example.com'
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
                Password
              </label>
              <div className='mt-1 relative rounded-md shadow-sm'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FiLock className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='password'
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  type={showPassword ? 'text' : 'password'} // Logic bật tắt type
                  required
                  className='focus:ring-black focus:border-black block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md py-3 transition-all'
                  placeholder='••••••••'
                />
                {/* Nút Bật/Tắt Mật khẩu */}
                <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='text-gray-400 hover:text-gray-600 focus:outline-none'
                  >
                    {showPassword ? (
                      <FiEyeOff className='h-5 w-5' />
                    ) : (
                      <FiEye className='h-5 w-5' />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type='submit'
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <span className='flex items-center'>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Flora Gems Administrator
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login