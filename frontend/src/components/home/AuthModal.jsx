import React from 'react';
import { FaFacebook, FaGoogle, FaGithub } from 'react-icons/fa';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import closeBunnton from "../../assets/home/Header-closeButton.svg";
import headerLogo from "../../assets/home/header-logo.svg";


const AuthModal = ({ isLogin, closeModal, switchToRegister, switchToLogin, showSocials, toggleSocials }) => {
    const handleInnerClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50" onClick={closeModal}>
            <div className="bg-white p-6 shadow-lg w-full relative max-w-2xl" onClick={handleInnerClick}>
                <div className='flex justify-center'>
                    <a onClick={closeModal} className='cursor-pointer'>
                        <img src={headerLogo} alt="Logo" />
                    </a>
                </div>

                <a>
                    <img onClick={closeModal} src={closeBunnton} alt="Close menu" className='absolute right-4 top-4 cursor-pointer'/>
                </a>

                {isLogin ? (
                    <LoginForm switchToRegister={switchToRegister} closeModal={closeModal} />
                ) : (
                    <RegisterForm switchToLogin={switchToLogin} closeModal={closeModal} />
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
    );
};

export default AuthModal;