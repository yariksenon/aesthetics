import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; 
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
  const navigate = useNavigate();
  const { gender } = useParams(); // Получаем текущий gender из URL
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [advirtisement_1_1, advirtisement_1_2, advirtisement_1_3, advirtisement_1_4];
  const totalSlides = slides.length;

  // Тексты и маршруты для слайдов
  const slideData = [
    { text: "Форма для регби", about: "Качественные товары", category: "rugby" },
    { text: "Баскетбольная форма", about: "Для любителей баскетбола", category: "basketball" },
    { text: "Баскетбольное снаряжение", about: "Лучшее для вас", category: "basketball" },
    { text: "Костюм для бега", about: "Для любителей побегать", category: "running" },
  ];

  // Тексты и маршруты для боковых баннеров
  const bannerData = [
    { text: "Хоккейная экипировка", about: "Подарок для хоккеиста", category: "hockey" },
    { text: "Снаряжение для тенниса", about: "Для новых открытий", category: "tennis" },
  ];

  const handleNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + totalSlides) % totalSlides);
  };

  // Обработчик клика для слайдов
  const handleSlideClick = (category) => {
    navigate(`/${gender}/${category}`); // Используем текущий gender
  };

  // Обработчик клика для баннеров
  const handleBannerClick = (category) => {
    navigate(`/${gender}/${category}`); // Используем текущий gender
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleNextSlide();
    }, 4000);

    return () => clearInterval(interval);
  }, [currentSlide]);

  return (
    <div className="grid grid-cols-3 h-full w-full gap-1 lg:gap-4">
      <div className="col-span-2 relative group h-[25vh] md:h-[40vh] lg:h-[50vh] xl:h-[60vh]">
        <div className="relative w-full h-full overflow-hidden">
          {slides.map((slide, index) => (
            <img
              key={index}
              src={slide}
              alt={`Advertisement ${index + 1}`}
              className={`absolute w-full h-full object-cover cursor-pointer transition-transform duration-500 ease-in-out hover:opacity-75 ${
                index === currentSlide ? 'translate-x-0' : 'translate-x-full'
              }`}
              onClick={() => handleSlideClick(slideData[index].category)} // Клик по слайду
            />
          ))}

          {/* Прогресс-бар снизу фотографии */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 bg-opacity-50">
            <div
              className="h-1 bg-black"
              style={{
                width: `${((currentSlide + 1) / totalSlides) * 100}%`,
                transition: 'width 0.5s ease-in-out',
              }}
            ></div>
          </div>
        </div>

        <div className='flex items-center justify-between mt-2'>
          <div>
            <a className='block text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>
              {slideData[currentSlide].text} {/* Динамический текст */}
            </a>
            <a href="#" className='absolute group-hover:hidden text-gray-600 text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>
              {slideData[currentSlide].about} {/* Динамический текст */}
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
              className="w-full h-full object-cover cursor-pointer hover:opacity-75"
              onClick={() => handleBannerClick(bannerData[index].category)} // Клик по баннеру
            />
            <div>
              <a className='block text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>
                {bannerData[index].text} {/* Тематический текст для баннеров */}
              </a>
              <a href="#" className='block group-hover:hidden text-gray-600 text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>
                {bannerData[index].about} {/* Тематический текст для баннеров */}
              </a>
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
  );
}

export default BannerFirst;