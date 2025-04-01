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
            // 1. Убрали withCredentials, так как используем JWT в заголовке
            const response = await axios.post('http://localhost:8080/api/v1/login', data);
            setErrorMessage('');
            reset();
    
            // 2. Сохраняем JWT токен и данные пользователя
            localStorage.setItem('token', response.data.token); // Сохраняем токен
            localStorage.setItem('userId', response.data.user_id); // Изменили на user_id
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('userData', JSON.stringify({
                id: response.data.user_id,
                email: data.email,
                role: response.data.role
            }));
    
            // 3. Перенаправление
            navigate(response.data.role === 'admin' ? '/admin' : '/profile');
        } catch (error) {
            // 4. Улучшенная обработка ошибок
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