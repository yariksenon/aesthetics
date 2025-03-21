import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { isValidPhoneNumber } from 'libphonenumber-js';
import ReCAPTCHA from 'react-google-recaptcha';
import { motion } from 'framer-motion';

const API_URL = 'http://localhost:8080/api/v1/register';
const CAPTCHA_SITE_KEY = '6LccqPoqAAAAAJX7xPKW3ZSxOTpB37BrDxjcCl3R';

const ErrorMessage = ({ error }) => (
    <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-red-500 text-sm mt-1"
    >
        {error.message}
    </motion.p>
);

const InputField = ({ id, type, placeholder, register, errors, rules, className, maxLength }) => (
    <div className="mb-4">
        <input
            type={type}
            id={id}
            className={`w-full p-2 border-b-[2px] focus:outline-none transition duration-300 ${
                errors[id] ? 'border-red-500 animate-shake' : 'border-black'
            } ${className}`}
            placeholder={placeholder}
            maxLength={maxLength}
            {...register(id, rules)}
        />
        <div className="h-4">
            {errors[id] && <ErrorMessage error={errors[id]} />}
        </div>
    </div>
);

const RegisterForm = ({ switchToLogin }) => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        setValue,
        getValues,
        setError,
        clearErrors,
    } = useForm();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [captchaValue, setCaptchaValue] = useState(null);

    const validatePhoneNumber = (phoneNumber) => {
        if (!phoneNumber || typeof phoneNumber !== 'string') {
            setError('phone', {
                type: 'manual',
                message: 'Номер телефона обязателен',
            });
            return false;
        }

        // Удаляем все нецифровые символы (например, пробелы, скобки, дефисы)
        const cleanedPhone = phoneNumber.replace(/\D/g, '');

        // Ограничение на 12 цифр
        if (cleanedPhone.length > 12) {
            setError('phone', {
                type: 'manual',
                message: 'Номер телефона не должен превышать 12 цифр',
            });
            return false;
        }

        if (!isValidPhoneNumber(phoneNumber)) {
            setError('phone', {
                type: 'manual',
                message: 'Некорректный номер телефона',
            });
            return false;
        }

        clearErrors('phone');
        return true;
    };

    const handleFormError = (error) => {
        if (error.response && error.response.data.errors) {
            error.response.data.errors.forEach((err) => {
                setError(err.field, {
                    type: 'server',
                    message: err.message,
                });
            });
        } else if (error.response) {
            console.error('Ошибка отправки данных формы:', error.response.data);
            setError('root', {
                type: 'server',
                message: error.response.data.message || 'Ошибка при отправке данных формы.',
            });
        } else {
            console.error('Ошибка отправки данных формы:', error);
            setError('root', {
                type: 'server',
                message: 'Ошибка при отправке данных формы.',
            });
        }
    };

    const onSubmit = async (data) => {
        if (!captchaValue) {
            setError('root', {
                type: 'manual',
                message: 'Пожалуйста, подтвердите, что вы не робот',
            });
            return;
        }

        if (!validatePhoneNumber(data.phone)) {
            return;
        }

        setIsLoading(true);
        try {
            const registerResponse = await axios.post(API_URL, data, { withCredentials: true });
            console.log(registerResponse.data);
            navigate('/profile');
        } catch (error) {
            handleFormError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const onChangeCaptcha = (value) => {
        setCaptchaValue(value);
        clearErrors('root');
    };

    // const CustomInput = React.forwardRef((props, ref) => (
    //     <input {...props} ref={ref} maxLength={15} />
    // ));
    

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
                    {errors.root && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-red-500 text-sm mb-4"
                        >
                            {errors.root.message}
                        </motion.p>
                    )}

                    <InputField
                        id="username"
                        type="text"
                        placeholder="Введите имя пользователя"
                        register={register}
                        errors={errors}
                        rules={{ 
                            required: 'Имя пользователя обязательно',
                            maxLength: {
                                value: 20,
                                message: 'Имя пользователя не должно превышать 20 символов',
                            },
                        }}
                        maxLength={20}
                    />

                    <InputField
                        id="email"
                        type="email"
                        placeholder="Введите свой email"
                        register={register}
                        errors={errors}
                        rules={{
                            required: 'Почта обязательна',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Некорректный формат почты',
                            },
                            maxLength: {
                                value: 50,
                                message: 'Email не должен превышать 50 символов',
                            },
                        }}
                        maxLength={50}
                    />

                    <div className="mb-4">



                    <PhoneInput
                        international
                        defaultCountry="BY"
                        value={getValues('phone')}
                        onChange={(value) => {
                            const cleanedPhone = value ? value.replace(/\D/g, '') : '';
                            if (cleanedPhone.length <= 15) {
                                setValue('phone', value || '');
                                validatePhoneNumber(value || '');
                            }
                        }}
                        className={`w-full p-2 border-b-[2px] focus:outline-none transition duration-300 ${
                            errors.phone ? 'border-red-500 animate-shake' : 'border-black'
                        }`}
                        placeholder="Введите номер телефона"
                    />


                        <div className="h-4">
                            {errors.phone && <ErrorMessage error={errors.phone} />}
                        </div>
                    </div>

                    <InputField
                        id="password"
                        type="password"
                        placeholder="Придумайте пароль"
                        register={register}
                        errors={errors}
                        rules={{
                            required: 'Пароль обязателен',
                            minLength: {
                                value: 6,
                                message: 'Пароль должен содержать минимум 6 символов',
                            },
                            maxLength: {
                                value: 30,
                                message: 'Пароль не должен превышать 30 символов',
                            },
                            pattern: {
                                value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/,
                                message: 'Пароль должен содержать цифры, заглавные и строчные буквы',
                            },
                        }}
                        maxLength={30}
                    />

                    <InputField
                        id="confirmPassword"
                        type="password"
                        placeholder="Повторите пароль"
                        register={register}
                        errors={errors}
                        rules={{
                            required: 'Подтверждение пароля обязательно',
                            maxLength: {
                                value: 30,
                                message: 'Подтверждение пароля не должно превышать 30 символов',
                            },
                            validate: (value) =>
                                value === watch('password') || 'Пароли не совпадают',
                        }}
                        maxLength={30}
                    />

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
                    {errors.consent && <ErrorMessage error={errors.consent} />}

                    <ReCAPTCHA
                        sitekey={CAPTCHA_SITE_KEY}
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