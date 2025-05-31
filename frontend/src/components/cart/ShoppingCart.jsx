import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spin, message, Checkbox } from 'antd'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

const ShoppingCart = () => {
	const [cartItems, setCartItems] = useState([])
	const [loading, setLoading] = useState(true)
	const [total, setTotal] = useState(0)
	const [selectedItems, setSelectedItems] = useState([])
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
			setSelectedItems([])
		} catch (error) {
			console.error('Error fetching cart:', error)
			message.error('Не удалось загрузить корзину')
			setCartItems([])
			setTotal(0)
		} finally {
			setLoading(false)
		}
	}

	const updateQuantity = async (
		productId,
		newQuantity,
		sizeId,
		availableQuantity
	) => {
		if (newQuantity < 1) return
		if (newQuantity > availableQuantity) {
			message.warning('Товара нет в наличии')
			return
		}

		try {
			await axios.put(
				`http://localhost:8080/api/v1/cart/${userId}/${productId}`,
				{
					quantity: newQuantity,
					size_id: sizeId,
				}
			)
			window.location.reload()
		} catch (error) {
			message.error('Не удалось обновить количество')
		}
	}

	const deleteSelectedItems = async () => {
		if (selectedItems.length === 0) {
			message.warning('Выберите товары для удаления')
			return
		}

		try {
			const response = await axios.delete(
				`http://localhost:8080/api/v1/cart/${userId}/items`,
				{
					data: selectedItems.map(item => ({
						productId: item.productId,
						sizeId: item.sizeId,
						quantity: item.quantity,
					})),
				}
			)

			message.success(response.data.message || 'Выбранные товары удалены')
			window.location.reload() // Replaced fetchCartItems() with page reload
		} catch (error) {
			console.error('Error deleting items:', error)

			if (error.response) {
				if (error.response.status === 404) {
					message.error('Некоторые товары не найдены в корзине')
				} else {
					message.error(
						error.response.data?.error || 'Не удалось удалить выбранные товары'
					)
				}
			} else {
				message.error('Ошибка сети или сервера')
			}
		}
	}

	const handleProductClick = (productId, e) => {
		e.stopPropagation()
		navigate(`/product/${productId}`)
	}

	const handleSelectItem = (productId, sizeId, quantity, isChecked) => {
		setSelectedItems(prev => {
			if (isChecked) {
				return prev.some(
					item => item.productId === productId && item.sizeId === sizeId
				)
					? prev
					: [...prev, { productId, sizeId, quantity }]
			} else {
				return prev.filter(
					item => !(item.productId === productId && item.sizeId === sizeId)
				)
			}
		})
	}

	const handleSelectAll = e => {
		const isChecked =
			e?.target?.checked ?? !(selectedItems.length === cartItems.length)

		if (isChecked) {
			setSelectedItems(
				cartItems.map(item => ({
					productId: item.product_id,
					sizeId: item.size_id,
					quantity: item.quantity,
				}))
			)
		} else {
			setSelectedItems([])
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
	const allSelected =
		safeCartItems.length > 0 && selectedItems.length === safeCartItems.length
	const uniqueItemsCount = new Set(safeCartItems.map(item => item.product_id))
		.size

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
							Ой, тут пока пусто... но это легко исправить!
						</h2>
						<p className='text-gray-500 mb-8'>
							Добавляйте товары в корзину и возвращайтесь к ним в любое время.
							Самое время найти что-то интересное!
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
						<div className='py-6'>
							<div className='mb-4'>
								<div className='flex items-center justify-between border-b border-gray-200 pb-3'>
									<div className='flex items-center'>
										<Checkbox
											onChange={handleSelectAll}
											checked={allSelected}
											indeterminate={selectedItems.length > 0 && !allSelected}
											className='mr-2'
										/>
										<span
											onClick={() => handleSelectAll()}
											className='text-sm text-gray-600 cursor-pointer hover:text-gray-900 mr-4'
										>
											Выбрать все
										</span>
										{selectedItems.length > 0 && (
											<motion.button
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
												onClick={deleteSelectedItems}
												className='text-red-500 hover:text-red-700 text-sm flex items-center font-medium transition-colors'
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
												Удалить{' '}
												{selectedItems.reduce(
													(sum, item) => sum + item.quantity,
													0
												)}
											</motion.button>
										)}
									</div>
									<span className='text-sm text-gray-500'>
										{uniqueItemsCount} товаров
									</span>
								</div>
							</div>

							<AnimatePresence>
								{safeCartItems.map(item => {
									const isSelected = selectedItems.some(
										selected =>
											selected.productId === item.product_id &&
											selected.sizeId === item.size_id
									)

									return (
										<motion.div
											key={`${item.product_id}-${item.size_id}`}
											layout
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, scale: 0.8 }}
											transition={{ duration: 0.3 }}
											className='py-6 mb-6 border-b border-gray-100 flex hover:bg-gray-50 transition-colors rounded-lg'
										>
											<div className='flex items-start mr-4'>
												<Checkbox
													checked={isSelected}
													onChange={e =>
														handleSelectItem(
															item.product_id,
															item.size_id,
															item.quantity,
															e.target.checked
														)
													}
												/>
											</div>
											<div className='flex flex-1 flex-col sm:flex-row'>
												<div className='relative'>
													<div
														className='w-full sm:w-36 h-36 flex-shrink-0 mb-4 sm:mb-0 cursor-pointer p-2 bg-gray-50 rounded-lg'
														onClick={e =>
															handleProductClick(item.product_id, e)
														}
													>
														<img
															src={
																item.image_path
																	? `http://localhost:8080/static/${item.image_path}`
																	: 'https://placehold.co/300'
															}
															alt={item.name}
															className='w-full h-full object-contain'
															onError={e => {
																e.target.src = 'https://placehold.co/300'
															}}
														/>
													</div>
													<div className='absolute -top-2 -right-2 bg-black text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center'>
														x{item.quantity}
													</div>
												</div>
												<div className='flex-1 sm:ml-4 flex flex-col justify-between'>
													<div>
														<h2 className='text-lg font-semibold text-gray-800 mb-1'>
															{item.name || 'Без названия'}
														</h2>
														<p className='text-gray-500 text-sm mb-1'>
															Размер:{' '}
															<span className='font-medium'>
																{item.size || '—'}
															</span>
														</p>
														<p className='text-gray-800 text-base font-medium mb-2'>
															Br {item.price?.toFixed(2) || '0.00'}
														</p>
													</div>
												</div>
												<div className='flex flex-col items-end justify-between'>
													<p className='text-lg font-semibold text-gray-800'>
														Br{' '}
														{((item.price || 0) * (item.quantity || 1)).toFixed(
															2
														)}
													</p>
													<div className='flex items-center mt-2'>
														<motion.button
															whileTap={{ scale: 0.95 }}
															onClick={e => {
																e.stopPropagation()
																updateQuantity(
																	item.product_id,
																	item.quantity - 1,
																	item.size_id,
																	item.available_quantity
																)
															}}
															className='bg-gray-200 text-black px-3 py-1 rounded-l hover:bg-gray-300 disabled:opacity-50 transition-colors'
															disabled={item.quantity <= 1}
														>
															-
														</motion.button>
														<span className='bg-gray-100 px-4 py-1 text-base'>
															{item.quantity || 1}
														</span>
														<motion.button
															whileTap={{ scale: 0.95 }}
															onClick={e => {
																e.stopPropagation()
																updateQuantity(
																	item.product_id,
																	item.quantity + 1,
																	item.size_id,
																	item.available_quantity
																)
															}}
															className={`bg-gray-200 text-black px-3 py-1 rounded-r hover:bg-gray-300 transition-colors ${
																item.available_quantity === 0
																	? 'opacity-50 cursor-not-allowed'
																	: ''
															}`}
															disabled={item.available_quantity === 0}
														>
															+
														</motion.button>
													</div>
												</div>
											</div>
										</motion.div>
									)
								})}
							</AnimatePresence>

							<div className='flex justify-between mt-6 pt-4'>
								<motion.button
									whileHover={{ scale: 1.02, backgroundColor: '#1a1a1a' }}
									whileTap={{ scale: 0.98 }}
									onClick={() => navigate('/')}
									className='bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium w-full text-center'
								>
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
							className='bg-white rounded-lg shadow-md p-6 border border-gray-100 sticky top-4'
						>
							<h2 className='text-xl font-bold mb-4 border-b border-gray-200 pb-2 text-gray-800'>
								Итого
							</h2>
							<div className='space-y-3 text-gray-600 mb-4'>
								{safeCartItems.map(item => (
									<div
										key={`${item.product_id}-${item.size_id}`}
										className='flex justify-between py-1'
									>
										<span className='truncate max-w-[160px] text-gray-700 text-sm'>
											{item.name || 'Товар'} × {item.quantity || 1}
										</span>
										<span className='text-gray-800 font-medium text-sm'>
											Br {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
										</span>
									</div>
								))}
							</div>
							<div className='border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold text-lg text-gray-800'>
								<span>Итого:</span>
								<span>Br {total.toFixed(2)}</span>
							</div>
							<motion.button
								whileHover={{ scale: 1.02, backgroundColor: '#1a1a1a' }}
								whileTap={{ scale: 0.98 }}
								onClick={() => navigate('/checkout')}
								className='w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors mt-6 flex flex-col items-center'
								disabled={safeCartItems.length === 0}
							>
								<span className='text-base font-medium'>К оформлению</span>
								<div className='mt-1 text-xs text-gray-300'>
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
