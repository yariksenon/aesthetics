import React, { useState, useEffect } from 'react';
import navClose from '../../assets/home/nav-close.svg';

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
        <a href="#" className="underline">
          Зарегистрироваться сейчас.
        </a>
      </p>
      <img
        className="w-4 h-4 object-cover cursor-pointer ml-2 md:ml-4 lg:ml-6 xl:ml-10"
        src={navClose}
        alt="Close"
        onClick={handleClose}
      />
    </aside>
  );
}

export default AsideBanner;