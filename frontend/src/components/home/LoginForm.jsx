import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './custom.css';

// Схема валидации с использованием Yup
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

const LoginForm = ({ switchToRegister }) => {
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

    // Обработчик отправки формы
    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:8080/api/v1/login', data, { withCredentials: true });
            setErrorMessage('');
            reset();
    
            // Сохраняем данные пользователя
            localStorage.setItem('token', response.data.token); // Сохраняем токен
            localStorage.setItem('userId', response.data.userId); // Сохраняем ID пользователя
            localStorage.setItem('role', response.data.role); // Сохраняем роль
    
            // Перенаправление в зависимости от роли
            if (response.data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/profile');
            }
        } catch (error) {
            if (error.response) {
                const message = error.response.data.message || 'Ошибка при отправке данных формы';
                setErrorMessage(message);
            } else if (error.request) {
                setErrorMessage('Ошибка сети. Проверьте подключение к интернету.');
            } else {
                setErrorMessage('Произошла непредвиденная ошибка.');
            }
            console.error('Ошибка отправки данных формы:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Динамический класс для инпутов с анимацией ошибки
    const getInputClassName = (error) =>
        `w-full p-2 border-b-[2px] focus:outline-none transition duration-300 ${
            error ? 'border-red-500 animate-shake' : 'border-black'
        }`;

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className='mt-[5%]'>
                <p>
                    Твой первый визит?{' '}
                    <a onClick={switchToRegister} className='underline underline-offset-4 cursor-pointer'>
                        Зарегистрироваться
                    </a>
                </p>
                <div className='mt-[5%]'>
                    {/* Сообщение об ошибке */}
                    {errorMessage && (
                        <div className="text-red-500 text-sm mb-4 animate-fadeIn">{errorMessage}</div>
                    )}

                    {/* Поле для почты */}
                    <div className="mb-5">
                        <input
                            type="email"
                            id="email"
                            className={getInputClassName(errors.email)}
                            placeholder="Почта"
                            {...register('email')}
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
                            className={getInputClassName(errors.password)}
                            placeholder="Пароль"
                            {...register('password')}
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
                    className={`w-full bg-black text-white py-4 hover:bg-gray-800 transition duration-300 button-hover-effect ${
                        isLoading ? 'button-loading' : ''
                    }`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex justify-center items-center">
                            <div className="loading-spinner"></div>
                            <span className="ml-2">Загрузка...</span>
                        </div>
                    ) : (
                        'Войти'
                    )}
                </button>
            </form>
        </div>
    );
};

export default React.memo(LoginForm);