import React, { useState } from 'react';
import './custom.css';
import headerLogo from "../../assets/home/header-logo.svg";
import { Link } from 'react-router-dom';
import headerBasket from "../../assets/home/header-basket.svg";
import closeBunnton from "../../assets/home/Header-closeButton.svg";
import closeBunntonWhite from "../../assets/home/Header-closeButtonWhite.svg";

function Header() {
    const accept = "Войти";
    const [isModalOpen, setIsModalOpen] = useState(false); // Состояние для модального окна
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Состояние для бургер-меню

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    const menuItems = [
        { label: 'Женщинам', isActive: false },
        { label: 'Мужчинам', isActive: false },
        { label: 'Детям', isActive: false },
        { label: 'Новинки', isActive: false },
        { label: 'Обувь', isActive: false },
        { label: 'Одежда', isActive: false },
        { label: 'Аксессуары', isActive: false },
        { label: 'Красота', isActive: false },
        { label: 'Скидки', isActive: true },
    ];

    const textStyles = {
        small: 'text-[10px] sm:text-xs md:text-sm lg:text-base',
    };

    const MenuItem = ({ label, isActive }) => (
        <li className={`${textStyles.small} ${isActive ? 'text-red-500' : ''} custom-underline cursor-pointer whitespace-nowrap`}>
            {label}
        </li>
    );

    return (
        <>
            <header className="mx-[15%] mt-[1%] flex justify-between items-center">
                {/* Бургер-меню */}
                <div className="lg:hidden">
                    <button onClick={toggleMenu}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                        </svg>
                    </button>
                </div>

                <div className="flex items-center flex-grow">
                    <div className="hidden lg:flex md:space-x-5 lg:space-x-6">
                        <a href="/man" className="text-[10px] sm:text-xs md:text-sm lg:text-base text-black custom-underline">Мужчинам</a>
                        <a href="/woman" className="text-[10px] sm:text-xs md:text-sm lg:text-base text-black custom-underline">Женщинам</a>
                        <a href="/children" className="text-[10px] sm:text-xs md:text-sm lg:text-base text-black custom-underline">Детям</a>
                    </div>

                    <div className='flex justify-center flex-grow'>
                        <Link to="/">
                            <img src={headerLogo} alt="Logo" className="cursor-pointer h-6 md:h-10 w-auto" />
                        </Link>
                    </div>
                </div>

                <div className="flex space-x-2 sm:space-x-3 md:space-x-5 lg:space-x-10 items-center">
                    <button
                        className="text-[10px] sm:text-xs md:text-sm lg:text-base text-black bg-white py-0.5 sm:py-1.5 md:py-2 px-2 sm:px-4 md:px-6 border-[1px] md:border-2 border-black rounded-lg transition duration-300 ease-in-out transform hover:bg-black hover:text-white hover:border-white hover:shadow-lg"
                        onClick={openModal}
                    >
                        {accept}
                    </button>
                    <div className="flex items-center transition-transform duration-300 ease-in-out hover:scale-110">
                        <img 
                            src={headerBasket} 
                            className="h-6 sm:h-8 md:h-10 w-6 sm:w-8 md:w-10 cursor-pointer" 
                            alt="Basket" 
                        />
                        <Link to="/cart" className="text-[10px] sm:text-xs md:text-sm lg:text-base text-black custom-underline">
                        <p>Корзина</p>
                        </Link>
                        
                    </div>
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50" onClick={handleOverlayClick}>
                        <div className="bg-white p-6 shadow-lg w-full relative max-w-2xl">
                            <div className='flex justify-center'>
                                <a href="/">
                                    <img src={headerLogo} alt="Logo" />
                                </a>
                            </div>
                            
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
                            <p className="mt-4 text-sm text-center text-gray-600">
                                Войти через <a className='underline cursor-pointer hover:text-gray-800'>соцсеть</a>
                            </p>
                        </div>
                    </div>
                )}

                {isMenuOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 z-40 lg:hidden" onClick={toggleMenu}>
                        {/* Блок меню */}
                        <div className="bg-white w-3/4 h-full p-6 relative">
                            {/* Список меню */}
                            <ul className="space-y-4">
                                {menuItems.map((item, index) => (
                                    <MenuItem key={index} label={item.label} isActive={item.isActive} />
                                ))}
                            </ul>
                        </div>

                        {/* Кнопка закрытия (справа от блока) */}
                        <button
                            onClick={toggleMenu}
                            className="fixed right-[5%] sm:right-[10%] md:right-[15%] top-4 cursor-pointer z-50"
                        >
                            <img 
                                src={closeBunntonWhite} 
                                alt="Close menu" 
                                className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" 
                            />
                        </button>
                    </div>
                )}
            </header>
        </>
    );
}

export default Header;