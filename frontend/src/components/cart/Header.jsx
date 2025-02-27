import React, { useState } from 'react';
import './custom.css';
import headerLogo from "../../assets/home/Header/Logo.svg";
import { Link } from 'react-router-dom';
import headerBasket from "../../assets/home/Header/Basket.svg";
import closeButtonWhite from "../../assets/home/Header/CloseButtonWhite.svg";
import AuthModal from './../home/AuthModal';

function Header() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [showSocials, setShowSocials] = useState(false);
    const [activeMenuItem, setActiveMenuItem] = useState('woman'); // Default active menu item

    const openModal = () => setIsModalOpen(true);
    const closeModal = (e) => {
        e.stopPropagation();
        setIsModalOpen(false);
    };
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const switchToRegister = () => setIsLogin(false);
    const switchToLogin = () => setIsLogin(true);

    const toggleSocials = () => setShowSocials(!showSocials);

    const menuItems = [
        { label: 'Женщинам', value: 'woman' },
        { label: 'Мужчинам', value: 'man' },
        { label: 'Детям', value: 'children'},
        { label: 'Новинки', value: 'new' },
        { label: 'Обувь', value: 'shoes' },
        { label: 'Одежда', value: 'clothes' },
        { label: 'Аксессуары', value: 'accessories' },
        { label: 'Красота', value: 'beauty' },
        { label: 'Скидки', value: 'discounts' },
    ];

    const textStyles = {
        small: 'text-[10px] sm:text-xs md:text-sm lg:text-base',
    };

    const MenuItem = ({ label, value }) => (
        <li
            onClick={() => setActiveMenuItem(value)}
            className={`${textStyles.small} ${activeMenuItem === value ? 'text-red-500' : ''} custom-underline cursor-pointer whitespace-nowrap`}
        >
            {label}
        </li>
    );

    return (
        <>
            <header className="mx-[15%] mt-[1%] flex justify-between items-center">
                <div className="lg:hidden">
                    <button onClick={toggleMenu}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                        </svg>
                    </button>
                </div>

                <div className="flex items-center flex-grow">
                    <div className="hidden lg:flex md:space-x-5 lg:space-x-6">
                        <Link to="/man" className="text-[10px] sm:text-xs md:text-sm lg:text-base text-black custom-underline">Мужчинам</Link>
                        <Link to="/woman" className="text-[10px] sm:text-xs md:text-sm lg:text-base text-black custom-underline">Женщинам</Link>
                        <Link to="/children" className="text-[10px] sm:text-xs md:text-sm lg:text-base text-black custom-underline">Детям</Link>
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
                        Войти
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
                    <AuthModal
                        isLogin={isLogin}
                        closeModal={closeModal}
                        switchToRegister={switchToRegister}
                        switchToLogin={switchToLogin}
                        showSocials={showSocials}
                        toggleSocials={toggleSocials}
                    />
                )}

                {isMenuOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 z-40 lg:hidden" onClick={toggleMenu}>
                        <div className="bg-white w-3/4 h-full p-6 relative">
                            <ul className="space-y-4">
                                {menuItems.map((item, index) => (
                                    <MenuItem key={index} label={item.label} value={item.value} />
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={toggleMenu}
                            className="fixed right-[5%] sm:right-[10%] md:right-[15%] top-4 cursor-pointer z-50"
                        >
                        <img 
                            src={closeButtonWhite} 
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
