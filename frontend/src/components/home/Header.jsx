import React, { useState } from 'react';
import './custom.css';
import headerLogo from "../../assets/home/header-logo.svg";
import { Link } from 'react-router-dom';
import headerBasket from "../../assets/home/header-basket.svg";
import closeBunnton from "../../assets/home/Header-closeButton.svg";
import closeBunntonWhite from "../../assets/home/Header-closeButtonWhite.svg";

import { useForm } from 'react-hook-form';
import { FaFacebook, FaGoogle, FaGithub } from 'react-icons/fa'; // Импорт иконок


function Header() {
    const [isModalOpen, setIsModalOpen] = useState(false); // Состояние для модального окна
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Состояние для бургер-меню
    const [isLogin, setIsLogin] = useState(true); // Состояние для переключения между формами

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    const switchToRegister = () => setIsLogin(false);
    const switchToLogin = () => setIsLogin(true);

    const [showSocials, setShowSocials] = useState(false); // Состояние для управления видимостью списка

    // Функция для переключения видимости списка
    const toggleSocials = () => {
        setShowSocials(!showSocials);
    };

    const LoginForm = ({ switchToRegister }) => {
        const {
            register,
            handleSubmit,
            formState: { errors },
        } = useForm();
    
        const onSubmit = (data) => {
            console.log(data); // Обработка данных формы
        };
    
        // Общий стиль для полей ввода
        const inputClassName = (error) =>
            `w-full p-2 border-b-[2px] focus:outline-none transition duration-300 ${
                error ? 'border-red-500 animate-shake' : 'border-black'
            }`;
    
        return (
            <div>
                <style>
                    {`
                        @keyframes shake {
                            0%, 100% { transform: translateX(0); }
                            25% { transform: translateX(-5px); }
                            50% { transform: translateX(5px); }
                            75% { transform: translateX(-5px); }
                        }
                        .animate-shake {
                            animation: shake 0.5s linear;
                        }
                        @keyframes fadeIn {
                            0% { opacity: 0; }
                            100% { opacity: 1; }
                        }
                        .animate-fadeIn {
                            animation: fadeIn 0.5s ease-in-out;
                        }
                    `}
                </style>
                <form onSubmit={handleSubmit(onSubmit)} className='mt-[5%]'>
                    <p>
                        Твой первый визит?{' '}
                        <a onClick={switchToRegister} className='underline underline-offset-4 cursor-pointer'>
                            Зарегистрироваться
                        </a>
                    </p>
                    <div className='mt-[5%]'>
                        {/* Поле для почты */}
                        <div className="mb-5">
                            <input
                                type="email"
                                id="email"
                                className={inputClassName(errors.email)}
                                placeholder="Почта"
                                {...register('email', {
                                    required: 'Почта обязательна',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Некорректный формат почты',
                                    },
                                })}
                            />
                            <div className="h-4">
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.email.message}</p>
                                )}
                            </div>
                        </div>
    
                        {/* Поле для пароля */}
                        <div className="mb-4">
                            <input
                                type="password"
                                id="password"
                                className={inputClassName(errors.password)}
                                placeholder="Пароль"
                                {...register('password', {
                                    required: 'Пароль обязателен',
                                    minLength: {
                                        value: 6,
                                        message: 'Пароль должен содержать минимум 6 символов',
                                    },
                                })}
                            />
                            <div className="h-4">
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.password.message}</p>
                                )}
                            </div>
                        </div>
                    </div>
    
                    {/* Кнопка отправки формы */}
                    <button
                        type="submit"
                        className="w-full bg-black text-white py-4 hover:bg-gray-800"
                    >
                        Войти
                    </button>
                </form>
            </div>
        );
    };

    const RegisterForm = ({ switchToLogin }) => {
        const {
            register,
            handleSubmit,
            watch,
            formState: { errors },
        } = useForm();
    
        const onSubmit = (data) => {
            console.log(data); // Обработка данных формы
        };
    
        return (
            <div>
                <style>
                    {`
                        @keyframes shake {
                            0%, 100% { transform: translateX(0); }
                            25% { transform: translateX(-5px); }
                            50% { transform: translateX(5px); }
                            75% { transform: translateX(-5px); }
                        }
                        .animate-shake {
                            animation: shake 0.5s linear;
                        }
                        @keyframes fadeIn {
                            0% { opacity: 0; }
                            100% { opacity: 1; }
                        }
                        .animate-fadeIn {
                            animation: fadeIn 0.5s ease-in-out;
                        }
                    `}
                </style>
                <form onSubmit={handleSubmit(onSubmit)} className='mt-[5%]'>
                    <p>
                        Есть аккаунт?{' '}
                        <a onClick={switchToLogin} className='underline underline-offset-4 cursor-pointer'>
                            Войти
                        </a>
                    </p>
                    <div className='mt-[5%]'>
                        {/* Поле для имени */}
                        <div className="mb-5">
                            <input
                                type="text"
                                id="name"
                                className={`w-full p-2 border-b-[2px] focus:outline-none transition duration-300 ${
                                    errors.name ? 'border-red-500 animate-shake' : 'border-black'
                                }`}
                                placeholder="Введите своё имя"
                                {...register('name', {
                                    required: 'Имя обязательно',
                                })}
                            />
                            <div className="h-4">
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.name.message}</p>
                                )}
                            </div>
                        </div>
        
                        {/* Поле для почты */}
                        <div className="mb-4">
                            <input
                                type="email"
                                id="email"
                                className={`w-full p-2 border-b-[2px] focus:outline-none transition duration-300 ${
                                    errors.email ? 'border-red-500 animate-shake' : 'border-black'
                                }`}
                                placeholder="Введите свой email"
                                {...register('email', {
                                    required: 'Почта обязательна',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Некорректный формат почты',
                                    },
                                })}
                            />
                            <div className="h-4">
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.email.message}</p>
                                )}
                            </div>
                        </div>
        
                        {/* Поле для телефона */}
                        <div className="mb-4">
                            <input
                                type="tel"
                                id="phone"
                                className={`w-full p-2 border-b-[2px] focus:outline-none transition duration-300 ${
                                    errors.phone ? 'border-red-500 animate-shake' : 'border-black'
                                }`}
                                placeholder="Телефон"
                                {...register('phone', {
                                    required: 'Телефон обязателен',
                                    pattern: {
                                        value: /^\+?[0-9]{10,15}$/,
                                        message: 'Некорректный формат телефона',
                                    },
                                })}
                            />
                            <div className="h-4">
                                {errors.phone && (
                                    <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.phone.message}</p>
                                )}
                            </div>
                        </div>
        
                        {/* Поле для пароля */}
                        <div className="mb-4">
                            <input
                                type="password"
                                id="password"
                                className={`w-full p-2 border-b-[2px] focus:outline-none transition duration-300 ${
                                    errors.password ? 'border-red-500 animate-shake' : 'border-black'
                                }`}
                                placeholder="Придумайте пароль"
                                {...register('password', {
                                    required: 'Пароль обязателен',
                                    minLength: {
                                        value: 6,
                                        message: 'Пароль должен содержать минимум 6 символов',
                                    },
                                })}
                            />
                            <div className="h-4">
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.password.message}</p>
                                )}
                            </div>
                        </div>
        
                        {/* Поле для подтверждения пароля */}
                        <div className="mb-4">
                            <input
                                type="password"
                                id="confirmPassword"
                                className={`w-full p-2 border-b-[2px] focus:outline-none transition duration-300 ${
                                    errors.confirmPassword ? 'border-red-500 animate-shake' : 'border-black'
                                }`}
                                placeholder="Повторите пароль"
                                {...register('confirmPassword', {
                                    required: 'Подтверждение пароля обязательно',
                                    validate: (value) =>
                                        value === watch('password') || 'Пароли не совпадают',
                                })}
                            />
                            <div className="h-4">
                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.confirmPassword.message}</p>
                                )}
                            </div>
                        </div>
        
                        {/* Чекбокс согласия */}
                        <div className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                id="consent"
                                className="mr-2 cursor-pointer"
                                {...register('consent', {
                                    required: 'Необходимо согласие',
                                })}
                            />
                            <label htmlFor="consent" className="text-sm cursor-pointer">
                                Даю согласие на обработку персональных данных
                            </label>
                        </div>
                        {errors.consent && (
                            <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.consent.message}</p>
                        )}
                    </div>
        
                    {/* Кнопка отправки формы */}
                    <button
                        type="submit"
                        className="w-full bg-black text-white py-2 hover:bg-gray-800 py-4"
                    >
                        Зарегистрироваться
                    </button>
                </form>
            </div>
        );
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

                            {isLogin ?  (
                    <LoginForm
                        switchToRegister={switchToRegister}
                        handleOverlayClick={handleOverlayClick}
                        closeModal={closeModal}
                        headerLogo="path_to_headerLogo"
                        closeBunnton="path_to_closeBunnton"
                    />
                ) : (
                    <RegisterForm
                        switchToLogin={switchToLogin}
                        handleOverlayClick={handleOverlayClick}
                        closeModal={closeModal}
                        headerLogo="path_to_headerLogo"
                        closeBunnton="path_to_closeBunnton"
                    />
                )}

<p className="mt-4 text-sm text-center text-gray-600">
                Войти через{' '}
                <a
                    onClick={toggleSocials}
                    className="underline underline-offset-2 cursor-pointer hover:text-gray-800"
                >
                    соцсеть
                </a>
            </p>

            {showSocials && (
                <div className="mt-2 flex items-center w-full space-x-5">
                    <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center">
                        <FaFacebook className="mr-2" />
                    </button>
                    <button className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 flex items-center justify-center">
                        <FaGoogle className="mr-2" />
                    </button>
                    <button className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 flex items-center justify-center">
                        <FaGithub className="mr-2" />
                    </button>
                </div>
            )}
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