import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const Contact = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 border-t'>
        <Title text1={'CONTACT'} text2={'US'}/>
      </div>
      
      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28'>
        <img 
          className='w-full md:max-w-[480px] rounded-lg shadow-md' 
          src={assets.contact_img} 
          alt='contact us' 
        />
        <div className='flex flex-col justify-center items-start gap-6 text-gray-600'>
          <p className='font-semibold text-xl'>We’d love to hear from you!</p>
          <p>
            Whether you have a question about our collections, need assistance with
            your order, or simply want to share your feedback – our team is always
            ready to help. 
          </p>
          <p>
            <b>Tel:</b> +84 5726432 <br/>
            <b>Email:</b> floragems@gmail.com <br/>
            <b>Address:</b> 123 Diamond Street, Da Nang, Vietnam
          </p>
          <p className='font-semibold text-xl'>Working Hours</p>
          <p>
            Monday – Friday: 9:00 AM – 7:00 PM <br/>
            Saturday – Sunday: 10:00 AM – 5:00 PM
          </p>
          <button className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>
            Explore Jobs
          </button>
        </div>
      </div>
      <NewsletterBox />
    </div>
  )
}

export default Contact
