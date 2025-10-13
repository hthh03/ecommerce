import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const About = () => {
  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'}/>
      </div> 

      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px] rounded-lg' src={assets.about_img} alt='about us'/>
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'> 
          <p>
            Welcome to <b>Flora Gems</b> – an online jewelry store that brings you
            exquisite, modern designs while preserving timeless elegance and lasting
            value. We believe that every piece of jewelry is more than just an
            accessory; it is a story, a memory, and a reflection of your unique
            style.
          </p>
          <p>
            With a team of experienced artisans and a strict selection of premium
            materials, Flora Gems is committed to delivering high–quality products
            with sophisticated designs, suitable for every style from classic to
            contemporary.
          </p>
          <b className='text-gray-800'>Our Mission</b>
          <p>
            Our mission is to help you shine in every moment. We don’t just provide
            jewelry – we bring confidence, style, and inspiration so that you can
            always be the best version of yourself.
          </p>
        </div>
      </div>

      <div className='text-4xl py-4'>
        <Title text1={'WHY'} text2={'CHOOSE US'} />
      </div>

      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Quality Assurance :</b>
          <p className='text-gray-600'>
            Every product is crafted from premium materials and undergoes a strict
            quality inspection process to ensure durability, brilliance, and
            exceptional aesthetics.
          </p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Convenience :</b>
          <p className='text-gray-600'>
            Shop anytime, anywhere with our user-friendly interface, quick checkout
            process, and multiple secure payment options designed for your comfort.
          </p>
        </div>

        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Exceptional Customer Service :</b>
          <p className='text-gray-600'>
            Our dedicated customer support team is always ready to assist you – from
            product consultation and selection to after-sales service and warranty –
            ensuring you the best shopping experience.
          </p>
        </div>
      </div>
      <NewsletterBox />
    </div>
  )
}

export default About
