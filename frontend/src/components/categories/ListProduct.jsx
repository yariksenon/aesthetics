import React, { useState, useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, Button, Spin, Empty, message, notification } from 'antd'
import {
	HeartOutlined,
	HeartFilled,
	ShoppingCartOutlined,
} from '@ant-design/icons'

const PATH_TO_CATEGORY_MAP = { winter: 18, summer: 19, spring: 20, autumn: 21 }

const ListProduct = ({ filters = {} }) => {
	const [products, setProducts] = useState([])
	const [filteredProducts, setFilteredProducts] = useState([])
	const [loading, setLoading] = useState(true)
	const [api, contextHolder] = notification.useNotification()
	const { addToCart } = useCart()
	const [wishlist, setWishlist] = useState([])
	const [processingWishlist, setProcessingWishlist] = useState([])
	const navigate = useNavigate()
	const location = useLocation()

	// Получаем userId из localStorage
	const userId = localStorage.getItem('userId')

	const getSubCategoryIdFromPath = () => {
		const path = location.pathname.split('/').pop().toLowerCase()
		return PATH_TO_CATEGORY_MAP[path] || null
	}

	// Функция для работы с вишлистом
	const handleWishlistClick = async (product, e) => {
		e.stopPropagation()

		if (!userId) {
			message.error('Войдите в систему, чтобы добавлять товары в вишлист')
			navigate('/login')
			return
		}

		const productId = product.id
		setProcessingWishlist(prev => [...prev, productId])

		try {
			const isInWishlist = wishlist.some(item => item.id === productId)
			const url = `http://localhost:8080/api/v1/wishlist/${userId}/${productId}`

			const response = await fetch(url, {
				method: isInWishlist ? 'DELETE' : 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			})

			if (!response.ok) {
				throw new Error('Ошибка при обновлении вишлиста')
			}

			if (isInWishlist) {
				setWishlist(prev => prev.filter(item => item.id !== productId))
				message.success('Товар удален из вишлиста')
			} else {
				setWishlist(prev => [
					...prev,
					{
						id: product.id,
						name: product.name,
						price: product.price,
						image_path: product.image_path,
					},
				])
				message.success('Товар добавлен в вишлист')
			}
		} catch (error) {
			console.error('Ошибка:', error)
			message.error(error.message)
		} finally {
			setProcessingWishlist(prev => prev.filter(id => id !== productId))
		}
	}

	// Загрузка продуктов и вишлиста
	useEffect(() => {
		const fetchData = async () => {
			try {
				// Загружаем продукты
				const productsResponse = await fetch(
					'http://localhost:8080/api/v1/admin/products'
				)
				const productsData = await productsResponse.json()
				setProducts(productsData || [])

				// Загружаем вишлист если пользователь авторизован
				if (userId) {
					const wishlistResponse = await fetch(
						`http://localhost:8080/api/v1/wishlist/${userId}`
					)
					if (wishlistResponse.ok) {
						const wishlistData = await wishlistResponse.json()
						setWishlist(wishlistData.items || [])
					}
				}
			} catch (error) {
				api.error({
					message: 'Ошибка загрузки',
					description: 'Не удалось загрузить данные',
				})
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [userId])

	// Фильтрация и сортировка
	useEffect(() => {
		if (!products.length) return

		let result = [...products]
		const subCategoryId = getSubCategoryIdFromPath()

		if (subCategoryId) {
			result = result.filter(p => p.sub_category_id === subCategoryId)
		}
		if (filters.colors?.length) {
			result = result.filter(p =>
				filters.colors.includes(p.color?.toLowerCase())
			)
		}
		if (filters.sizes?.length) {
			result = result.filter(p => filters.sizes.includes(p.size))
		}
		if (filters.priceRange) {
			result = result.filter(
				p =>
					p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
			)
		}
		if (filters.availability === 'in-stock') {
			result = result.filter(p => p.quantity > 0)
		}
		if (filters.availability === 'out-of-stock') {
			result = result.filter(p => p.quantity <= 0)
		}

		if (filters.sortBy === 'price-asc') result.sort((a, b) => a.price - b.price)
		if (filters.sortBy === 'price-desc')
			result.sort((a, b) => b.price - a.price)
		if (filters.sortBy === 'newest') {
			result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
		}

		setFilteredProducts(result)
	}, [filters, products, location.pathname])

	const handleAddToCart = async (product, e) => {
		e.stopPropagation()
		if (product.quantity > 0) {
			try {
				await addToCart({ product_id: product.id, quantity: 1 })
				message.success(`${product.name} добавлен в корзину!`)
			} catch {
				message.error('Не удалось добавить товар в корзину')
			}
		}
	}

	if (loading) {
		return (
			<Spin
				size='large'
				style={{ display: 'flex', justifyContent: 'center', margin: '60px 0' }}
			/>
		)
	}

	const subCategoryId = getSubCategoryIdFromPath()
	const categoryProducts = subCategoryId
		? products.filter(p => p.sub_category_id === subCategoryId)
		: products

	if (subCategoryId && !categoryProducts.length) {
		return (
			<Empty
				description={
					<>
						<p>
							Товары в категории "{location.pathname.split('/').pop()}"
							отсутствуют
						</p>
						<Button type='primary' onClick={() => navigate('/')}>
							На главную
						</Button>
					</>
				}
			/>
		)
	}

	if (!filteredProducts.length) {
		return (
			<Empty
				description={
					<>
						<p>Товары не найдены</p>
						<p style={{ color: '#999' }}>
							Попробуйте изменить параметры фильтрации
						</p>
						<Button type='primary' onClick={() => navigate(-1)}>
							Назад
						</Button>
					</>
				}
			/>
		)
	}

	return (
		<>
			{contextHolder}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
					gap: 16,
					padding: 16,
				}}
			>
				{filteredProducts.map(product => {
					const isInWishlist = wishlist.some(item => item.id === product.id)
					const isProcessing = processingWishlist.includes(product.id)
					const discountedPrice = product.discountPercentage
						? product.price * (1 - product.discountPercentage / 100)
						: null

					return (
						<Card
							key={product.id}
							hoverable
							onClick={() => navigate(`/product/${product.id}`)}
							cover={
								<div
									style={{
										position: 'relative',
										paddingTop: '100%',
										overflow: 'hidden',
									}}
								>
									<img
										alt={product.name}
										src={`http://localhost:8080/static/${product.image_path}`}
										style={{
											position: 'absolute',
											top: 0,
											left: 0,
											width: '100%',
											height: '100%',
											objectFit: 'cover',
										}}
										onError={e => {
											e.target.src = 'https://placehold.co/600x400'
											e.target.style = {
												objectFit: 'contain',
												padding: '16px',
												backgroundColor: '#f5f5f5',
											}
										}}
									/>
									<Button
										icon={
											isInWishlist ? (
												<HeartFilled style={{ color: '#ff4d4f' }} />
											) : (
												<HeartOutlined />
											)
										}
										loading={isProcessing}
										style={{
											position: 'absolute',
											top: 8,
											right: 8,
											backgroundColor: 'rgba(255, 255, 255, 0.8)',
										}}
										onClick={e => handleWishlistClick(product, e)}
									/>
									{product.discountPercentage && (
										<div
											style={{
												position: 'absolute',
												top: 8,
												left: 8,
												backgroundColor: '#ff4d4f',
												color: 'white',
												padding: '2px 8px',
											}}
										>
											-{product.discountPercentage}%
										</div>
									)}
									{product.quantity <= 0 && (
										<div
											style={{
												position: 'absolute',
												bottom: 0,
												left: 0,
												right: 0,
												backgroundColor: 'rgba(0, 0, 0, 0.8)',
												color: 'white',
											}}
										>
											Нет в наличии
										</div>
									)}
								</div>
							}
						>
							<Card.Meta
								title={product.name}
								description={
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
										}}
									>
										<div>
											<span style={{ fontWeight: 'bold' }}>
												{(discountedPrice || product.price).toFixed(2)} руб.
											</span>
											{discountedPrice && (
												<span
													style={{
														textDecoration: 'line-through',
														color: '#999',
														marginLeft: 8,
													}}
												>
													{product.price.toFixed(2)} руб.
												</span>
											)}
										</div>
										<Button
											icon={<ShoppingCartOutlined />}
											disabled={product.quantity <= 0}
											onClick={e => handleAddToCart(product, e)}
										>
											{product.quantity <= 0 ? 'Нет в наличии' : 'В корзину'}
										</Button>
									</div>
								}
							/>
						</Card>
					)
				})}
			</div>
		</>
	)
}

export default ListProduct
