import React, { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Order = () => {
	const { cart, cartTotal, clearCart } = useCart()
	const navigate = useNavigate()
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		phone: '',
		email: '',
		address: '',
		apartment: '',
		city: '',
		postalCode: '',
		deliveryMethod: 'courier',
		paymentMethod: 'cash',
		notes: '',
	})

	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleInputChange = e => {
		const { name, value } = e.target
		setFormData(prev => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async e => {
		e.preventDefault()
		setIsSubmitting(true)

		// Валидация
		if (!formData.firstName || !formData.phone) {
			toast.error('Пожалуйста, заполните обязательные поля')
			setIsSubmitting(false)
			return
		}

		try {
			// Создаем объект заказа
			const order = {
				customer: formData,
				items: cart,
				total: cartTotal,
				orderDate: new Date().toISOString(),
				status: 'pending',
			}

			// Здесь должна быть реальная отправка на сервер
			console.log('Order data:', order)

			// Имитация запроса
			await new Promise(resolve => setTimeout(resolve, 1000))

			toast.success('Заказ успешно оформлен!')
			clearCart()
			navigate('/order-success') // Перенаправляем на страницу успеха
		} catch (error) {
			console.error('Ошибка при оформлении заказа:', error)
			toast.error('Произошла ошибка при оформлении заказа')
		} finally {
			setIsSubmitting(false)
		}
	}

	if (cart.length === 0) {
		return (
			<div className='text-center py-12'>
				<h2 className='text-xl font-bold mb-4'>Ваша корзина пуста</h2>
				<button
					onClick={() => navigate('/')}
					className='px-4 py-2 bg-black text-white rounded hover:bg-gray-800'
				>
					Вернуться к покупкам
				</button>
			</div>
		)
	}

	return (
		<div className='container mx-auto px-4 py-8 max-w-6xl'>
			<h1 className='text-2xl font-bold mb-8'>Оформление заказа</h1>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				{/* Форма оформления */}
				<div className='lg:col-span-2'>
					<form onSubmit={handleSubmit} className='space-y-6'>
						{/* Личная информация */}
						<div className='bg-white p-6 rounded-lg shadow border border-gray-200'>
							<h2 className='text-lg font-semibold mb-4'>
								Контактная информация
							</h2>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Имя*
									</label>
									<input
										type='text'
										name='firstName'
										value={formData.firstName}
										onChange={handleInputChange}
										className='w-full px-3 py-2 border border-gray-300 rounded-md'
										required
									/>
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Фамилия
									</label>
									<input
										type='text'
										name='lastName'
										value={formData.lastName}
										onChange={handleInputChange}
										className='w-full px-3 py-2 border border-gray-300 rounded-md'
									/>
								</div>
							</div>

							<div className='mt-4'>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Телефон*
								</label>
								<input
									type='tel'
									name='phone'
									value={formData.phone}
									onChange={handleInputChange}
									className='w-full px-3 py-2 border border-gray-300 rounded-md'
									required
								/>
							</div>

							<div className='mt-4'>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Email
								</label>
								<input
									type='email'
									name='email'
									value={formData.email}
									onChange={handleInputChange}
									className='w-full px-3 py-2 border border-gray-300 rounded-md'
								/>
							</div>
						</div>

						{/* Адрес доставки */}
						<div className='bg-white p-6 rounded-lg shadow border border-gray-200'>
							<h2 className='text-lg font-semibold mb-4'>Адрес доставки</h2>

							<div className='mb-4'>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Способ доставки
								</label>
								<select
									name='deliveryMethod'
									value={formData.deliveryMethod}
									onChange={handleInputChange}
									className='w-full px-3 py-2 border border-gray-300 rounded-md'
								>
									<option value='courier'>Курьерская доставка</option>
									<option value='pickup'>Самовывоз</option>
									<option value='post'>Почта</option>
								</select>
							</div>

							{formData.deliveryMethod !== 'pickup' && (
								<>
									<div className='mb-4'>
										<label className='block text-sm font-medium text-gray-700 mb-1'>
											Адрес*
										</label>
										<input
											type='text'
											name='address'
											value={formData.address}
											onChange={handleInputChange}
											className='w-full px-3 py-2 border border-gray-300 rounded-md'
											required={formData.deliveryMethod !== 'pickup'}
										/>
									</div>

									<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
										<div>
											<label className='block text-sm font-medium text-gray-700 mb-1'>
												Квартира/офис
											</label>
											<input
												type='text'
												name='apartment'
												value={formData.apartment}
												onChange={handleInputChange}
												className='w-full px-3 py-2 border border-gray-300 rounded-md'
											/>
										</div>

										<div>
											<label className='block text-sm font-medium text-gray-700 mb-1'>
												Город*
											</label>
											<input
												type='text'
												name='city'
												value={formData.city}
												onChange={handleInputChange}
												className='w-full px-3 py-2 border border-gray-300 rounded-md'
												required={formData.deliveryMethod !== 'pickup'}
											/>
										</div>

										<div>
											<label className='block text-sm font-medium text-gray-700 mb-1'>
												Почтовый индекс
											</label>
											<input
												type='text'
												name='postalCode'
												value={formData.postalCode}
												onChange={handleInputChange}
												className='w-full px-3 py-2 border border-gray-300 rounded-md'
											/>
										</div>
									</div>
								</>
							)}
						</div>

						{/* Способ оплаты */}
						<div className='bg-white p-6 rounded-lg shadow border border-gray-200'>
							<h2 className='text-lg font-semibold mb-4'>Способ оплаты</h2>

							<div className='space-y-3'>
								<label className='flex items-center space-x-3'>
									<input
										type='radio'
										name='paymentMethod'
										value='cash'
										checked={formData.paymentMethod === 'cash'}
										onChange={handleInputChange}
										className='h-4 w-4 text-black focus:ring-black'
									/>
									<span>Наличными при получении</span>
								</label>

								<label className='flex items-center space-x-3'>
									<input
										type='radio'
										name='paymentMethod'
										value='card'
										checked={formData.paymentMethod === 'card'}
										onChange={handleInputChange}
										className='h-4 w-4 text-black focus:ring-black'
									/>
									<span>Оплата картой онлайн</span>
								</label>

								<label className='flex items-center space-x-3'>
									<input
										type='radio'
										name='paymentMethod'
										value='bank'
										checked={formData.paymentMethod === 'bank'}
										onChange={handleInputChange}
										className='h-4 w-4 text-black focus:ring-black'
									/>
									<span>Банковский перевод</span>
								</label>
							</div>
						</div>

						{/* Дополнительная информация */}
						<div className='bg-white p-6 rounded-lg shadow border border-gray-200'>
							<h2 className='text-lg font-semibold mb-4'>
								Дополнительная информация
							</h2>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Примечания к заказу
								</label>
								<textarea
									name='notes'
									value={formData.notes}
									onChange={handleInputChange}
									rows='3'
									className='w-full px-3 py-2 border border-gray-300 rounded-md'
								></textarea>
							</div>
						</div>

						<button
							type='submit'
							disabled={isSubmitting}
							className={`w-full py-3 px-4 rounded-md text-white font-medium ${
								isSubmitting ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'
							}`}
						>
							{isSubmitting ? 'Оформляем заказ...' : 'Подтвердить заказ'}
						</button>
					</form>
				</div>

				{/* Сводка заказа */}
				<div className='lg:col-span-1'>
					<div className='bg-white p-6 rounded-lg shadow border border-gray-200 sticky top-4'>
						<h2 className='text-lg font-semibold mb-4'>Ваш заказ</h2>

						<div className='divide-y divide-gray-200'>
							{cart.map(item => (
								<div key={item.id} className='py-3 flex justify-between'>
									<div className='flex items-center'>
										<div className='w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-3'>
											<img
												src={`http://localhost:8080/static/${item.image_path}`}
												alt={item.name}
												className='w-full h-full object-cover'
												onError={e => {
													e.target.src =
														'https://via.placeholder.com/80x80?text=No+Image'
													e.target.className =
														'w-full h-full object-contain p-2'
												}}
											/>
										</div>
										<div>
											<h3 className='font-medium'>{item.name}</h3>
											<p className='text-sm text-gray-500'>
												Количество: {item.quantity}
											</p>
										</div>
									</div>
									<div className='font-medium'>
										Br {(item.price * item.quantity).toFixed(2)}
									</div>
								</div>
							))}
						</div>

						<div className='border-t border-gray-200 pt-4 mt-4 space-y-3'>
							<div className='flex justify-between'>
								<span>Промежуточный итог</span>
								<span>Br {cartTotal.toFixed(2)}</span>
							</div>

							<div className='flex justify-between'>
								<span>Доставка</span>
								<span>
									{formData.deliveryMethod === 'pickup'
										? 'Бесплатно'
										: 'Рассчитывается отдельно'}
								</span>
							</div>

							<div className='flex justify-between font-bold text-lg pt-2'>
								<span>Итого</span>
								<span>Br {cartTotal.toFixed(2)}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Order
