import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate
import './custom.css'; // Подключение внешнего файла стилей

const LoginForm = ({ switchToRegister }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        clearErrors,
        reset
    } = useForm();
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate(); // Используем useNavigate

    const onSubmit = async (data) => {
        clearErrors(); // Очистить все ошибки перед отправкой данных
        try {
            const response = await axios.post('http://localhost:8080/api/v1/login', data, { withCredentials: true }); // Включение cookies
            console.log(response.data);
            setErrorMessage(''); // Очистить предыдущие сообщения об ошибках
            reset(); // Сбросить все значения формы и ошибки после успешной отправки
            navigate('/profile'); // Перенаправление на страницу профиля при успешном логине
        } catch (error) {
            const message = error.response?.data?.message || 'Ошибка при отправке данных формы';
            console.error('Ошибка отправки данных формы:', message);
            setErrorMessage(message);
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
                    {errorMessage && (
                        <div className="text-red-500 text-sm mb-4 animate-fadeIn">{errorMessage}</div>
                    )}
                    <div className="mb-5">
                        <input
                            type="email"
                            id="email"
                            className={getInputClassName(errors.email)}
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

                    <div className="mb-4">
                        <input
                            type="password"
                            id="password"
                            className={getInputClassName(errors.password)}
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

export default LoginForm;
