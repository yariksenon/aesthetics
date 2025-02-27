import React, { useCallback } from 'react';
// import { FaFacebook, FaGoogle, FaGithub } from 'react-icons/fa';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import closeButton from "../../assets/home/Header/CloseButton.svg";
import headerLogo from "../../assets/home/Header/Logo.svg";

const AuthModal = ({ isLogin, closeModal, switchToRegister, switchToLogin, showSocials, toggleSocials }) => {
    const handleInnerClick = useCallback((e) => {
        e.stopPropagation();
    }, []);

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-label="Модальное окно авторизации"
        >
            <div
                className="bg-white p-6 shadow-lg w-full relative max-w-2xl"
                onClick={handleInnerClick}
            >
                <div className='flex justify-center'>
                    <button onClick={closeModal} className='cursor-pointer focus:outline-none'>
                        <img src={headerLogo} alt="Логотип" />
                    </button>
                </div>

                <button
                    onClick={closeModal}
                    className='absolute right-4 top-4 cursor-pointer focus:outline-none'
                    aria-label="Закрыть модальное окно"
                >
                    <img src={closeButton} alt="Закрыть меню" />
                </button>

                {isLogin ? (
                    <LoginForm switchToRegister={switchToRegister} closeModal={closeModal} />
                ) : (
                    <RegisterForm switchToLogin={switchToLogin} closeModal={closeModal} />
                )}

                {/* <p className="mt-4 text-sm text-center text-gray-600">
                    Войти через{' '}
                    <button
                        onClick={toggleSocials}
                        className="underline underline-offset-2 cursor-pointer hover:text-gray-800 focus:outline-none"
                        aria-label="Переключить отображение социальных сетей"
                    >
                        соцсеть
                    </button>
                </p>

                {showSocials && (
                    <div className="mt-2 flex items-center w-full space-x-5">
                        <button
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center focus:outline-none"
                            aria-label="Войти через Facebook"
                        >
                            <FaFacebook className="mr-2" />
                        </button>
                        <button
                            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 flex items-center justify-center focus:outline-none"
                            aria-label="Войти через Google"
                        >
                            <FaGoogle className="mr-2" />
                        </button>
                        <button
                            className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 flex items-center justify-center focus:outline-none"
                            aria-label="Войти через GitHub"
                        >
                            <FaGithub className="mr-2" />
                        </button>
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default AuthModal;