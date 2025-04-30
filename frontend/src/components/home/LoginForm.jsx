import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './custom.css';

const schema = yup.object().shape({
    email: yup
        .string()
        .email('Некорректный формат почты')
        .required('Почта обязательна'),
    password: yup
        .string()
        .min(6, 'Пароль должен содержать минимум 6 символов')
        .required('Пароль обязателен'),
});

const LoginForm = ({ switchToRegister, onLoginSuccess, closeModal }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(schema),
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:8080/api/v1/login', data, {
                withCredentials: true // Для приёма куки
            });
            
            // Очищаем ошибки и форму
            setErrorMessage('');
            reset();

            // Сохраняем данные аутентификации
            const authData = {
                token: response.data.token || getCookie('auth_token'), // Функция getCookie должна быть реализована
                user: {
                    id: response.data.user_id,
                    email: data.email,
                    role: response.data.role,
                    firstName: response.data.first_name || '' // Делаем необязательным
                }
            };

            // Сохраняем в localStorage
            localStorage.setItem('authToken', authData.token);
            localStorage.setItem('userData', JSON.stringify(authData.user));

            // Вызываем колбэк успешного входа
            if (onLoginSuccess) {
                onLoginSuccess(authData.token, authData.user);
            }

            // Перенаправляем пользователя
            const redirectPath = authData.user.role === 'admin' ? '/admin' : '/profile';
            navigate(redirectPath);
            
            // Закрываем модальное окно
            if (closeModal) {
                closeModal();
            }

        } catch (error) {
            let message = 'Произошла непредвиденная ошибка';
            if (error.response) {
                message = error.response.data?.error || 
                         error.response.data?.message || 
                         message;
            } else if (error.request) {
                message = 'Сервер не отвечает. Проверьте подключение.';
            }
            setErrorMessage(message);
            console.error('Ошибка авторизации:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const getInputClassName = (error) =>
        `w-full p-2 border-b-[2px] focus:outline-none transition duration-300 ${
            error ? 'border-red-500 animate-shake' : 'border-black'
        }`;

    return (
        <div className="max-w-md mx-auto">
            <form onSubmit={handleSubmit(onSubmit)} className='mt-6'>
                <p className="text-center text-gray-600 mb-6">
                    Твой первый визит?{' '}
                    <button 
                        type="button"
                        onClick={switchToRegister} 
                        className='text-blue-600 hover:underline focus:outline-none'
                    >
                        Зарегистрироваться
                    </button>
                </p>
                
                {/* Сообщение об ошибке */}
                {errorMessage && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                        <p>{errorMessage}</p>
                    </div>
                )}

                {/* Поле для почты */}
                <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Электронная почта
                    </label>
                    <input
                        type="email"
                        id="email"
                        className={getInputClassName(errors.email)}
                        placeholder="example@mail.com"
                        {...register('email')}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.email.message}</p>
                    )}
                </div>

                {/* Поле для пароля */}
                <div className="mb-8">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Пароль
                    </label>
                    <input
                        type="password"
                        id="password"
                        className={getInputClassName(errors.password)}
                        placeholder="••••••••"
                        {...register('password')}
                    />
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.password.message}</p>
                    )}
                </div>

                {/* Кнопка отправки формы */}
                <button
                    type="submit"
                    className={`w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition duration-300 flex justify-center items-center ${
                        isLoading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Вход...
                        </>
                    ) : (
                        'Войти'
                    )}
                </button>
            </form>
        </div>
    );
};

export default React.memo(LoginForm);