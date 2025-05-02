import React, { useState, useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import { useFavorites } from '../../context/FavoritesContext'
import { useNavigate, useLocation } from 'react-router-dom'
import heart from '../../assets/home/ProductCards/ProductCard-Heart.svg'
import feelHeart from '../../assets/home/ProductCards/ProductCard-FeelHeart.svg'

// Маппинг URL путей к sub_category_id
const PATH_TO_CATEGORY_MAP = {
	winter: 18,
	summer: 19,
	spring: 20,
	autumn: 21,
}

const ListProduct = ({ filters = {} }) => {
	const [products, setProducts] = useState([])
	const [filteredProducts, setFilteredProducts] = useState([])
	const [loading, setLoading] = useState(true)
	const [hoverStates, setHoverStates] = useState({
		product: null,
		heart: null,
	})
	const { addToCart } = useCart()
	const { favorites, toggleFavorite } = useFavorites()
	const navigate = useNavigate()
	const location = useLocation()

	// Получаем sub_category_id из URL пути
	const getSubCategoryIdFromPath = () => {
		const pathParts = location.pathname.split('/').filter(Boolean)
		const lastPathPart = pathParts[pathParts.length - 1].toLowerCase()
		return PATH_TO_CATEGORY_MAP[lastPathPart] || null
	}

	// Загрузка продуктов
	useEffect(() => {
		const fetchProducts = async () => {
			try {
				setLoading(true)
				const response = await fetch(
					'http://localhost:8080/api/v1/admin/products'
				)
				const data = await response.json()
				setProducts(Array.isArray(data) ? data : [])
			} catch (error) {
				console.error('Error loading products:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchProducts()
	}, [])

	// Применение фильтров
	useEffect(() => {
		if (products.length === 0) return

		let result = [...products]
		const subCategoryId = getSubCategoryIdFromPath()

		// Фильтрация по подкатегории из URL
		if (subCategoryId) {
			result = result.filter(
				product => product.sub_category_id === subCategoryId
			)
		}

		// Применение дополнительных фильтров
		if (filters.colors?.length > 0) {
			result = result.filter(
				product =>
					product.color && filters.colors.includes(product.color.toLowerCase())
			)
		}

		if (filters.sizes?.length > 0) {
			result = result.filter(
				product => product.size && filters.sizes.includes(product.size)
			)
		}

		if (filters.priceRange) {
			result = result.filter(
				product =>
					product.price >= filters.priceRange.min &&
					product.price <= filters.priceRange.max
			)
		}

		if (filters.availability === 'in-stock') {
			result = result.filter(product => product.quantity > 0)
		} else if (filters.availability === 'out-of-stock') {
			result = result.filter(product => product.quantity <= 0)
		}

		// Сортировка
		if (filters.sortBy === 'price-asc') {
			result.sort((a, b) => a.price - b.price)
		} else if (filters.sortBy === 'price-desc') {
			result.sort((a, b) => b.price - a.price)
		} else if (filters.sortBy === 'newest') {
			result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
		}

		setFilteredProducts(result)
	}, [filters, products, location.pathname])

	const handleHoverState = (type, id) => {
		setHoverStates(prev => ({ ...prev, [type]: id }))
	}

	const handleAddToCart = (product, e) => {
		e.stopPropagation()
		if (product.quantity > 0) {
			addToCart({ ...product, quantity: 1 })
		}
	}

	const handleFavoriteClick = (product, e) => {
		e.stopPropagation()
		toggleFavorite(product)
	}

	const handleProductClick = productId => {
		navigate(`/product/${productId}`)
	}

	if (loading) {
		return (
			<div className='flex justify-center items-center py-12'>
				<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900'></div>
			</div>
		)
	}

	const subCategoryId = getSubCategoryIdFromPath()
	const categoryProducts = subCategoryId
		? products.filter(p => p.sub_category_id === subCategoryId)
		: products

	if (subCategoryId && categoryProducts.length === 0) {
		const currentPath = location.pathname.split('/').pop()
		return (
			<div className='text-center py-12'>
				<p className='text-gray-500 text-lg'>
					{`Товары в категории "${currentPath}" отсутствуют`}
				</p>
				<button
					onClick={() => navigate('/')}
					className='mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition'
				>
					Вернуться на главную
				</button>
			</div>
		)
	}

	if (filteredProducts.length === 0) {
		return (
			<div className='text-center py-12'>
				<p className='text-gray-500 text-lg'>Товары не найдены</p>
				<p className='text-gray-400 mt-2'>
					Попробуйте изменить параметры фильтрации
				</p>
				<button
					onClick={() => navigate(-1)}
					className='mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition'
				>
					Назад
				</button>
			</div>
		)
	}

	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-4'>
			{filteredProducts.map(product => {
				const isFavorite = favorites.some(fav => fav.id === product.id)
				const discountedPrice = product.discountPercentage
					? product.price * (1 - product.discountPercentage / 100)
					: null

				return (
					<div
						key={product.id}
						className='relative group bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border border-gray-200'
						onMouseEnter={() => handleHoverState('product', product.id)}
						onMouseLeave={() => handleHoverState('product', null)}
						onClick={() => handleProductClick(product.id)}
					>
						<div className='relative aspect-square overflow-hidden'>
							<img
								src={`http://localhost:8080/static/${product.image_path}`}
								alt={product.name}
								className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
								onError={e => {
									e.target.src = 'https://placehold.co/600x400'
									e.target.className =
										'w-full h-full object-contain bg-gray-100 p-4'
								}}
							/>

							<div className='absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

							<button
								className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all
                  ${
										isFavorite ? 'bg-red-500/90' : 'bg-white/80 hover:bg-white'
									}`}
								onClick={e => handleFavoriteClick(product, e)}
								aria-label={
									isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'
								}
							>
								<img
									src={isFavorite ? feelHeart : heart}
									alt='Избранное'
									className='w-5 h-5'
								/>
							</button>

							{product.discountPercentage && (
								<div className='absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded'>
									-{product.discountPercentage}%
								</div>
							)}

							{product.quantity <= 0 && (
								<div className='absolute bottom-0 left-0 right-0 bg-black/80 text-white text-center py-1 text-sm'>
									Нет в наличии
								</div>
							)}
						</div>

						<div className='p-4'>
							<h3 className='text-lg font-medium text-gray-900 line-clamp-2 h-14'>
								{product.name}
							</h3>
							<div className='flex items-center justify-between mt-3'>
								<div>
									<p className='text-lg font-bold text-gray-900'>
										{discountedPrice
											? discountedPrice.toFixed(2)
											: product.price.toFixed(2)}{' '}
										руб.
									</p>
									{discountedPrice && (
										<p className='text-sm text-gray-500 line-through'>
											{product.price.toFixed(2)} руб.
										</p>
									)}
								</div>
								<button
									onClick={e => handleAddToCart(product, e)}
									disabled={product.quantity <= 0}
									className={`px-4 py-2 text-sm font-medium rounded-md transition
                    ${
											product.quantity <= 0
												? 'bg-gray-300 cursor-not-allowed'
												: 'bg-black text-white hover:bg-gray-800'
										}`}
								>
									{product.quantity <= 0 ? 'Нет в наличии' : 'В корзину'}
								</button>
							</div>
						</div>
					</div>
				)
			})}
		</div>
	)
}

export default ListProduct
