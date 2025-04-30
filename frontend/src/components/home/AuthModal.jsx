import React, { useCallback } from 'react';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import closeButton from "../../assets/home/Header/CloseButton.svg";
import headerLogo from "../../assets/home/Header/Logo.svg";

const AuthModal = ({ 
  isLogin, 
  closeModal, 
  switchToRegister, 
  switchToLogin, 
  showSocials, 
  toggleSocials,
  onLoginSuccess 
}) => {
    const handleInnerClick = useCallback((e) => {
        e.stopPropagation();
    }, []);

    // Обработчик успешного входа
    const handleLoginSuccess = useCallback((token, userData) => {
        if (onLoginSuccess) {
            onLoginSuccess(token, userData); // Передаем данные в родительский компонент
        }
        closeModal(); // Закрываем модальное окно
    }, [onLoginSuccess, closeModal]);

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-label="Модальное окно авторизации"
        >
            <div
                className="bg-white p-6 rounded-lg shadow-lg w-full relative max-w-md mx-4"
                onClick={handleInnerClick}
            >
                <div className='flex justify-center mb-4'>
                    <button onClick={closeModal} className='cursor-pointer focus:outline-none'>
                        <img src={headerLogo} alt="Логотип" className="h-10" />
                    </button>
                </div>

                <button
                    onClick={closeModal}
                    className='absolute right-4 top-4 cursor-pointer focus:outline-none'
                    aria-label="Закрыть модальное окно"
                >
                    <img src={closeButton} alt="Закрыть" className="w-6 h-6" />
                </button>

                {isLogin ? (
                    <LoginForm 
                        switchToRegister={switchToRegister} 
                        onLoginSuccess={handleLoginSuccess} // Передаем обработчик
                    />
                ) : (
                    <RegisterForm 
                        switchToLogin={switchToLogin} 
                        onRegisterSuccess={handleLoginSuccess} // Используем тот же обработчик
                    />
                )}

                <div className="mt-4 text-center text-sm text-gray-600">
                    {isLogin ? (
                        <p>
                            Нет аккаунта?{' '}
                            <button 
                                onClick={switchToRegister} 
                                className="text-blue-600 hover:underline focus:outline-none"
                            >
                                Зарегистрируйтесь
                            </button>
                        </p>
                    ) : (
                        <p>
                            Уже есть аккаунт?{' '}
                            <button 
                                onClick={switchToLogin} 
                                className="text-blue-600 hover:underline focus:outline-none"
                            >
                                Войдите
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(AuthModal);