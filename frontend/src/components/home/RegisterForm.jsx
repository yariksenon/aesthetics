import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { isValidPhoneNumber } from 'libphonenumber-js'
import ReCAPTCHA from 'react-google-recaptcha'
import { motion } from 'framer-motion'
import './custom.css'

const API_URL = 'http://45.12.74.28:8080/api/v1/register'
const CAPTCHA_SITE_KEY = '6LccqPoqAAAAAJX7xPKW3ZSxOTpB37BrDxjcCl3R'

const ErrorMessage = ({ error }) => (
	<motion.p
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		transition={{ duration: 0.5 }}
		className='text-red-500 text-sm mt-1'
	>
		{error.message}
	</motion.p>
)

const InputField = ({
	id,
	type,
	placeholder,
	register,
	errors,
	className,
	maxLength,
	required = true,
	rules = {},
}) => {
	const validationRules = {
		required: required ? 'Это поле обязательно' : false,
		...rules,
	}

	return (
		<div className='mb-4'>
			<input
				type={type}
				id={id}
				className={`w-full p-2 border-b-[2px] focus:outline-none transition duration-300 ${
					errors[id] ? 'border-red-500 animate-shake' : 'border-black'
				} ${className}`}
				placeholder={placeholder}
				maxLength={maxLength}
				{...register(id, validationRules)}
			/>
			<div className='h-4'>
				{errors[id] && <ErrorMessage error={errors[id]} />}
			</div>
		</div>
	)
}

