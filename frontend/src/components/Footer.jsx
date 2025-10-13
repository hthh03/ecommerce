import { assets } from '../assets/assets'
import { FaFacebookF, FaInstagram, FaTwitter, FaPinterest } from "react-icons/fa";

const Footer = () => {
  return (
    <div>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
        
        <div>
          <img src={assets.logo} className='mb-5 w-52' alt='Flora Gems Logo'/>
          <p className='w-full md:w-2/3 text-gray-600'>
            At <b>Flora Gems</b>, we believe jewelry is not just an accessory, but a
            way to express elegance, individuality, and timeless beauty. Discover our
            carefully crafted collections designed to make you shine in every moment.
          </p>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>COMPANY</p>
          <ul className='flex flex-col gap-1 text-gray-600 cursor-pointer'>
            <li>Home</li>
            <li>About Us</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
            <li>Contact</li>
          </ul>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>CUSTOMER CARE</p>
          <ul className='flex flex-col gap-1 text-gray-600 cursor-pointer'>
            <li>FAQs</li>
            <li>Return & Exchange</li>
            <li>Track Your Order</li>
            <li>Terms & Conditions</li>
          </ul>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-1 text-gray-600'>
            <li>+84 0905-726-432</li>
            <li>floragems@gmail.com</li>
            <li>123 Diamond Street, Da Nang, Vietnam</li>
          </ul>
          
          <div className='flex gap-4 mt-4 text-gray-600 text-lg'>
            <FaFacebookF className='cursor-pointer hover:text-black transition'/>
            <FaInstagram className='cursor-pointer hover:text-black transition'/>
            <FaTwitter className='cursor-pointer hover:text-black transition'/>
            <FaPinterest className='cursor-pointer hover:text-black transition'/>
          </div>
        </div>
      </div>

      <div>
        <hr/>
        <p className='py-5 text-sm text-center text-gray-600'>
          © 2025 floragems.com - All Rights Reserved
        </p>
      </div>
    </div>
  )
}

export default Footer
