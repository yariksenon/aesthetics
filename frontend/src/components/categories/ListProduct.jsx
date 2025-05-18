import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, Button, Spin, Empty, message, Pagination } from 'antd'
import { HeartOutlined, HeartFilled } from '@ant-design/icons'

const ProductList = ({ filters = {} }) => {
	const [products, setProducts] = useState([])
	const [loading, setLoading] = useState(true)
	const [pagination, setPagination] = useState({
		total: 0,
		current: 1,
		pageSize: 12,
		totalPages: 1,
	})
	const [favorites, setFavorites] = useState([])
	const [processingFavorites, setProcessingFavorites] = useState([])
	const [hoverImageIndex, setHoverImageIndex] = useState({})
	const [hoveredProduct, setHoveredProduct] = useState(null)
	const navigate = useNavigate()
	const location = useLocation()

	const userId = localStorage.getItem('userId')

	const fetchProducts = async (current = 1, pageSize = 12) => {
		setLoading(true)
		try {
			let url = `http://localhost:8080/api/v1/products?page=${current}&limit=${pageSize}`
			if (filters.category_id) url += `&category_id=${filters.category_id}`
			if (filters.sub_category_id)
				url += `&sub_category_id=${filters.sub_category_id}`
			if (filters.gender) url += `&gender=${filters.gender}`

			const response = await fetch(url)
			if (!response.ok) throw new Error('Не удалось загрузить товары')

			const data = await response.json()
			setProducts(data.products || [])
			setPagination({
				total: data.pagination?.total || 0,
				current: data.pagination?.page || 1,
				pageSize: data.pagination?.limit || 12,
				totalPages: data.pagination?.total_pages || 1,
			})
		} catch (error) {
			message.error(error.message)
		} finally {
			setLoading(false)
		}
	}

	const fetchFavorites = async () => {
		if (!userId) return
		try {
			const response = await fetch(
				`http://localhost:8080/api/v1/wishlist/${userId}`
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

	useEffect(() => {
		fetchProducts()
		fetchFavorites()
	}, [location.search, filters])

	const handleFavoriteClick = async (productId, e) => {
		e.stopPropagation()
		if (!userId) {
			message.error('Войдите в аккаунт, чтобы добавлять товары в избранное')
			navigate('/login')
			return
		}

		setProcessingFavorites(prev => [...prev, productId])
		try {
			const isFavorite = favorites.includes(productId)
			const url = `http://localhost:8080/api/v1/wishlist/${userId}/${productId}`
			const method = isFavorite ? 'DELETE' : 'POST'

			const response = await fetch(url, { method })
			if (!response.ok) throw new Error('Ошибка при обновлении избранного')

			await fetchFavorites()
			message.success(
				isFavorite ? 'Товар удалён из избранного' : 'Товар добавлен в избранное'
			)
		} catch (error) {
			message.error(error.message)
		} finally {
			setProcessingFavorites(prev => prev.filter(id => id !== productId))
		}
	}

	const handlePageChange = (current, pageSize) => {
		fetchProducts(current, pageSize)
	}

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
				description={
					<>
						<p>Товары не найдены</p>
						<p style={{ color: '#999' }}>
							Попробуйте изменить параметры фильтрации
						</p>
						<Button type='primary' onClick={() => navigate(-1)}>
							Вернуться назад
						</Button>
					</>
				}
			/>
		)
	}

	return (
		<div>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
					gap: 16,
				}}
			>
				{products.map(product => {
					const isFavorite = favorites.includes(product.id)
					const isProcessing = processingFavorites.includes(product.id)
					const currentImageIndex = hoverImageIndex[product.id] || 0
					const currentImage =
						product.image_paths?.[currentImageIndex] ||
						product.primary_image ||
						'https://placehold.co/600x900'

					const availableSizes =
						product.sizes?.filter(size => size.quantity > 0) || []

					return (
						<Card
							key={product.id}
							hoverable
							onClick={() => navigate(`/product/${product.id}`)}
							bordered={false}
							onMouseMove={e => handleMouseMove(e, product)}
							onMouseEnter={() => handleMouseEnter(product.id)}
							onMouseLeave={() => handleMouseLeave(product.id)}
							style={{
								transition: 'all 0.3s',
								position: 'relative',
								boxShadow: 'none',
							}}
							bodyStyle={{
								padding: 0,
								margin: 0,
							}}
							cover={
								<div
									style={{
										position: 'relative',
										paddingTop: '150%',
										overflow: 'hidden',
									}}
								>
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
										src={`http://localhost:8080/static/${currentImage}`}
										style={{
											position: 'absolute',
											top: 0,
											left: 0,
											width: '100%',
											height: '100%',
											objectFit: 'contain',
											transition: 'opacity 0.3s ease',
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
										loading={isProcessing}
										style={{
											position: 'absolute',
											top: 8,
											right: 8,
											border: 'none',
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
								<div
									style={{
										marginTop: 8,
										minHeight: 24,
										display: 'flex',
										gap: 8,
										flexWrap: 'wrap',
										visibility:
											hoveredProduct === product.id ? 'visible' : 'hidden',
									}}
								>
									{availableSizes.map(size => (
										<span
											key={size.id}
											style={{
												fontSize: 12,
												padding: '2px 6px',
											}}
										>
											{size.value}
										</span>
									))}
								</div>
							</div>
						</Card>
					)
				})}
			</div>

			<div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
				<Pagination
					current={pagination.current}
					total={pagination.total}
					pageSize={pagination.pageSize}
					onChange={handlePageChange}
					showSizeChanger
					pageSizeOptions={['12', '24', '48', '96']}
					showTotal={(total, range) =>
						`${range[0]}-${range[1]} из ${total} товаров`
					}
					locale={{
						items_per_page: 'товаров на странице',
						jump_to: 'Перейти',
						jump_to_confirm: 'подтвердить',
						page: 'страница',
					}}
				/>
			</div>
		</div>
	)
}

export default ProductList
