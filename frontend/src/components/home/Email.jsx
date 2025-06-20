import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function Email() {
	const [email, setEmail] = useState('')
	const [emailError, setEmailError] = useState('')
	const [isSubscribed, setIsSubscribed] = useState(false)
	const [isChecking, setIsChecking] = useState(false)
	const [isTouched, setIsTouched] = useState(false)

	// Валидация email
	const validateEmail = email => {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		return re.test(String(email).toLowerCase())
	}

	// Проверка подписки при изменении email
	useEffect(() => {
		if (isTouched && email) {
			if (validateEmail(email)) {
				setEmailError('')
				checkSubscription()
			} else {
				setEmailError('Введите корректный email')
			}
		}
	}, [email, isTouched])

	const handleEmailChange = e => {
		setEmail(e.target.value)
		if (!isTouched) setIsTouched(true)
	}

	const checkSubscription = useCallback(async () => {
		if (!validateEmail(email)) return

		setIsChecking(true)
		try {
			const response = await axios.get(
				`http://45.12.74.28:8080/api/v1/subscribe/check/${encodeURIComponent(
					email
				)}`
			)
			setIsSubscribed(response.data.subscribed)
		} catch (error) {
			if (error.response && error.response.status === 404) {
				setIsSubscribed(false)
			} else {
				console.error('Ошибка при проверке подписки:', error)
				toast.error('Ошибка при проверке подписки', {
					position: 'top-right',
					autoClose: 3000,
				})
			}
		} finally {
			setIsChecking(false)
		}
	}, [email])

	const handleSubscribe = useCallback(async () => {
		try {
			const response = await axios.post(
				'http://45.12.74.28:8080/api/v1/subscribe',
				{ email }
			)
			if (response.status === 200) {
				setIsSubscribed(true)
				toast.success('Вы успешно подписались!', {
					position: 'top-right',
					autoClose: 3000,
				})
			}
		} catch (error) {
			console.error('Ошибка при подписке:', error)
			toast.error(error.response?.data?.error || 'Ошибка при подписке', {
				position: 'top-right',
				autoClose: 3000,
			})
		}
	}, [email])

	const handleUnsubscribe = useCallback(async () => {
		try {
			const response = await axios.post(
				'http://45.12.74.28:8080/api/v1/unsubscribe',
				{ email }
			)
			if (response.status === 200) {
				setIsSubscribed(false)
				toast.success('Вы успешно отписались!', {
					position: 'top-right',
					autoClose: 3000,
				})
			}
		} catch (error) {
			console.error('Ошибка при отписке:', error)
			toast.error(error.response?.data?.error || 'Ошибка при отписке', {
				position: 'top-right',
				autoClose: 3000,
			})
		}
	}, [email])

	const handleSubmit = useCallback(
		async e => {
			e.preventDefault()
			setIsTouched(true)

			if (!email) {
				setEmailError('Пожалуйста, введите email')
				return
			}

			if (!validateEmail(email)) {
				setEmailError('Введите корректный email')
				return
			}

			if (isSubscribed) {
				await handleUnsubscribe()
			} else {
				await handleSubscribe()
			}
		},
		[email, isSubscribed, handleSubscribe, handleUnsubscribe]
	)

	return (
		<div className='bg-black py-[3%] h-full px-4 mt-[2%]'>
			<div className='max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4'>
				<h2 className='text-white text-center sm:text-left text-sm sm:text-base md:text-lg lg:text-xl font-medium'>
					Будьте в курсе наших последних предложений.
				</h2>

				<form
					onSubmit={handleSubmit}
					className='w-full md:max-w-fit flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-3'
					noValidate
				>
					<div className='relative w-full md:w-auto'>
						<label htmlFor='email' className='sr-only'>
							Email
						</label>
						<input
							type='email'
							id='subscribe'
							name='subscribe'
							value={email}
							onChange={handleEmailChange}
							onBlur={() => setIsTouched(true)}
							className={`
                                w-full 
                                md:w-48 
                                lg:w-56 
                                bg-transparent 
                                border-b 
                                ${
																	emailError ? 'border-red-500' : 'border-white'
																} 
                                text-white 
                                placeholder-gray-400 
                                outline-none 
                                focus:border-red-500 
                                transition 
                                duration-300 
                                ease-in-out 
                                py-1 
                                px-2 
                                text-sm 
                                sm:text-base 
                                md:text-base 
                                lg:text-base
                            `}
							placeholder='Введите ваш email'
							required
						/>
						{emailError && (
							<p className='absolute text-red-500 text-xs mt-1'>{emailError}</p>
						)}
					</div>

					<button
						type='submit'
						disabled={isChecking || !!emailError}
						className={`
                            w-full md:w-auto font-medium py-1 px-4 rounded-md 
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white 
                            transition duration-300 ease-in-out transform hover:scale-105 text-sm sm:text-base
                            ${
															isSubscribed
																? 'bg-red-500 text-white hover:bg-red-600'
																: 'bg-white text-black hover:bg-gray-100'
														}
                            ${
															isChecking || emailError
																? 'opacity-50 cursor-not-allowed'
																: ''
														}
                        `}
					>
						{isChecking
							? 'Проверка...'
							: isSubscribed
							? 'Отписаться'
							: 'Подписаться'}
					</button>
				</form>
			</div>

			<ToastContainer
				position='bottom-right'
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>
		</div>
	)
}

export default Email
