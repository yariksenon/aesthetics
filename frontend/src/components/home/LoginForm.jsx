import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './custom.css'

const ErrorMessage = ({ error }) => (
	<motion.p
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		transition={{ duration: 0.3 }}
		className='text-red-500 text-sm mt-1'
	>
		{error.message}
	</motion.p>
)

const schema = yup.object().shape(
	{
		email: yup
			.string()
			.email('Некорректный формат почты')
			.required('Почта обязательна'),
		// Conditionally require password only if userId is not present
		password: yup.string().when('$userId', {
			is: null,
			then: schema =>
				schema
					.min(6, 'Пароль должен содержать минимум 6 символов')
					.required('Пароль обязателен'),
			otherwise: schema => schema.notRequired(),
		}),
	},
	{ context: { userId: localStorage.getItem('userId') } }
)

const LoginForm = ({ switchToRegister, onLoginSuccess, closeModal }) => {
	const {
		register,
		handleSubmit,
		formState: { errors, isValid, isDirty },
		setError,
		clearErrors,
		watch,
		reset,
	} = useForm({
		resolver: yupResolver(schema),
		mode: 'onChange',
		defaultValues: {
			email: localStorage.getItem('loginFormEmail') || '',
			password: localStorage.getItem('loginFormPassword') || '',
		},
		context: { userId: localStorage.getItem('userId') },
	})

	const [isLoading, setIsLoading] = useState(false)
	const navigate = useNavigate()
	const userId = localStorage.getItem('userId')

	// Отслеживание изменений в полях формы
	const email = watch('email')
	const password = watch('password')

	// Сохранение данных в localStorage при изменении полей, только если userId отсутствует
	useEffect(() => {
		if (!userId) {
			localStorage.setItem('loginFormEmail', email || '')
			localStorage.setItem('loginFormPassword', password || '')
		}
	}, [email, password, userId])

	// Очистка данных в localStorage
	const clearFormData = () => {
		localStorage.removeItem('loginFormEmail')
		localStorage.removeItem('loginFormPassword')
		reset({ email: '', password: '' })
	}

	// Очистка localStorage при монтировании компонента, если userId присутствует
	useEffect(() => {
		if (userId) {
			clearFormData()
		}
	}, [userId])

	const onSubmit = async data => {
		setIsLoading(true)
		try {
			const response = await axios.post(
				'http://localhost:8080/api/v1/login',
				{ ...data, userId }, // Include userId in the payload if present
				{
					withCredentials: true,
				}
			)

			const userData = response.data.user
			localStorage.setItem('userId', userData.id)

			if (onLoginSuccess) {
				onLoginSuccess(response.data.token, userData)
			}

			const redirectPath = userData.role === 'admin' ? '/admin' : '/profile'
			navigate(redirectPath)

			// Очистка данных после успешного логина
			clearFormData()

			if (closeModal) {
				closeModal()
			}
		} catch (error) {
			if (error.response) {
				if (error.response.data?.errors) {
					error.response.data.errors.forEach(err => {
						setError(err.field || 'root', {
							type: 'server',
							message: err.message,
						})
					})
				} else {
					setError('root', {
						type: 'server',
						message:
							error.response.data?.message || 'Неверный логин или пароль',
					})
				}
			} else if (error.request) {
				setError('root', {
					type: 'network',
					message: 'Ошибка соединения с сервером',
				})
			} else {
				setError('root', {
					type: 'unknown',
					message: error.message || 'Произошла непредвиденная ошибка',
				})
			}
		} finally {
			setIsLoading(false)
		}
	}

	const getInputClassName = fieldName =>
		`w-full p-2 border-b-[2px] focus:outline-none transition duration-300 ${
			errors[fieldName] ? 'border-red-500 animate-shake' : 'border-black'
		}`

	const isSubmitDisabled = isLoading || !isValid || !isDirty

	return (
		<div className='max-w-md mx-auto'>
			<form onSubmit={handleSubmit(onSubmit)} className='mt-6'>
				<p className='text-center text-gray-600 mb-6'>
					Твой первый визит?{' '}
					<button
						type='button'
						onClick={switchToRegister}
						className='text-black hover:underline focus:outline-none'
					>
						Зарегистрироваться
					</button>
				</p>

				{errors.root && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3 }}
						className='bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded'
					>
						<p>{errors.root.message}</p>
					</motion.div>
				)}

				<div className='mb-6'>
					<label
						htmlFor='email'
						className='block text-sm font-medium text-gray-700 mb-1'
					>
						Электронная почта
					</label>
					<input
						type='email'
						id='email'
						className={getInputClassName('email')}
						placeholder='example@mail.com'
						{...register('email')}
					/>
					{errors.email && <ErrorMessage error={errors.email} />}
				</div>

				{!userId && (
					<div className='mb-8'>
						<label
							htmlFor='password'
							className='block text-sm font-medium text-gray-700 mb-1'
						>
							Пароль
						</label>
						<input
							type='password'
							id='password'
							className={getInputClassName('password')}
							placeholder='••••••••'
							{...register('password')}
						/>
						{errors.password && <ErrorMessage error={errors.password} />}
					</div>
				)}

				<button
					type='submit'
					className={`w-full text-white py-3 px-4 rounded-lg transition duration-300 flex justify-center items-center ${
						isSubmitDisabled
							? 'bg-gray-400 cursor-not-allowed'
							: 'bg-black hover:bg-gray-800'
					}`}
					disabled={isSubmitDisabled}
				>
					{isLoading ? (
						<>
							<svg
								className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'
							>
								<circle
									className='opacity-25'
									cx='12'
									cy='12'
									r='10'
									stroke='currentColor'
									strokeWidth='4'
								></circle>
								<path
									className='opacity-75'
									fill='currentColor'
									d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
								></path>
							</svg>
							Вход...
						</>
					) : (
						'Войти'
					)}
				</button>
			</form>
		</div>
	)
}

export default React.memo(LoginForm)
