import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, Button, Spin, Empty, message, Pagination } from 'antd'
import { HeartOutlined, HeartFilled } from '@ant-design/icons'

const ProductList = ({ filters = {} }) => {
	const [allProducts, setAllProducts] = useState([])
	const [filteredProducts, setFilteredProducts] = useState([])
	const [loading, setLoading] = useState(true)
	const [reloadLoading, setReloadLoading] = useState(false)
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

	const prevCategoryRef = useRef(localStorage.getItem('category'))
	const prevSubCategoryRef = useRef(localStorage.getItem('subCategory'))
	const prevMenuItemRef = useRef(localStorage.getItem('activeMenuItem'))

	const navigate = useNavigate()
	const location = useLocation()
	const userId = localStorage.getItem('userId')

	const getActiveGender = menuItem => {
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

	// Функция фильтрации товаров
	const applyFilters = (products, filters) => {
		let filtered = [...products]

		// Фильтр по подкатегории
		if (filters.subCategory) {
			filtered = filtered.filter(product =>
				product.sub_category
					?.toLowerCase()
					.includes(filters.subCategory.toLowerCase())
			)
		}

		// Фильтр по цвету
		if (filters.colors?.length > 0) {
			filtered = filtered.filter(product =>
				filters.colors.includes(product.color?.toLowerCase())
			)
		}

		// Фильтр по ценовому диапазону
		if (filters.priceRange?.min || filters.priceRange?.max) {
			filtered = filtered.filter(
				product =>
					product.price >= filters.priceRange.min &&
					product.price <= filters.priceRange.max
			)
		}

		// Фильтр по наличию
		if (filters.availability) {
			filtered = filtered.filter(product => {
				if (filters.availability === 'in-stock') {
					return product.sizes?.some(size => size.quantity > 0)
				}
				if (filters.availability === 'pre-order') {
					return product.sizes?.every(size => size.quantity === 0)
				}
				return true
			})
		}

		// Сортировка
		if (filters.sortBy) {
			filtered.sort((a, b) => {
				if (filters.sortBy === 'price-asc') {
					return a.price - b.price
				}
				if (filters.sortBy === 'price-desc') {
					return b.price - a.price
				}
				return 0 // default
			})
		}

		return filtered
	}

	// Применение фильтра по категории и подкатегории
	const applyCategoryFilter = productsList => {
		const currentCategory = localStorage.getItem('category')
		const currentSubCategory = localStorage.getItem('subCategory')

		let filtered = [...productsList]

		if (currentCategory && currentCategory !== 'undefined') {
			filtered = filtered.filter(product =>
				product.category?.toLowerCase().includes(currentCategory.toLowerCase())
			)
		}

		if (currentSubCategory && currentSubCategory !== 'undefined') {
			filtered = filtered.filter(product =>
				product.sub_category
					?.toLowerCase()
					.includes(currentSubCategory.toLowerCase())
			)
		}

		// Применяем фильтры из пропса
		filtered = applyFilters(filtered, {
			...filters,
			subCategory: currentSubCategory,
		})

		setFilteredProducts(filtered)
		setPagination(prev => ({
			...prev,
			total: filtered.length,
			current: 1,
		}))
	}

	const checkLocalStorageChanges = () => {
		const currentCategory = localStorage.getItem('category')
		const currentSubCategory = localStorage.getItem('subCategory')
		const currentMenuItem = localStorage.getItem('activeMenuItem')

		if (
			currentCategory !== prevCategoryRef.current ||
			currentSubCategory !== prevSubCategoryRef.current
		) {
			prevCategoryRef.current = currentCategory
			prevSubCategoryRef.current = currentSubCategory
			localStorage.setItem('isReloading', 'true')
			applyCategoryFilter(allProducts)
			// window.location.reload()
			fetchProducts(1, pagination.pageSize)
		}

		if (currentMenuItem !== prevMenuItemRef.current) {
			prevMenuItemRef.current = currentMenuItem
			fetchProducts(1, pagination.pageSize, currentMenuItem)
		}
	}

	const fetchProducts = async (
		current = 1,
		pageSize = 12,
		menuItem = prevMenuItemRef.current
	) => {
		setLoading(true)
		try {
			let url = `http://localhost:8080/api/v1/products?page=${current}&limit=${pageSize}`

			const activeGender = getActiveGender(menuItem)
			if (activeGender) {
				url += `&gender=${activeGender}`
			}

			const currentCategory = localStorage.getItem('category')
			if (currentCategory && currentCategory !== 'undefined') {
				url += `&category_name=${encodeURIComponent(currentCategory)}`
			}

			const currentSubCategory = localStorage.getItem('subCategory')
			if (currentSubCategory && currentSubCategory !== 'undefined') {
				url += `&sub_category_name=${encodeURIComponent(currentSubCategory)}`
			}

			// Добавляем фильтры в запрос, если API их поддерживает
			if (filters.colors?.length > 0) {
				url += `&colors=${filters.colors.join(',')}`
			}
			if (filters.priceRange?.min) {
				url += `&min_price=${filters.priceRange.min}`
			}
			if (filters.priceRange?.max) {
				url += `&max_price=${filters.priceRange.max}`
			}
			if (filters.availability) {
				url += `&availability=${filters.availability}`
			}
			if (filters.sortBy) {
				url += `&sort_by=${filters.sortBy}`
			}

			const response = await fetch(url)
			if (!response.ok) throw new Error('Не удалось загрузить товары')

			const data = await response.json()
			setAllProducts(data.products || [])
			applyCategoryFilter(data.products || [])

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
			if (localStorage.getItem('isReloading') === 'true') {
				setTimeout(() => {
					localStorage.removeItem('isReloading')
					setReloadLoading(false)
				}, 500)
			}
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

	const handlePageChange = (current, pageSize) => {
		fetchProducts(current, pageSize)
	}

	useEffect(() => {
		if (localStorage.getItem('isReloading') === 'true') {
			setReloadLoading(true)
		}

		fetchProducts()
		fetchFavorites()

		const handleStorageChange = e => {
			if (
				e.key === 'category' ||
				e.key === 'subCategory' ||
				e.key === 'activeMenuItem'
			) {
				checkLocalStorageChanges()
			}
		}

		window.addEventListener('storage', handleStorageChange)
		const interval = setInterval(checkLocalStorageChanges, 500)

		return () => {
			window.removeEventListener('storage', handleStorageChange)
			clearInterval(interval)
		}
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

	if (reloadLoading) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
					backgroundColor: 'rgba(255, 255, 255, 0.8)',
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					zIndex: 1000,
				}}
			>
				<Spin size='large' tip='Обновление категории...' />
			</div>
		)
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

	if (!filteredProducts.length) {
		const currentCategory = localStorage.getItem('category')
		const currentSubCategory = localStorage.getItem('subCategory')

		return (
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					height: '60vh',
					textAlign: 'center',
					padding: '0 20px',
				}}
			>
				<div style={{ marginBottom: 24 }}>
					<svg
						width='64'
						height='64'
						viewBox='0 0 24 24'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							d='M4 7V5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7'
							stroke='#888'
							strokeWidth='2'
							strokeLinecap='round'
						/>
						<path
							d='M20 7V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V7'
							stroke='#888'
							strokeWidth='2'
							strokeLinecap='round'
						/>
						<path
							d='M9 12L11 14L15 10'
							stroke='#888'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
					</svg>
				</div>
				<h3
					style={{
						fontSize: '20px',
						fontWeight: 500,
						color: '#222',
						marginBottom: '8px',
					}}
				>
					{currentSubCategory
						? `В подкатегории "${currentSubCategory}" пока нет товаров`
						: currentCategory
						? `В категории "${currentCategory}" пока нет товаров`
						: 'Товары не найдены'}
				</h3>
				<p
					style={{
						fontSize: '16px',
						color: '#888',
						maxWidth: '400px',
						lineHeight: '1.5',
					}}
				>
					Попробуйте изменить параметры фильтрации или загляните к нам позже
				</p>
			</div>
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
				{filteredProducts.map(product => {
					const isFavorite = favorites.includes(product.id)
					const isProcessing = processingFavorites.includes(product.id)
					const currentImageIndex = hoverImageIndex[product.id] || 0
					const currentImage =
						product.image_paths?.[currentImageIndex] ||
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
