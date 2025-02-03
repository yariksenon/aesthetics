import { useForm } from 'react-hook-form';

const LoginForm = ({ switchToRegister }) => {
        const {
            register,
            handleSubmit,
            formState: { errors },
        } = useForm();
    
        const onSubmit = (data) => {
            console.log(data); // Обработка данных формы
        };
    
        // Общий стиль для полей ввода
        const inputClassName = (error) =>
            `w-full p-2 border-b-[2px] focus:outline-none transition duration-300 ${
                error ? 'border-red-500 animate-shake' : 'border-black'
            }`;
    
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
                            0% { opacity: 0; }
                            100% { opacity: 1; }
                        }
                        .animate-fadeIn {
                            animation: fadeIn 0.5s ease-in-out;
                        }
                    `}
                </style>
                <form onSubmit={handleSubmit(onSubmit)} className='mt-[5%]'>
                    <p>
                        Твой первый визит?{' '}
                        <a onClick={switchToRegister} className='underline underline-offset-4 cursor-pointer'>
                            Зарегистрироваться
                        </a>
                    </p>
                    <div className='mt-[5%]'>
                        {/* Поле для почты */}
                        <div className="mb-5">
                            <input
                                type="email"
                                id="email"
                                className={inputClassName(errors.email)}
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
    
                        {/* Поле для пароля */}
                        <div className="mb-4">
                            <input
                                type="password"
                                id="password"
                                className={inputClassName(errors.password)}
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
    
                    {/* Кнопка отправки формы */}
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