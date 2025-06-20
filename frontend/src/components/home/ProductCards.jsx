import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Spin, Empty, message, Tag } from 'antd'
import { HeartOutlined, HeartFilled } from '@ant-design/icons'

const ProductCarts = ({ filters = {} }) => {
	const [products, setProducts] = useState([])
	const [loading, setLoading] = useState(true)
	const [favorites, setFavorites] = useState([])
	const [hoverImageIndex, setHoverImageIndex] = useState({})
	const [hoveredProduct, setHoveredProduct] = useState(null)
	const [activeMenuItem, setActiveMenuItem] = useState(
		localStorage.getItem('activeMenuItem')
	)
	const navigate = useNavigate()
	const userId = localStorage.getItem('userId')

	// Функция проверки наличия товара
	const isProductAvailable = product => {
		return product.sizes?.some(size => size.quantity > 0)
	}

	// Слушаем изменения в localStorage
	useEffect(() => {
		const handleStorageChange = e => {
			if (e.key === 'activeMenuItem') {
				setActiveMenuItem(e.newValue)
				fetchProducts(e.newValue)
			}
		}

		window.addEventListener('storage', handleStorageChange)
		return () => window.removeEventListener('storage', handleStorageChange)
	}, [])

	// Также отслеживаем изменения в текущей вкладке
	const checkLocalStorageChanges = () => {
		const currentValue = localStorage.getItem('activeMenuItem')
		if (currentValue !== activeMenuItem) {
			setActiveMenuItem(currentValue)
			fetchProducts(currentValue)
		}
	}

	// Функция для преобразования activeMenuItem в gender-фильтр
	const getGenderFilter = menuItem => {
		switch (menuItem) {
			case 'children':
				return 'kids'
			case 'man':
				return 'men'
			case 'woman':
				return 'women'
			default:
				return null
		}
	}

	// Загрузка товаров с учетом фильтров
	const fetchProducts = async (menuItem = activeMenuItem) => {
		setLoading(true)
		try {
			let url = `http://45.12.74.28:8080/api/v1/products?limit=6`

			// Добавляем фильтр по полу
			const genderFilter = getGenderFilter(menuItem)
			if (genderFilter) {
				url += `&gender=${genderFilter}`
			}

			// Добавляем дополнительные фильтры из props
			if (filters.category_id) url += `&category_id=${filters.category_id}`
			if (filters.sub_category_id)
				url += `&sub_category_id=${filters.sub_category_id}`

			const response = await fetch(url)
			if (!response.ok) throw new Error('Не удалось загрузить товары')
			const data = await response.json()
			setProducts(data.products || [])
		} catch (error) {
			message.error(error.message)
		} finally {
			setLoading(false)
		}
	}

	// Загрузка избранного
	const fetchFavorites = async () => {
		if (!userId) return
		try {
			const response = await fetch(
				`http://45.12.74.28:8080/api/v1/wishlist/${userId}`
			)
			if (!response.ok) throw new Error('Не удалось загрузить избранное')
			const data = await response.json()
			setFavorites(
				Array.isArray(data?.items) ? data.items.map(item => item.id) : []
			)
		} catch (error) {
			console.error('Ошибка загрузки избранного:', error.message)
		}
	}

	// Проверка перед действиями, требующими авторизации
	const checkAuth = () => {
		if (!userId) {
			message.warning('Для добавления в избранное необходимо войти в аккаунт')
			return false
		}
		return true
	}

	// Обработка избранного
	// Обработка избранного
	const handleFavoriteClick = async (productId, e) => {
		e.stopPropagation()
		if (!checkAuth()) return

		try {
			const isFavorite = favorites.includes(productId)
			const url = `http://45.12.74.28:8080/api/v1/wishlist/${userId}/${productId}`
			const method = isFavorite ? 'DELETE' : 'POST'

			const response = await fetch(url, { method })
			if (!response.ok) throw new Error('Ошибка при обновлении избранного')

			setFavorites(prev =>
				isFavorite ? prev.filter(id => id !== productId) : [...prev, productId]
			)
			message.success(
				isFavorite ? 'Товар удалён из избранного' : 'Товар добавлен в избранное'
			)

			// Перезагрузка страницы после успешного обновления избранного
			window.location.reload()
		} catch (error) {
			message.error(error.message)
		}
	}

	// Обработка перемещения мыши для смены изображения
	const handleMouseMove = (e, product) => {
		const card = e.currentTarget
		const rect = card.getBoundingClientRect()
		const mouseX = e.clientX - rect.left
		const sectionWidth = rect.width / product.image_paths.length
		const sectionIndex = Math.floor(mouseX / sectionWidth)
		const imageCount = product.image_paths?.length || 1
		const effectiveIndex = Math.min(sectionIndex, imageCount - 1)
		setHoverImageIndex(prev => ({
			...prev,
			[product.id]: effectiveIndex,
		}))
	}

	const handleMouseEnter = productId => {
		setHoveredProduct(productId)
	}

	const handleMouseLeave = productId => {
		setHoveredProduct(null)
		setHoverImageIndex(prev => ({
			...prev,
			[productId]: 0,
		}))
	}

	// Загрузка данных при монтировании и при изменении activeMenuItem
	useEffect(() => {
		fetchProducts()
		fetchFavorites()

		// Проверяем изменения каждые 500мс (на случай изменений в текущей вкладке)
		const interval = setInterval(checkLocalStorageChanges, 500)
		return () => clearInterval(interval)
	}, [activeMenuItem])

	if (loading) {
		return (
			<div
				style={{ display: 'flex', justifyContent: 'center', margin: '60px 0' }}
			>
				<Spin size='large' />
				<span style={{ marginLeft: 10 }}>Загрузка товаров...</span>
			</div>
		)
	}

	if (!products.length) {
		return (
			<Empty
				description={`Товары не найдены для категории: ${
					activeMenuItem || 'все'
				}`}
			/>
		)
	}

	return (
		<div
			style={{
				display: 'flex',
				overflowX: 'auto',
				marginTop: '7%',
				gap: 16,
				scrollbarWidth: 'none',
				msOverflowStyle: 'none',
			}}
		>
			<style>{'::-webkit-scrollbar { display: none; }'}</style>

			{products.map(product => {
				const isFavorite = favorites.includes(product.id)
				const currentImageIndex = hoverImageIndex[product.id] || 0
				const currentImage =
					product.image_paths?.[currentImageIndex] ||
					product.primary_image ||
					'https://placehold.co/600x900'
				const isAvailable = isProductAvailable(product)

				return (
					<div key={product.id} style={{ minWidth: 240, flexShrink: 0 }}>
						<Card
							hoverable
							onClick={() => isAvailable && navigate(`/product/${product.id}`)}
							bordered={false}
							onMouseMove={e => handleMouseMove(e, product)}
							onMouseEnter={() => handleMouseEnter(product.id)}
							onMouseLeave={() => handleMouseLeave(product.id)}
							style={{
								transition: 'all 0.3s',
								position: 'relative',
								boxShadow: 'none',
								width: 240,
								cursor: isAvailable ? 'pointer' : 'default',
								opacity: isAvailable ? 1 : 0.7,
							}}
							bodyStyle={{ padding: 0 }}
							cover={
								<div style={{ position: 'relative', paddingTop: '150%' }}>
									{!isAvailable && (
										<div
											style={{
												position: 'absolute',
												top: 0,
												left: 0,
												right: 0,
												bottom: 0,
												backgroundColor: 'rgba(255, 255, 255, 0.7)',
												zIndex: 2,
												display: 'flex',
												justifyContent: 'center',
												alignItems: 'center',
											}}
										>
											<Tag
												color='red'
												style={{
													position: 'absolute',
													top: '50%',
													left: '50%',
													transform: 'translate(-50%, -50%)',
													fontSize: 14,
													padding: '4px 12px',
													zIndex: 3,
												}}
											>
												Нет в наличии
											</Tag>
										</div>
									)}

									{hoveredProduct === product.id &&
										product.image_paths?.length > 1 && (
											<div
												style={{
													position: 'absolute',
													top: 8,
													left: '50%',
													transform: 'translateX(-50%)',
													display: 'flex',
													gap: 4,
													zIndex: 10,
												}}
											>
												{product.image_paths.map((_, index) => (
													<div
														key={index}
														style={{
															width: 30,
															height: 4,
															backgroundColor:
																index === currentImageIndex ? '#000' : '#ccc',
														}}
													/>
												))}
											</div>
										)}

									<img
										key={currentImage}
										alt={product.name}
										src={`http://45.12.74.28:8080/static/${currentImage}`}
										style={{
											position: 'absolute',
											top: 0,
											left: 0,
											width: '100%',
											height: '100%',
											objectFit: 'contain',
											transition: 'opacity 0.3s ease',
											filter: isAvailable ? 'none' : 'grayscale(80%)',
										}}
										onError={e => {
											e.currentTarget.src = 'https://placehold.co/600x900'
											e.currentTarget.style = {
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
											border: 'none',
											zIndex: 3,
										}}
										onClick={e => handleFavoriteClick(product.id, e)}
									/>
								</div>
							}
						>
							<div>
								<div style={{ fontWeight: 'bold', fontSize: 16 }}>
									{product.name}
								</div>
								<div style={{ fontSize: 14, color: '#666' }}>
									{product.brand_name || 'Без бренда'}
								</div>
								<div style={{ fontWeight: 'bold', fontSize: 16, marginTop: 4 }}>
									{product.price.toFixed(2)} BYN
								</div>
							</div>
						</Card>
					</div>
				)
			})}
		</div>
	)
}

export default ProductCarts
