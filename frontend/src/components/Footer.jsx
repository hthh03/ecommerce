import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div>
        <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

            <div>
                <img src={assets.Logo} className='mb-5 w-52' alt=''/>
                <p className='w-full md:w-2/3 text-gray-600'>
                Lorem is input...
                </p>
            </div>

            <div>
                <p className='text-xl font-medium mb-5'> COMPANY </p>
                <ul className='flex flex-col gap-1 text'>
                    <li>Home</li>
                    <li>About Us</li>
                    <li>Delivery</li>
                    <li>Privacy Policy</li>
                </ul>
            </div>

            <div>
                <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
                <ul className='flex flex-col gap-1 text-gray-600'>
                    <li>+84 0905-726-432</li>
                    <li>floragems@gmail.com</li>
                </ul>
            </div>    
        </div>

        <div>
            <hr/>
            <p className='py-5 text-sm text-center'>Copyright 2025@ floragems.com - All Rigt Reserved</p>
        </div>
    </div>
  )
}

export default Footer
