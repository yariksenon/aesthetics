import { useForm } from 'react-hook-form';

const Login = ({ switchToRegister }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        console.log(data); // Обработка данных формы
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='mt-[5%]'>
            <p>
                Твой первый визит?{' '}
                <a href='#' onClick={switchToRegister} className='underline underline-offset-4'>
                    Зарегистрироваться
                </a>
            </p>
            <div className='mt-[5%]'>
                {/* Поле для почты */}
                <div className="mb-5">
                    <input
                        type="email"
                        id="email"
                        className={`w-full p-2 border-b-[2px] focus:outline-none ${
                            errors.email ? 'border-red-500' : 'border-black'
                        }`}
                        placeholder="Почта"
                        {...register('email', {
                            required: 'Почта обязательна',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Некорректный формат почты',
                            },
                        })}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                </div>

                {/* Поле для пароля */}
                <div className="mb-4">
                    <input
                        type="password"
                        id="password"
                        className={`w-full p-2 border-b-[2px] focus:outline-none ${
                            errors.password ? 'border-red-500' : 'border-black'
                        }`}
                        placeholder="Пароль"
                        {...register('password', {
                            required: 'Пароль обязателен',
                            minLength: {
                                value: 6,
                                message: 'Пароль должен содержать минимум 6 символов',
                            },
                        })}
                    />
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                </div>
            </div>

            {/* Кнопка отправки формы */}
            <button
                type="submit"
                className="w-full bg-black text-white py-2 hover:bg-gray-800"
            >
                Войти
            </button>
        </form>
    );
};

export default Login;