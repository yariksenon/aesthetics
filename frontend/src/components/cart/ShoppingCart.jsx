import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spin, message } from 'antd'
import axios from 'axios'

const ShoppingCart = () => {
	const [cartItems, setCartItems] = useState([])
	const [loading, setLoading] = useState(true)
	const [total, setTotal] = useState(0)
	const navigate = useNavigate()

	// Получаем userId из localStorage или используем дефолтный (для демо)
	const userId = localStorage.getItem('userId') || 1

	useEffect(() => {
		fetchCartItems()
	}, [])

	const fetchCartItems = async () => {
		try {
			setLoading(true)
			const response = await axios.get(
				`http://localhost:8080/api/v1/cart/${userId}`
			)

			// Гарантируем, что items всегда будет массивом
			const items = Array.isArray(response.data?.items)
				? response.data.items
				: []
			const calculatedTotal = items.reduce(
				(sum, item) => sum + item.price * item.quantity,
				0
			)

			setCartItems(items)
			setTotal(calculatedTotal)
		} catch (error) {
			console.error('Error fetching cart:', error)
			message.error('Не удалось загрузить корзину')
			setCartItems([])
			setTotal(0)
		} finally {
			setLoading(false)
		}
	}

	const updateQuantity = async (productId, newQuantity) => {
		if (newQuantity < 1) return

		try {
			await axios.put(
				`http://localhost:8080/api/v1/cart/${userId}/${productId}`,
				{
					quantity: newQuantity,
				}
			)
			await fetchCartItems()
			message.success('Количество обновлено')
		} catch (error) {
			console.error('Error updating quantity:', error)
			message.error('Не удалось обновить количество')
		}
	}

	const removeFromCart = async productId => {
		try {
			await axios.delete(
				`http://localhost:8080/api/v1/cart/${userId}/${productId}`
			)
			await fetchCartItems()
			message.success('Товар удален из корзины')
		} catch (error) {
			console.error('Error removing item:', error)
			message.error('Не удалось удалить товар')
		}
	}

	const clearCart = async () => {
		try {
			await axios.delete(`http://localhost:8080/api/v1/cart/${userId}/clear`)
			setCartItems([])
			setTotal(0)
			message.success('Корзина очищена')
		} catch (error) {
			console.error('Error clearing cart:', error)
			message.error('Не удалось очистить корзину')
		}
	}

	if (loading) {
		return (
			<div className='flex justify-center items-center min-h-screen'>
				<Spin size='large' tip='Загрузка корзины...' />
			</div>
		)
	}

	// Безопасный рендеринг товаров
	const safeCartItems = Array.isArray(cartItems) ? cartItems : []

	return (
		<div className='container mx-auto px-4 py-8 bg-white text-black min-h-screen'>
			<h1 className='text-3xl font-bold mb-8 border-b border-gray-300 pb-2'>
				Корзина
			</h1>

			{safeCartItems.length === 0 ? (
				<div className='text-center py-12'>
					<p className='text-gray-500 text-xl mb-6'>Ваша корзина пуста</p>
					<button
						onClick={() => navigate('/')}
						className='bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors'
					>
						Вернуться к покупкам
					</button>
				</div>
			) : (
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					<div className='lg:col-span-2'>
						<div className='bg-white rounded-lg shadow-md p-6 border border-gray-200'>
							{safeCartItems.map(item => (
								<div
									key={item.id || item.product_id}
									className='p-4 border-b border-gray-200 flex flex-col sm:flex-row hover:bg-gray-50 transition-colors'
								>
									<div className='w-full sm:w-32 h-32 flex-shrink-0 mb-4 sm:mb-0'>
										<img
											src={
												item.image_path
													? `http://localhost:8080/static/${item.image_path}`
													: 'https://placehold.co/200'
											}
											alt={item.name}
											className='w-full h-full object-contain'
											onError={e => {
												e.target.src = 'https://placehold.co/200'
											}}
										/>
									</div>
									<div className='flex-1 sm:ml-4'>
										<h2 className='text-lg font-semibold'>
											{item.name || 'Без названия'}
										</h2>
										<p className='text-gray-600'>
											Br {item.price?.toFixed(2) || '0.00'}
										</p>

										<div className='mt-3 flex items-center'>
											<button
												onClick={() =>
													updateQuantity(item.product_id, item.quantity - 1)
												}
												className='bg-gray-200 text-black px-3 py-1 rounded-l hover:bg-gray-100 disabled:opacity-50'
												disabled={item.quantity <= 1}
											>
												-
											</button>
											<span className='bg-gray-100 px-4 py-1'>
												{item.quantity || 1}
											</span>
											<button
												onClick={() =>
													updateQuantity(item.product_id, item.quantity + 1)
												}
												className='bg-gray-200 text-black px-3 py-1 rounded-r hover:bg-gray-100'
											>
												+
											</button>
										</div>

										<button
											onClick={() => removeFromCart(item.product_id)}
											className='mt-3 text-red-500 hover:text-red-700 text-sm flex items-center'
										>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												className='h-4 w-4 mr-1'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
												/>
											</svg>
											Удалить
										</button>
									</div>
									<div className='mt-2 sm:mt-0 sm:ml-4 text-right'>
										<p className='text-lg font-semibold'>
											Br {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
										</p>
									</div>
								</div>
							))}

							<button
								onClick={clearCart}
								className='mt-6 text-red-500 hover:text-red-700 text-sm flex items-center'
							>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-4 w-4 mr-1'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
									/>
								</svg>
								Очистить корзину
							</button>
						</div>
					</div>

					<div className='lg:col-span-1'>
						<div className='bg-white rounded-lg shadow-md p-6 border border-gray-200 sticky top-4'>
							<h2 className='text-xl font-bold mb-4 border-b border-gray-200 pb-2'>
								Итого
							</h2>
							<div className='space-y-3 text-gray-600 mb-4'>
								{safeCartItems.map(item => (
									<div
										key={item.id || item.product_id}
										className='flex justify-between'
									>
										<span className='truncate max-w-[160px]'>
											{item.name || 'Товар'} × {item.quantity || 1}
										</span>
										<span>
											Br {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
										</span>
									</div>
								))}
							</div>
							<div className='border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold text-lg'>
								<span>Всего:</span>
								<span>Br {total.toFixed(2)}</span>
							</div>
							<button
								onClick={() => navigate('/checkout')}
								className='w-full mt-6 bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors'
								disabled={safeCartItems.length === 0}
							>
								Оформить заказ
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default ShoppingCart