const RegisterForm = ({ switchToLogin, onRegisterSuccess, closeModal }) => {
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isValid, isDirty },
		setValue,
		getValues,
		setError,
		clearErrors,
		trigger,
	} = useForm({
		mode: 'onChange',
		shouldUnregister: true,
	})

	const navigate = useNavigate()
	const [isLoading, setIsLoading] = useState(false)
	const [captchaValue, setCaptchaValue] = useState(null)
	const [isFormComplete, setIsFormComplete] = useState(false)

	// Проверяем заполненность формы
	useEffect(() => {
		const subscription = watch((value, { name }) => {
			if (name) {
				trigger(name) // Триггерим валидацию при изменении поля
			}

			// Проверяем, заполнены ли все обязательные поля
			const formValues = getValues()
			const filled =
				formValues.username &&
				formValues.email &&
				formValues.phone &&
				formValues.password &&
				formValues.confirmPassword &&
				formValues.consent

			setIsFormComplete(filled)
		})
		return () => subscription.unsubscribe()
	}, [watch, getValues, trigger])

	const validatePhoneNumber = phoneNumber => {
		if (!phoneNumber || typeof phoneNumber !== 'string') {
			setError('phone', {
				type: 'manual',
				message: 'Номер телефона обязателен',
			})
			return false
		}

		const cleanedPhone = phoneNumber.replace(/\D/g, '')
		if (cleanedPhone.length > 12) {
			setError('phone', {
				type: 'manual',
				message: 'Номер телефона не должен превышать 12 цифр',
			})
			return false
		}

		if (!isValidPhoneNumber(phoneNumber)) {
			setError('phone', {
				type: 'manual',
				message: 'Некорректный номер телефона',
			})
			return false
		}

		clearErrors('phone')
		return true
	}

	const onSubmit = async data => {
		if (!captchaValue) {
			setError('root', {
				type: 'manual',
				message: 'Пожалуйста, подтвердите, что вы не робот',
			})
			return
		}

		if (!validatePhoneNumber(data.phone)) {
			return
		}

		setIsLoading(true)
		try {
			const response = await axios.post(API_URL, {
				username: data.username,
				email: data.email,
				phone: data.phone,
				password: data.password,
				captcha: captchaValue,
			})

			const userData = {
				user: {
					id: response.data.user_id,
					email: data.email,
					username: data.username,
					role: response.data.role || 'user',
				},
			}

			localStorage.setItem('userData', JSON.stringify(userData.user))
			localStorage.setItem('userId', userData.user.id)

			if (onRegisterSuccess) {
				onRegisterSuccess(userData.token, userData.user)
			}

			navigate('/profile')
			if (closeModal) closeModal()
		} catch (error) {
			if (error.response?.data?.message) {
				setError('root', {
					type: 'server',
					message: error.response.data.message,
				})
			} else if (error.response?.data?.error) {
				setError('root', {
					type: 'server',
					message: error.response.data.error,
				})
			} else {
				setError('root', {
					type: 'server',
					message: 'Ошибка при регистрации',
				})
			}
		} finally {
			setIsLoading(false)
		}
	}

	const onChangeCaptcha = value => {
		setCaptchaValue(value)
		clearErrors('root')
	}

	// Проверяем, можно ли активировать кнопку
	const isSubmitDisabled =
		isLoading || !isValid || !isDirty || !captchaValue || !isFormComplete

	return (
		<div>
			<form onSubmit={handleSubmit(onSubmit)} className='mt-[5%]'>
				<p>
					Есть аккаунт?{' '}
					<button
						type='button'
						onClick={switchToLogin}
						className='underline underline-offset-4 cursor-pointer focus:outline-none'
					>
						Войти
					</button>
				</p>
				<div className='mt-[5%]'>
					{errors.root && (
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5 }}
							className='text-red-500 text-sm mb-4'
						>
							{errors.root.message}
						</motion.p>
					)}

					<InputField
						id='username'
						type='text'
						placeholder='Введите имя пользователя'
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
						id='email'
						type='email'
						placeholder='Введите свой email'
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

					<div className='mb-4'>
						<PhoneInput
							international
							defaultCountry='BY'
							value={getValues('phone')}
							onChange={value => {
								const cleanedPhone = value ? value.replace(/\D/g, '') : ''
								if (cleanedPhone.length <= 15) {
									setValue('phone', value || '')
									validatePhoneNumber(value || '')
								}
							}}
							className={`w-full p-2 border-b-[2px] focus:outline-none transition duration-300 ${
								errors.phone ? 'border-red-500 animate-shake' : 'border-black'
							}`}
							placeholder='Введите номер телефона'
						/>
						<div className='h-4'>
							{errors.phone && <ErrorMessage error={errors.phone} />}
						</div>
					</div>

					<InputField
						id='password'
						type='password'
						placeholder='Придумайте пароль'
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
						}}
						maxLength={30}
					/>

					<InputField
						id='confirmPassword'
						type='password'
						placeholder='Повторите пароль'
						register={register}
						errors={errors}
						rules={{
							required: 'Подтверждение пароля обязательно',
							maxLength: {
								value: 30,
								message: 'Подтверждение пароля не должно превышать 30 символов',
							},
							validate: value =>
								value === watch('password') || 'Пароли не совпадают',
						}}
						maxLength={30}
					/>

					<div className='flex items-center mb-4'>
						<input
							type='checkbox'
							id='consent'
							className='mr-2 cursor-pointer'
							{...register('consent', {
								required:
									'Необходимо согласие на обработку персональных данных',
							})}
						/>
						<label htmlFor='consent' className='text-sm cursor-pointer'>
							Даю согласие на обработку персональных данных
						</label>
					</div>
					{errors.consent && <ErrorMessage error={errors.consent} />}

					<ReCAPTCHA
						sitekey={CAPTCHA_SITE_KEY}
						onChange={onChangeCaptcha}
						className='mb-4'
					/>
				</div>

				<button
					type='submit'
					className={`w-full text-white py-4 transition duration-300 ${
						isSubmitDisabled
							? 'bg-gray-400 cursor-not-allowed'
							: 'bg-black hover:bg-gray-800'
					} ${isLoading ? 'opacity-75' : ''}`}
					disabled={isSubmitDisabled}
				>
					{isLoading ? (
						<div className='flex justify-center items-center'>
							<div className='loading-spinner'></div>
							<span className='ml-2'>Регистрация...</span>
						</div>
					) : (
						'Зарегистрироваться'
					)}
				</button>
			</form>
		</div>
	)
}

export default React.memo(RegisterForm)
