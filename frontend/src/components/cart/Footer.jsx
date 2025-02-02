import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import footerLogo from '../../assets/home/Footer-logo.svg';
import './custom.css';
import { motion } from 'framer-motion'; // Импортируем framer-motion
import footerDuaration from '../../assets/home/Footer.svg'
function Footer() {
  const year = new Date().getFullYear();
  const [activeReview, setActiveReview] = useState(0);

  // Массив с отзывами
  const reviews = [
    "Great service!",
    "Very satisfied!",
    "Highly recommend!",
    "Fast delivery!",
    "Top-notch quality!",
    "Best store ever!",
    "Everything is awesome!",
    "Great prices!",
    "Very convenient!",
    "Thanks for the quality!"
  ];

  // Автоматическая смена отзывов
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveReview((prev) => (prev + 1) % reviews.length); // Циклическая смена
    }, 3000); // Меняем отзыв каждые 3 секунды

    return () => clearInterval(interval); // Очистка интервала
  }, [reviews.length]);

  return (
    <>
    <div className='mt-[3%]'>
      <img src={footerDuaration} alt="" className='w-full' />
    </div>
    <hr />
      <footer className=" bg-black font-bebas-neue text-white text-center">
        <div className='relative mx-[15%]'>
          <div className='flex flex-wrap gap-y-4'>
            {/* Блок Telegram */}
            <div className='w-full md:w-[20%]  py-[2%]'>
              <p className='text-lg md:text-xl lg:text-2xl'>Telegram</p>
              <a href='#' className='text-sky-500 text-base md:text-lg lg:text-xl custom-underline'>Aesthetics_Market</a> <br />
              <a href='#' className='text-sky-300 text-base md:text-lg lg:text-xl custom-underline'>Aesthetics_Market/bot</a>
            </div>

            {/* Блок Instagram */}
            <div className='w-full md:w-[20%]  md:border-r-2 py-[2%]'>
              <p className='text-lg md:text-xl lg:text-2xl'>Instagram</p>
              <a href='#' className='text-pink-700 text-base md:text-lg lg:text-xl custom-underline'>Aesthetics_Market</a>
            </div>

            {/* Блок с отзывами */}
            <div className='w-full md:w-[20%]   flex items-center justify-center overflow-hidden'>
              <motion.div
                className="text-center w-full h-full flex items-center justify-center"
                style={{ position: 'relative', height: '50px' }}
              >
                {/* Анимированные отзывы */}
                {reviews.map((review, index) => (
                  <motion.div
                    key={index}
                    className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
                    initial={{ x: '-100%', opacity: 0 }}
                    animate={{ x: activeReview === index ? '0%' : '100%', opacity: activeReview === index ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className='text-white text-xl md:text-2xl lg:text-3xl  px-4 text-center'>
                      {review}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Блок Twitter */}
            <div className='w-full md:w-[20%] py-[2%]  md:border-l-2'>
              <p className='text-lg md:text-xl lg:text-2xl'>Twitter</p>
              <a href="" className='text-gray-300 text-base md:text-lg lg:text-xl custom-underline'>Some text</a>
            </div>

            {/* Блок About */}
            <div className='w-full md:w-[20%] py-[2%]'>
              <p className='text-lg md:text-xl lg:text-2xl'>About</p>
              <a href="" className='text-red-500 text-base md:text-lg lg:text-xl custom-underline'>Some text</a> <br />
              <a href="" className='text-red-300 text-base md:text-lg lg:text-xl custom-underline'>Some text</a>
            </div>
          </div>
          <hr />

          {/* Логотип и копирайт */}
          <div className='flex justify-center'>
            <Link to="/" className='my-[5%]'>
              <img src={footerLogo} alt="Logo" className='cursor-pointer w-full' />
            </Link>

            <p href="#" className="absolute left-0 bottom-0 hover:text-red-400 hover:-translate-y-1 transition-all duration-300 text-sm md:text-base lg:text-lg">
              ©{year} Aesthetic’s
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;