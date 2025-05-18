import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	Card,
	Button,
	Spin,
	Empty,
	message,
	Modal,
	Typography,
	Divider,
} from 'antd'
import { HeartFilled, DeleteOutlined } from '@ant-design/icons'
import { useCart } from '../../context/CartContext'
import { motion, AnimatePresence } from 'framer-motion'

const { Title, Text } = Typography

const WishlistPage = () => {
	const [userId, setUserId] = useState(null)
	const [wishlistItems, setWishlistItems] = useState([])
	const [loading, setLoading] = useState(true)
	const [deletingId, setDeletingId] = useState(null)
	const { addToCart } = useCart()
	const navigate = useNavigate()

	useEffect(() => {
		const storedUserId = localStorage.getItem('userId')
		if (!storedUserId) {
			message.error('Пожалуйста, войдите в систему')
			navigate('/login')
			return
		}
		setUserId(storedUserId)
	}, [navigate])

	const fetchWishlist = async () => {
		if (!userId) return

		setLoading(true)
		try {
			const response = await fetch(
				`http://localhost:8080/api/v1/wishlist/${userId}`
			)
			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Ошибка загрузки списка желаний')
			}
			const data = await response.json()
			setWishlistItems(data.items || [])
		} catch (error) {
			message.error(error.message)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (userId) {
			fetchWishlist()
		}
	}, [userId])

	const handleRemoveFromWishlist = async productId => {
		setDeletingId(productId)
		try {
			const response = await fetch(
				`http://localhost:8080/api/v1/wishlist/${userId}/${productId}`,
				{ method: 'DELETE' }
			)

			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.error || 'Не удалось удалить товар')
			}

			message.success(result.message)
			setWishlistItems(prev => prev.filter(item => item.id !== productId))
		} catch (error) {
			message.error(error.message)
		} finally {
			setDeletingId(null)
		}
	}

	const confirmRemove = (productId, productName) => {
		Modal.confirm({
			title: 'Подтверждение удаления',
			content: `Вы уверены, что хотите удалить "${productName}" из списка желаний?`,
			okText: 'Удалить',
			cancelText: 'Отмена',
			okButtonProps: { danger: true },
			onOk: () => handleRemoveFromWishlist(productId),
		})
	}

	if (!userId || loading) {
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
				<Title level={2} className='m-0 flex items-center gap-3'>
					<span className='text-black'>Избранное</span>
					<div className='relative'>
						<HeartFilled className='text-red-500' />
						{wishlistItems.length > 0 && (
							<span
								className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    text-white text-xs font-bold'
							>
								{wishlistItems.length}
							</span>
						)}
					</div>
				</Title>
			</motion.div>

			<Divider className='my-6' />

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
							<HeartFilled className='text-6xl text-gray-400 mb-6 mx-auto' />
						</motion.div>
						<h2 className='text-2xl font-medium text-gray-700 mb-3'>
							Ваш список желаний пуст
						</h2>
						<p className='text-gray-500 mb-8'>
							Похоже, вы еще не добавили товары в избранное. Начните покупки
							прямо сейчас!
						</p>
						<motion.button
							whileHover={{ scale: 1.03, backgroundColor: '#1a1a1a' }}
							whileTap={{ scale: 0.98 }}
							onClick={() => navigate('/products')}
							className='bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors text-lg font-medium shadow-md'
						>
							Перейти к товарам
						</motion.button>
					</div>
				</motion.div>
			) : (
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
					<AnimatePresence>
						{wishlistItems.map(product => (
							<motion.div
								key={product.id}
								layout
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.8 }}
								transition={{ duration: 0.3 }}
								className='h-full'
							>
								<Card
									hoverable
									className='w-full h-full border-none shadow-sm hover:shadow-md transition-all duration-300'
									onClick={() => navigate(`/product/${product.id}`)}
									cover={
										<div className='h-80 bg-gray-50 flex items-center justify-center overflow-hidden'>
											<motion.img
												alt={product.name}
												src={
													product.image_path
														? `http://localhost:8080/static/${product.image_path}`
														: 'https://placehold.co/600x900?text=No+Image'
												}
												className='w-full h-full object-contain'
												whileHover={{ scale: 1.05 }}
												transition={{ duration: 0.3 }}
												onError={e => {
													e.target.src =
														'https://placehold.co/600x900?text=Error+Loading'
												}}
											/>
										</div>
									}
									actions={[
										<motion.div
											whileHover={{ scale: 1.1 }}
											whileTap={{ scale: 0.9 }}
											key='delete'
										>
											<Button
												icon={<DeleteOutlined />}
												shape='circle'
												size='large'
												className='border-none text-gray-500 hover:text-red-500'
												loading={deletingId === product.id}
												onClick={e => {
													e.stopPropagation()
													confirmRemove(product.id, product.name)
												}}
											/>
										</motion.div>,
									]}
								>
									<Card.Meta
										title={
											<Text
												ellipsis={{ tooltip: product.name }}
												className='font-medium text-lg'
											>
												{product.name}
											</Text>
										}
										description={
											<div className='flex justify-between items-center mt-4'>
												<Text className='font-semibold text-xl'>
													{product.price.toFixed(2)} руб.
												</Text>
											</div>
										}
									/>
								</Card>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			)}
		</div>
	)
}

export default WishlistPage
