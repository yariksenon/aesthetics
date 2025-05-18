import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spin, message, Divider } from 'antd'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

const ShoppingCart = () => {
	const [cartItems, setCartItems] = useState([])
	const [loading, setLoading] = useState(true)
	const [total, setTotal] = useState(0)
	const navigate = useNavigate()

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

	const updateQuantity = async (productId, newQuantity, sizeId) => {
		if (newQuantity < 1) return

		try {
			await axios.put(
				`http://localhost:8080/api/v1/cart/${userId}/${productId}`,
				{
					quantity: newQuantity,
					size_id: sizeId,
				}
			)
			await fetchCartItems()
			message.success('Количество обновлено')
		} catch (error) {
			console.error('Error updating quantity:', error)
			message.error('Не удалось обновить количество')
		}
	}

	const clearCart = async () => {
		try {
			await axios.delete(`http://localhost:8080/api/v1/cart/${userId}/clear`)
			setCartItems([]) // Ensure state is cleared
			setTotal(0) // Reset total
			await fetchCartItems() // Refresh cart to confirm
			message.success('Корзина очищена')
		} catch (error) {
			console.error('Error clearing cart:', error)
			message.error('Не удалось очистить корзину')
			setCartItems([]) // Fallback to clear state on error
			setTotal(0)
		}
	}

	if (loading) {
		return (
			<div className='flex justify-center items-center h-screen'>
				<Spin size='large' />
			</div>
		)
	}

	const safeCartItems = Array.isArray(cartItems) ? cartItems : []

	return (
		<div className='container mx-auto py-8'>
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='mb-8'
			>
				<h1 className='text-3xl font-bold m-0'>Корзина</h1>
			</motion.div>

			<Divider className='my-6' />

			{safeCartItems.length === 0 ? (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
					className='text-center py-12'
				>
					<div className='max-w-md mx-auto'>
						<motion.div
							animate={{ y: [-5, 5, -5] }}
							transition={{ repeat: Infinity, duration: 3 }}
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-24 w-24 mx-auto text-gray-400 mb-6'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={1.5}
									d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
								/>
							</svg>
						</motion.div>
						<h2 className='text-2xl font-medium text-gray-700 mb-3'>
							Ваша корзина пуста
						</h2>
						<p className='text-gray-500 mb-8'>
							Похоже, вы еще не добавили товары в корзину. Начните покупки прямо
							сейчас!
						</p>
						<motion.button
							whileHover={{ scale: 1.03, backgroundColor: '#1a1a1a' }}
							whileTap={{ scale: 0.98 }}
							onClick={() => navigate('/')}
							className='bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors text-lg font-medium shadow-md'
						>
							Перейти к товарам
						</motion.button>
					</div>
				</motion.div>
			) : (
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					<div className='lg:col-span-2'>
						<div className='bg-white rounded-lg shadow-sm p-6 border border-gray-200'>
							<AnimatePresence>
								{safeCartItems.map(item => (
									<motion.div
										key={`${item.product_id}-${item.size_id}`}
										layout
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, scale: 0.8 }}
										transition={{ duration: 0.3 }}
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
											<p className='text-gray-500 text-sm mt-1'>
												Размер:{' '}
												<span className='font-medium'>{item.size || '—'}</span>
											</p>
											<p className='text-gray-600 mt-1'>
												Br {item.price?.toFixed(2) || '0.00'}
											</p>
											<div className='mt-3 flex items-center'>
												<motion.button
													whileTap={{ scale: 0.95 }}
													onClick={() =>
														updateQuantity(
															item.product_id,
															item.quantity - 1,
															item.size_id
														)
													}
													className='bg-gray-200 text-black px-3 py-1 rounded-l hover:bg-gray-100 disabled:opacity-50'
													disabled={item.quantity <= 1}
												>
													-
												</motion.button>
												<span className='bg-gray-100 px-4 py-1'>
													{item.quantity || 1}
												</span>
												<motion.button
													whileTap={{ scale: 0.95 }}
													onClick={() =>
														updateQuantity(
															item.product_id,
															item.quantity + 1,
															item.size_id
														)
													}
													className='bg-gray-200 text-black px-3 py-1 rounded-r hover:bg-gray-100'
												>
													+
												</motion.button>
											</div>
										</div>
										<div className='mt-2 sm:mt-0 sm:ml-4 text-right'>
											<p className='text-lg font-semibold'>
												Br{' '}
												{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
											</p>
										</div>
									</motion.div>
								))}
							</AnimatePresence>

							<div className='flex justify-between mt-6'>
								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									onClick={clearCart}
									className='text-red-500 hover:text-red-700 text-sm flex items-center'
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
								</motion.button>

								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									onClick={() => navigate('/')}
									className='text-blue-500 hover:text-blue-700 text-sm flex items-center'
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
											d='M10 19l-7-7m0 0l7-7m-7 7h18'
										/>
									</svg>
									Продолжить покупки
								</motion.button>
							</div>
						</div>
					</div>

					<div className='lg:col-span-1'>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							className='bg-white rounded-lg shadow-sm p-6 border border-gray-200 sticky top-4'
						>
							<h2 className='text-xl font-bold mb-4 border-b border‌گرay-200 pb-2'>
								Итого
							</h2>
							<div className='space-y-3 text-gray-600 mb-4'>
								{safeCartItems.map(item => (
									<div
										key={`${item.product_id}-${item.size_id}`}
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
							<motion.button
								whileHover={{ scale: 1.02, backgroundColor: '#1a1a1a' }}
								whileTap={{ scale: 0.98 }}
								onClick={() => navigate('/checkout')}
								className='w-full bg-black text-white py-2 px-3 rounded-md hover:bg-gray-800 transition-colors relative flex flex-col items-center'
								disabled={safeCartItems.length === 0}
							>
								<span className='text-base font-medium'>К оформлению</span>
								<div className='mt-2 text-xs text-gray-300'>
									{safeCartItems.reduce(
										(sum, item) => sum + (item.quantity || 0),
										0
									)}{' '}
									товара - {total.toFixed(2)} BYN
								</div>
							</motion.button>
						</motion.div>
					</div>
				</div>
			)}
		</div>
	)
}

export default ShoppingCart
