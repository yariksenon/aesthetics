import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { isValidPhoneNumber } from 'libphonenumber-js';
import ReCAPTCHA from 'react-google-recaptcha';
import { motion } from 'framer-motion';

const RegisterForm = ({ switchToLogin }) => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        setValue,
        getValues,
        setError,
    } = useForm();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [captchaValue, setCaptchaValue] = useState(null);

    const onSubmit = async (data) => {
        if (!captchaValue) {
            alert('Пожалуйста, подтвердите, что вы не робот');
            return;
        }

        const phoneNumber = getValues('phone');
        if (!isValidPhoneNumber(phoneNumber)) {
            alert('Некорректный номер телефона');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:8080/api/v1/register', data, { withCredentials: true });
            console.log(response.data);
            navigate('/profile');
        } catch (error) {
            if (error.response && error.response.data.errors) {
                error.response.data.errors.forEach((err) => {
                    setError(err.field, {
                        type: 'server',
                        message: err.message,
                    });
                });
            } else if (error.response) {
                console.error('Ошибка отправки данных формы:', error.response.data);
                alert(`Ошибка: ${error.response.data.message}`);
            } else {
                console.error('Ошибка отправки данных формы:', error);
                alert('Ошибка при отправке данных формы.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const onChangeCaptcha = (value) => {
        setCaptchaValue(value);
    };

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className='mt-[5%]'>
                <p>
                    Есть аккаунт?{' '}
                    <a onClick={switchToLogin} className='underline underline-offset-4 cursor-pointer'>
                        Войти
                    </a>
                </p>
                <div className='mt-[5%]'>
                    <div className="mb-5">
                        <input
                            type="text"
                            id="username"
                            className={`w-full p-2 border-b-[2px] focus:outline-none transition duration-300 ${
                                errors.username ? 'border-red-500 animate-shake' : 'border-black'
                            }`}
                            placeholder="Введите имя пользователя"
                            {...register('username', {
                                required: 'Имя пользователя обязательно',
                            })}
                        />
                        <div className="h-4">
                            {errors.username && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-red-500 text-sm mt-1"
                                >
                                    {errors.username.message}
                                </motion.p>
                            )}
                        </div>
                    </div>

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
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-red-500 text-sm mt-1"
                                >
                                    {errors.email.message}
                                </motion.p>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <PhoneInput
                            international
                            defaultCountry="BY"
                            value={getValues('phone')}
                            onChange={(value) => setValue('phone', value)}
                            className={`w-full p-2 border-b-[2px] focus:outline-none transition duration-300 ${
                                errors.phone ? 'border-red-500 animate-shake' : 'border-black'
                            }`}
                            placeholder="Введите номер телефона"
                        />
                        <div className="h-4">
                            {errors.phone && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-red-500 text-sm mt-1"
                                >
                                    {errors.phone.message}
                                </motion.p>
                            )}
                        </div>
                    </div>

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
                                pattern: {
                                    value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/,
                                    message: 'Пароль должен содержать цифры, заглавные и строчные буквы',
                                },
                            })}
                        />
                        <div className="h-4">
                            {errors.password && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-red-500 text-sm mt-1"
                                >
                                    {errors.password.message}
                                </motion.p>
                            )}
                        </div>
                    </div>

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
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-red-500 text-sm mt-1"
                                >
                                    {errors.confirmPassword.message}
                                </motion.p>
                            )}
                        </div>
                    </div>

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
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-red-500 text-sm mt-1"
                        >
                            {errors.consent.message}
                        </motion.p>
                    )}

                    <ReCAPTCHA
                        sitekey="6LccqPoqAAAAAJX7xPKW3ZSxOTpB37BrDxjcCl3R"
                        onChange={onChangeCaptcha}
                        className="mb-4"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-black text-white hover:bg-gray-800 py-4"
                    disabled={isLoading}
                >
                    {isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
                </button>
            </form>
        </div>
    );
};

export default React.memo(RegisterForm);