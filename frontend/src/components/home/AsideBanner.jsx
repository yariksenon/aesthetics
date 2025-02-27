import React, { useState, useEffect, useCallback } from 'react';
import navClose from '../../assets/home/AsideBanner/nav-close.svg';

function AsideBanner() {
  const salary = 20;
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const isBannerClosed = localStorage.getItem('isBannerClosed');
    if (isBannerClosed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem('isBannerClosed', 'true');
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <aside
      className={`bg-black text-white p-3 flex justify-center items-center transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      role="banner"
      aria-label="Специальное предложение"
    >
      <p className="text-center text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mr-0 md:mr-4 lg:mr-6 xl:mr-10">
        Зарегистрируйтесь и получите {salary}% скидку на первый заказ.
      </p>

      <button
        className="cursor-pointer focus:outline-none"
        onClick={handleClose}
        aria-label="Закрыть баннер"
      >
        <img
          className="object-cover ml-2"
          src={navClose}
          alt="Close"
        />
      </button>
    </aside>
  );
}

export default AsideBanner;