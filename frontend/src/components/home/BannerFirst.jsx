import React, { useState, useEffect } from 'react';
import brandBanner from '../../assets/home/bannerFirst-BrandsSales.svg';
import hockeyBanner from '../../assets/home/bannerFirst-hockeyBanner.svg';
import tenisBanner from '../../assets/home/bannerFirst-tennisBanner.svg';
import leftArrow from '../../assets/home/bannerFirst-leftArrow.svg';
import rightArrow from '../../assets/home/bannerFirst-rightArrow.svg';
import slash from '../../assets/home/bannerFirst-slash.svg';
import longLine from '../../assets/home/BannerFifth-longLine.svg';
import shortLine from '../../assets/home/BannerFifth-shortLine.svg';

import advirtisement_1_1 from '../../assets/home/Advertisement/advertisement-1.1.jpg';
import advirtisement_1_2 from '../../assets/home/Advertisement/advertisement-1.2.jpg';
import advirtisement_1_3 from '../../assets/home/Advertisement/advertisement-1.3.jpg';
import advirtisement_1_4 from '../../assets/home/Advertisement/advertisement-1.4.png';

function BannerFirst() {
  const buttonText = "Положить под ёлку";

  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [advirtisement_1_1, advirtisement_1_2, advirtisement_1_3, advirtisement_1_4];
  const totalSlides = slides.length;

  const handleNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + totalSlides) % totalSlides);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleNextSlide();
    }, 5000); // Автоматическая прокрутка каждые 5 секунд

    return () => clearInterval(interval); // Очистка интервала при размонтировании компонента
  }, [currentSlide]);

  return (
    <>
      <div className="grid grid-cols-3 h-full w-full gap-1 lg:gap-4">
        <div className="col-span-2 relative group h-[25vh] md:h-[40vh] lg:h-[50vh] xl:h-[60vh]">
          <img
            src={slides[currentSlide]}
            alt={`Advertisement ${currentSlide + 1}`}
            className="w-full h-full object-cover cursor-pointer transition-opacity duration-500 ease-in-out"
          />

          <div className='flex items-center justify-between'>
            <div>
              <a className='block text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>
                {buttonText}
              </a>
              <a href="#" className='absolute group-hover:hidden text-gray-600 text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>
                {buttonText}
              </a>
            </div>

            <div className='flex mt-[1%] items-center space-x-2'>
              <a onClick={handlePrevSlide} className='cursor-pointer'>
                <img
                  src={leftArrow}
                  alt="Previous Slide"
                  className='w-4 h-full sm:w-6 md:w-8 lg:w-10 cursor-pointer'
                />
              </a>

              <div className='flex items-center space-x-1'>
                <p className='text-[10px] sm:text-xs md:text-sm lg:text-base'>{currentSlide + 1}</p>
                <img
                  src={slash}
                  alt="Separator"
                  className='w-3 h-full sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6'
                />
                <p className='text-[10px] sm:text-xs md:text-sm lg:text-base'>{totalSlides}</p>
              </div>

              <a onClick={handleNextSlide} className='cursor-pointer'>
                <img
                  src={rightArrow}
                  alt="Next Slide"
                  className='w-4 h-full sm:w-6 md:w-8 lg:w-10 cursor-pointer'
                />
              </a>
            </div>
          </div>

          <div className='flex items-center transform -translate-x-5 group-hover:translate-x-0 transition-transform duration-300 ease-in-out'>
                <img
                  src={longLine}
                  alt="Short Line Decoration"
                  className="hidden group-hover:block w-[20%]"
                />
                <p className='ml-[2%] hidden text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-600 group-hover:block'>
                  Купить
                </p>
              </div>
        </div>

        <div className="grid grid-rows-2 gap-10 lg:gap-12 col-span-1 h-[25vh] md:h-[40vh] lg:h-[50vh] xl:h-[60vh]">
          {[hockeyBanner, tenisBanner].map((banner, index) => (
            <div key={index} className="group">
              <img
                src={banner}
                alt={`Banner ${index + 1}`}
                className="w-full h-full object-cover cursor-pointer"
              />
              <div>
                <a className='block text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>{buttonText}</a>
                <a href="#" className='block group-hover:hidden text-gray-600 text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>{buttonText}</a>
              </div>
              <div className='flex items-center transform -translate-x-5 group-hover:translate-x-0 transition-transform duration-300 ease-in-out'>
                <img
                  src={shortLine}
                  alt="Short Line Decoration"
                  className="hidden group-hover:block w-[20%]"
                />
                <p className='ml-[2%] hidden text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-600 group-hover:block'>
                  Купить
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default BannerFirst;