import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterForm = ({ switchToLogin }) => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            const response = await axios.post('http://localhost:8080/api/v1/register', data, { withCredentials: true });
            console.log(response.data);
            navigate('/profile'); 
        } catch (error) {
            if (error.response) {
                console.error('Ошибка отправки данных формы:', error.response.data);
                alert(`Ошибка: ${error.response.data.message}`);
            } else {
                console.error('Ошибка отправки данных формы:', error);
                alert('Ошибка при отправке данных формы.');
            }
        }
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
                        0% { opacity: 0); }
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
                                <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.username.message}</p>
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
                                <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.email.message}</p>
                            )}
                        </div>
                    </div>

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

export default RegisterForm;
