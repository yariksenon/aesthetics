import React, { useState, useEffect } from 'react';
import navClose from '../../assets/home/AsideBanner/nav-close.svg';

function AsideBanner() {
  const salary = 20;
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false); // Состояние для анимации закрытия

  useEffect(() => {
    const isBannerClosed = localStorage.getItem('isBannerClosed');
    if (isBannerClosed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true); // Начинаем анимацию закрытия
    setTimeout(() => {
      setIsVisible(false); // Скрываем баннер после завершения анимации
      localStorage.setItem('isBannerClosed', 'true');
    }, 300); // Длительность анимации (300ms)
  };

  if (!isVisible) return null; // Если баннер скрыт, не рендерим его

  return (
    <aside
      className={`bg-black text-white p-3 flex justify-center items-center transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <p className="text-center text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mr-0 md:mr-4 lg:mr-6 xl:mr-10">
        Зарегистрируйтесь и получите {salary}% скидку на первый заказ.{' '}
      </p>

      <a className='cursor-pointer'>
        <img
          className="object-cover ml-2"
          src={navClose}
          alt="Close"
          onClick={handleClose}
        />
      </a>
      
    </aside>
  );
}

export default AsideBanner;