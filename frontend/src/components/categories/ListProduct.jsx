import React, { useState, useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import { useFavorites } from '../../context/FavoritesContext'
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
	const { favorites, toggleFavorite } = useFavorites()
	const navigate = useNavigate()
	const location = useLocation()

	const getSubCategoryIdFromPath = () => {
		const path = location.pathname.split('/').pop().toLowerCase()
		return PATH_TO_CATEGORY_MAP[path] || null
	}

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const res = await fetch('http://localhost:8080/api/v1/admin/products')
				setProducts((await res.json()) || [])
			} catch {
				api.error({
					message: 'Ошибка загрузки',
					description: 'Не удалось загрузить товары',
				})
			} finally {
				setLoading(false)
			}
		}
		fetchProducts()
	}, [])

	useEffect(() => {
		if (!products.length) return

		let result = [...products]
		const subCategoryId = getSubCategoryIdFromPath()

		if (subCategoryId)
			result = result.filter(p => p.sub_category_id === subCategoryId)
		if (filters.colors?.length)
			result = result.filter(p =>
				filters.colors.includes(p.color?.toLowerCase())
			)
		if (filters.sizes?.length)
			result = result.filter(p => filters.sizes.includes(p.size))
		if (filters.priceRange)
			result = result.filter(
				p =>
					p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
			)
		if (filters.availability === 'in-stock')
			result = result.filter(p => p.quantity > 0)
		if (filters.availability === 'out-of-stock')
			result = result.filter(p => p.quantity <= 0)

		if (filters.sortBy === 'price-asc') result.sort((a, b) => a.price - b.price)
		if (filters.sortBy === 'price-desc')
			result.sort((a, b) => b.price - a.price)
		if (filters.sortBy === 'newest')
			result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

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

	const handleFavoriteClick = (product, e) => {
		e.stopPropagation()
		toggleFavorite(product)
		message.success(
			favorites.some(fav => fav.id === product.id)
				? 'Товар удален из избранного'
				: 'Товар добавлен в избранное'
		)
	}

	if (loading)
		return (
			<Spin
				size='large'
				style={{ display: 'flex', justifyContent: 'center', margin: '60px 0' }}
			/>
		)

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
					const isFavorite = favorites.some(fav => fav.id === product.id)
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
											isFavorite ? (
												<HeartFilled style={{ color: '#ff4d4f' }} />
											) : (
												<HeartOutlined />
											)
										}
										style={{
											position: 'absolute',
											top: 8,
											right: 8,
											backgroundColor: 'rgba(255, 255, 255, 0.8)',
										}}
										onClick={e => handleFavoriteClick(product, e)}
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
