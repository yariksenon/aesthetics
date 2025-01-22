import React, { useState } from 'react';
import './custom.css';
import headerLogo from "../../assets/home/header-logo.svg";
import headerBasket from "../../assets/home/header-basket.svg";
import closeBunnton from "../../assets/home/Header-closeButton.svg"

function Header() {
    const accept = "Войти";
    const [isModalOpen, setIsModalOpen] = useState(false); // Состояние для модального окна

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <header className="mx-[15%] mt-[1%] flex justify-between items-center">
                <div className='flex space-x-2 sm:space-x-3 md:space-x-6 lg:space-x-8 text-[10px] sm:text-xs md:text-sm lg:text-base'>
                    <a href="" className="custom-underline">Женщинам</a>
                    <a href="" className="custom-underline">Мужчинам</a>
                    <a href="" className="custom-underline">Детям</a>
                </div>

                <div className='flex justify-center'>
                    <img src={headerLogo} alt="Logo" className="cursor-pointer h-6 md:h-10 w-auto" />
                </div>

                <div className="flex space-x-2 sm:space-x-3 md:space-x-5 lg:space-x-10 items-center">
                    <button
                        className="text-[10px] sm:text-xs md:text-sm lg:text-base text-black bg-white py-0.5 sm:py-1.5 md:py-2 px-2 sm:px-4 md:px-6 border-[1px] md:border-2 border-black rounded-lg transition duration-300 ease-in-out transform hover:bg-black hover:text-white hover:border-white hover:shadow-lg"
                        onClick={openModal} // Открываем модальное окно при нажатии
                    >
                        {accept}
                    </button>
                    <div className="flex items-center transition-transform duration-300 ease-in-out hover:scale-110">
                        <img 
                            src={headerBasket} 
                            className="h-6 sm:h-8 md:h-10 w-6 sm:w-8 md:w-10 cursor-pointer" 
                            alt="Basket" 
                        />
                        <a href="/cart" className="text-[10px] sm:text-xs md:text-sm lg:text-base text-black custom-underline">Корзина</a>
                    </div>
                </div>

                {/* Модальное окно */}
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
                        <div className="bg-white p-6 shadow-lg w-full relative max-w-2xl">
                            <a href="/">
                                <img src={headerLogo} alt="Logo" />
                            </a>
                            
                            <a href="">
                              <img onClick={closeModal} src={closeBunnton} alt="Close menu" className='absolute right-4 top-4 cursor-pointer'/>
                            </a>
                            
                            <form className='mt-[5%]'>
                                <p>Твой первый визит? <a href="" className='underline'>Зарегистрироваться</a></p>
                                <div className='mt-[5%]'>
                                    <div className="mb-5">
                                        <input
                                            type="email"
                                            id="email"
                                            className="w-full p-2 border-b-[4px] border-black focus:outline-none"
                                            placeholder="Почта"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <input
                                            type="password"
                                            id="password"
                                            className="w-full p-2 border-b-[4px] border-black focus:outline-none"
                                            placeholder="Пароль"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-black text-white py-2 hover:bg-gray-800"
                                >
                                    Войти
                                </button>
                            </form>
                            <p
                                className="mt-4 text-sm text-center text-gray-600"
                            >
                                Войти через <a className='underline cursor-pointer hover:text-gray-800'>соцсеть</a>
                            </p>
                        </div>
                    </div>
                )}
            </header>
        </>
    );
}

export default Header;