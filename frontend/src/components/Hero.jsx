import React from 'react';
import Slider from 'react-slick';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const customStyles = `
  .slick-prev, .slick-next {
    z-index: 20;
    width: 40px;
    height: 40px;
  }
  .slick-prev:before, .slick-next:before {
    display: none; /* Ẩn mũi tên mặc định xấu xí */
  }
  .slick-dots {
    bottom: 15px;
  }
  .slick-dots li button:before {
    font-size: 10px;
    color: #b0b0b0;
    opacity: 0.8;
  }
  .slick-dots li.slick-active button:before {
    color: #333;
    opacity: 1;
  }
`;

function SampleNextArrow(props) {
  const { className, onClick } = props;
  return (
    <div
      onClick={onClick}
      className={`${className} !flex items-center justify-center`}
      style={{ 
        right: "20px", 
        background: "rgba(255,255,255,0.6)", 
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        zIndex: 10,
        cursor: "pointer",
        transition: "all 0.3s ease"
      }}
    >
      <MdKeyboardArrowRight size={24} color="black" />
    </div>
  );
}

function SamplePrevArrow(props) {
  const { className, onClick } = props;
  return (
    <div
      onClick={onClick}
      className={`${className} !flex items-center justify-center`}
      style={{ 
        left: "20px", 
        background: "rgba(255,255,255,0.6)", 
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        zIndex: 10,
        cursor: "pointer",
        transition: "all 0.3s ease"
      }}
    >
      <MdKeyboardArrowLeft size={24} color="black" />
    </div>
  );
}

const Hero = () => {
  const navigate = useNavigate();

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    fade: true, 
    cssEase: "ease-in-out",
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    pauseOnHover: false,
  };

  if (!assets.banners || assets.banners.length === 0) {
    return (
      <div className='flex flex-col sm:flex-row border border-gray-400'>
        <div className='w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0'>
            <div className='text-[#414141]'>
                <div className='flex items-center gap-2'>
                     <p className='w-8 md:w-11 h-[2px] bg-[#414141]'></p>
                     <p className='font-medium text-sm md:text-base'>OUR BESTSELLERS</p>
                </div>
                <h1 className='prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed'> Latest Arrivals </h1>
                <div className='flex items-center gap-2'>
                     <p className='font-semibold text-sm md:text-base'> SHOP NOW </p>
                     <p className='w-8 md:w-11 h-[1px] bg-[#414141]'></p>
                </div>
             </div>
        </div>
        <img className='w-full sm:w-1/2' src={assets.hero_img} alt=''/>
    </div>
    )
  }

  return (
    <div className='relative w-full overflow-hidden border border-gray-400'>
      <style>{customStyles}</style>

      <Slider {...settings}>
        {assets.banners.map((banner, index) => (
          <div key={index} className="outline-none">
            <div className="flex flex-col sm:flex-row w-full">
              <div className="w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0 bg-[#fbfbfb]">
                <div className='text-[#414141] text-center sm:text-left px-6'>
                    <div className='flex items-center justify-center sm:justify-start gap-2'>
                         <p className='w-8 md:w-11 h-[2px] bg-[#414141]'></p>
                         <p className='font-medium text-sm md:text-base uppercase'>{banner.title}</p>
                    </div>
                    
                    <h1 className='prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed text-[#414141]'>
                        {banner.subtitle}
                    </h1>
                    
                    <div 
                        className='flex items-center justify-center sm:justify-start gap-2 cursor-pointer group mt-2'
                        onClick={() => navigate(banner.link)}
                    >
                         <p className='font-semibold text-sm md:text-base group-hover:text-gray-600 transition-colors'> SHOP NOW </p>
                         <p className='w-8 md:w-11 h-[1px] bg-[#414141] group-hover:bg-gray-600 transition-colors'></p>
                    </div>
                 </div>
              </div>
              <div className="w-full sm:w-1/2 h-[300px] sm:h-[450px] relative">
                <img 
                    className='w-full h-full object-cover absolute top-0 left-0' 
                    src={banner.image} 
                    alt={banner.title}
                />
              </div>

            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Hero;