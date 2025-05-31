import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Spin, message, Tag } from 'antd'
import { HeartOutlined, HeartFilled } from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'

const WishlistPage = () => {
	const [wishlistItems, setWishlistItems] = useState([])
	const [loading, setLoading] = useState(true)
	const [hoveredProduct, setHoveredProduct] = useState(null)
	const navigate = useNavigate()
	const userId = localStorage.getItem('userId')

	const isProductAvailable = product => {
		return product.sizes?.some(size => size.quantity > 0)
	}

	const fetchWishlist = async () => {
		setLoading(true)
		if (!userId) {
			setLoading(false)
			return
		}

		try {
			const response = await fetch(
				`http://localhost:8080/api/v1/wishlist/${userId}`
			)
			if (!response.ok) throw new Error('Не удалось загрузить избранное')
			const data = await response.json()

			setWishlistItems(data.items || [])
		} catch (error) {
			message.error(error.message)
		} finally {
			setLoading(false)
		}
	}

	const checkAuth = () => {
		if (!userId) {
			message.warning('Для управления избранным необходимо войти в аккаунт')
			return false
		}
		return true
	}

	const handleRemoveFromWishlist = async (productId, e) => {
		e.stopPropagation()
		if (!checkAuth()) return

		try {
			const response = await fetch(
				`http://localhost:8080/api/v1/wishlist/${userId}/${productId}`,
				{ method: 'DELETE' }
			)
			if (!response.ok) throw new Error('Ошибка при удалении из избранного')

			message.success('Товар удалён из избранного')
			window.location.reload()
		} catch (error) {
			message.error(error.message)
		}
	}

	const handleMouseEnter = productId => {
		setHoveredProduct(productId)
	}

	const handleMouseLeave = productId => {
		setHoveredProduct(null)
	}

	useEffect(() => {
		fetchWishlist()
	}, [])

	if (!userId) {
		return (
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
								d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
							/>
						</svg>
					</motion.div>
					<h2 className='text-2xl font-medium text-gray-700 mb-3'>
						Необходима авторизация
					</h2>
					<p className='text-gray-500 mb-8'>
						Для просмотра избранного войдите в свой аккаунт
					</p>
					<motion.button
						whileHover={{ scale: 1.03, backgroundColor: '#1a1a1a' }}
						whileTap={{ scale: 0.98 }}
						onClick={() => navigate('/login')}
						className='bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors text-lg font-medium shadow-md'
					>
						Войти в аккаунт
					</motion.button>
				</div>
			</motion.div>
		)
	}

	if (loading) {
		return (
			<div className='flex justify-center items-center h-screen'>
				<Spin size='large' />
			</div>
		)
	}

	return (
		<div className='container mx-auto py-8'>
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='mb-8'
			>
				<h1 className='text-3xl font-bold m-0'>Избранное</h1>
			</motion.div>

			{wishlistItems.length === 0 ? (
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
									d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
								/>
							</svg>
						</motion.div>
						<h2 className='text-2xl font-medium text-gray-700 mb-3'>
							Ваш список избранного пока пуст... но это можно исправить!
						</h2>
						<p className='text-gray-500 mb-8'>
							Добавьте товары в избранное, чтобы легко находить их позже.
							Начните исследовать лучшие предложения прямо сейчас!
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
				<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
					<AnimatePresence>
						{wishlistItems.map(product => {
							const currentImage =
								product.image_path || 'https://placehold.co/600x900'
							const isAvailable = isProductAvailable(product)

							return (
								<motion.div
									key={product.id}
									layout
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.8 }}
									transition={{ duration: 0.3 }}
									className='relative'
								>
									<Card
										hoverable
										onClick={() =>
											isAvailable && navigate(`/product/${product.id}`)
										}
										bordered={false}
										onMouseEnter={() => handleMouseEnter(product.id)}
										onMouseLeave={() => handleMouseLeave(product.id)}
										className='shadow-sm hover:shadow-md transition-shadow'
										style={{
											cursor: isAvailable ? 'pointer' : 'default',
											opacity: isAvailable ? 1 : 0.7,
										}}
										bodyStyle={{ padding: 0 }}
										cover={
											<div className='relative pt-[150%]'>
												{!isAvailable && (
													<div className='absolute inset-0 bg-white bg-opacity-70 flex justify-center items-center z-10'>
														<Tag
															color='red'
															className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm px-3 py-1 z-20'
														>
															Нет в наличии
														</Tag>
													</div>
												)}

												<img
													alt={product.name}
													src={`http://localhost:8080/static/${currentImage}`}
													className='absolute top-0 left-0 w-full h-full object-contain transition-opacity duration-300'
													style={{
														filter: isAvailable ? 'none' : 'grayscale(80%)',
													}}
													onError={e => {
														e.currentTarget.src = 'https://placehold.co/600x900'
														e.currentTarget.className =
															'absolute top-0 left-0 w-full h-full object-contain p-4 bg-gray-100'
													}}
												/>

												<motion.div
													whileHover={{ scale: 1.1 }}
													whileTap={{ scale: 0.9 }}
													className='absolute top-2 right-2 z-30'
												>
													<Button
														icon={<HeartFilled style={{ color: '#ff4d4f' }} />}
														className='border-none shadow-md'
														onClick={e =>
															handleRemoveFromWishlist(product.id, e)
														}
													/>
												</motion.div>
											</div>
										}
									>
										<div className='p-2'>
											<div className='font-semibold text-sm truncate'>
												{product.name}
											</div>
											<div className='text-gray-500 text-xs'>
												{product.brand_name || 'Без бренда'}
											</div>
											<div className='font-bold text-sm mt-1'>
												{product.price.toFixed(2)} BYN
											</div>
										</div>
									</Card>
								</motion.div>
							)
						})}
					</AnimatePresence>
				</div>
			)}
		</div>
	)
}

export default WishlistPage
