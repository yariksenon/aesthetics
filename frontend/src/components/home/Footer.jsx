import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import footerLogo from '../../assets/home/Footer-logo.svg';
import './custom.css';
import { motion } from 'framer-motion';
import footerDuaration from '../../assets/home/Footer.svg'

const TelegramBlock = () => (
  <div className='w-full md:w-[20%] py-[2%]'>
    <p className='text-lg md:text-xl lg:text-2xl mb-2'>Telegram</p>
    <a href='https://t.me/Aesthetics_Market' target="_blank"  className='text-sky-500 text-base md:text-lg lg:text-xl custom-underline cursor-pointer'>Aesthetics_Market</a> <br />
    <a href='https://t.me/Aesthetics_Market_bot' target="_blank" className='text-sky-300 text-base md:text-lg lg:text-xl custom-underline'>Aesthetics_Market_bot</a>
  </div>
);

const InstagramBlock = () => (
  <div className='w-full md:w-[20%]  md:border-r-2 py-[2%]'>
    <p className='text-lg md:text-xl lg:text-2xl cursor-default mb-2'>Instagram</p>
    <a href='https://www.instagram.com/aestheticsss.shop/' target="_blank" className='text-pink-700 text-base md:text-lg lg:text-xl custom-underline'>aestheticsss.shop</a>
  </div>
);

const ReviewsBlock = ({ reviews, activeReview }) => (
  <div className='w-full md:w-[20%] flex items-center justify-center overflow-hidden'>
    <motion.div
      className="text-center w-full h-full flex items-center justify-center"
      style={{ position: 'relative', height: '50px' }}
    >
      {reviews.map((review, index) => (
        <motion.div
          key={index}
          className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: activeReview === index ? '0%' : '100%', opacity: activeReview === index ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className='text-white text-xl md:text-2xl lg:text-3xl px-4 text-center'>
            {review}
          </p>
        </motion.div>
      ))}
    </motion.div>
  </div>
);

const TwitterBlock = () => (
  <div className='w-full md:w-[20%] py-[2%] md:border-l-2'>
    <p className='text-lg md:text-xl lg:text-2xl cursor-default mb-2'>Twitter</p>
    <a href="https://x.com/Aesthetic_sshop" target="_blank" className='text-gray-500 text-base md:text-lg lg:text-xl custom-underline'>Aesthetic_sshop</a>
  </div>
);

const AboutBlock = () => (
  <div className='w-full md:w-[20%] py-[2%]'>
    <p className='text-lg md:text-xl lg:text-2xl cursor-default mb-2'>About</p>
    <Link to="/about" target="_top" className="text-red-500 text-base md:text-lg lg:text-xl custom-underline">Why us</Link> <br />
    <Link to="/category" className='text-red-300 text-base md:text-lg lg:text-xl custom-underline'>Our products</Link>
  </div>
);
  


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
    <div className='mt-[2%]'>
      <img src={footerDuaration} alt="" className='w-full' />
    </div>
    <hr />
      <footer className=" bg-black font-bebas-neue text-white text-center">
        <div className='relative mx-[15%]'>
          <div className='flex flex-wrap gap-y-4'>
            {/* Блок Telegram */}
            <TelegramBlock />

            {/* Блок Instagram */}
            <InstagramBlock />

            {/* Блок с отзывами */}
            <div className='w-full md:w-[20%]   flex items-center justify-center overflow-hidden cursor-default'>
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
            <TwitterBlock />

            {/* Блок About */}
            <AboutBlock />
          </div>
          <hr />

          {/* Логотип и копирайт */}
          <div className='flex justify-center'>
          <div className='my-[5%]'>
            <a onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
              <img src={footerLogo} alt="Logo" className='cursor-pointer w-full transform transition-transform duration-300 ease-in-out hover:scale-110 hover:shadow-lg' />
            </a>
          </div>


            <p className="absolute left-0 bottom-0 hover:text-red-400 hover:-translate-y-1 transition-all duration-300 text-sm md:text-base lg:text-lg cursor-default">
              ©{year} Aesthetic’s
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;