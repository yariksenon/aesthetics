import React, { useState, useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, Button, Spin, Empty, message, Pagination } from 'antd'
import {
	HeartOutlined,
	HeartFilled,
	ShoppingCartOutlined,
} from '@ant-design/icons'

const ProductList = ({ filters = {} }) => {
	const [products, setProducts] = useState([])
	const [loading, setLoading] = useState(true)
	const [pagination, setPagination] = useState({
		total: 0,
		current: 1,
		pageSize: 12,
		totalPages: 1,
	})
	const { addToCart } = useCart()
	const [favorites, setFavorites] = useState([])
	const [processingFavorites, setProcessingFavorites] = useState([])
	const navigate = useNavigate()
	const location = useLocation()

	const userId = localStorage.getItem('userId')

	const fetchProducts = async (current = 1, pageSize = 12) => {
		setLoading(true)
		try {
			let url = `http://localhost:8080/api/v1/products?page=${current}&limit=${pageSize}`

			if (filters.category_id) {
				url += `&category_id=${filters.category_id}`
			}
			if (filters.sub_category_id) {
				url += `&sub_category_id=${filters.sub_category_id}`
			}
			if (filters.gender) {
				url += `&gender=${filters.gender}`
			}

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
			message.error('Войдите в систему, чтобы добавлять товары в избранное')
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
				isFavorite ? 'Товар удален из избранного' : 'Товар добавлен в избранное'
			)
		} catch (error) {
			message.error(error.message)
		} finally {
			setProcessingFavorites(prev => prev.filter(id => id !== productId))
		}
	}

	const handleAddToCart = async (product, e) => {
		e.stopPropagation()
		try {
			await addToCart({ product_id: product.id, quantity: 1 })
			message.success(`${product.name} добавлен в корзину!`)
		} catch (error) {
			message.error(error.message || 'Не удалось добавить товар в корзину')
		}
	}

	const handlePageChange = (current, pageSize) => {
		fetchProducts(current, pageSize)
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
		<div style={{ padding: '16px' }}>
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

					return (
						<Card
							key={product.id}
							hoverable
							onClick={() => navigate(`/product/${product.id}`)}
							style={{
								border: '1px solid #e8e8e8',
								borderRadius: 4,
								transition: 'all 0.3s',
								':hover': {
									boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
								},
							}}
							cover={
								<div
									style={{
										position: 'relative',
										paddingTop: '100%',
										overflow: 'hidden',
									}}
								>
									{product.primary_image ? (
										<img
											alt={product.name}
											src={`http://localhost:8080/static/${product.primary_image}`}
											style={{
												position: 'absolute',
												top: 0,
												left: 0,
												width: '100%',
												height: '100%',
												objectFit: 'cover',
											}}
											onError={e => {
												e.currentTarget.src = 'https://placehold.co/600x400'
												e.currentTarget.style = {
													objectFit: 'contain',
													padding: '16px',
													backgroundColor: '#f5f5f5',
												}
											}}
										/>
									) : (
										<div
											style={{
												position: 'absolute',
												top: 0,
												left: 0,
												width: '100%',
												height: '100%',
												backgroundColor: '#f5f5f5',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
											}}
										>
											Нет изображения
										</div>
									)}
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
											backgroundColor: 'rgba(255, 255, 255, 0.8)',
											border: 'none',
											':hover': {
												color: '#000',
											},
										}}
										onClick={e => handleFavoriteClick(product.id, e)}
									/>
								</div>
							}
						>
							<Card.Meta
								title={product.name}
								description={
									<>
										<div style={{ marginBottom: 8, color: '#666' }}>
											{product.category}
											{product.sub_category && ` • ${product.sub_category}`}
										</div>
										<div
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'center',
											}}
										>
											<span style={{ fontWeight: 'bold', color: '#000' }}>
												{product.price.toFixed(2)} ₽
											</span>
											<Button
												icon={<ShoppingCartOutlined />}
												onClick={e => handleAddToCart(product, e)}
												style={{
													backgroundColor: '#fff',
													color: '#000',
													borderColor: '#d9d9d9',
													':hover': {
														backgroundColor: '#000',
														color: '#fff',
														borderColor: '#000',
													},
												}}
											>
												В корзину
											</Button>
										</div>
									</>
								}
							/>
						</Card>
					)
				})}
			</div>

			<div
				style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}
			>
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
						page: 'Страница',
					}}
					className='custom-pagination' // Добавьте этот класс
				/>
			</div>
		</div>
	)
}

export default ProductList
