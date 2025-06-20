import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import Arrow from '../../assets/category/accordion/DownArrow.svg'

const translateCategoryToEnglish = categoryName => {
	const translations = {
		Новинки: 'new',
		Обувь: 'shoes',
		Одежда: 'clothes',
		Тренировки: 'training',
		Красота: 'beauty',
		Скидки: 'discounts',
		Хоккей: 'hockey',
		Теннис: 'tennis',
		Регби: 'rugby',
		Баскетбол: 'basketball',
		Бег: 'running',
		Бренд: 'brand',
		Лыжи: 'skiing',
		Волейбол: 'volleyball',
		Зал: 'gym',
		Дайвинг: 'diving',
		Футбол: 'football',
		Зима: 'winter',
		Лето: 'summer',
		Весна: 'spring',
		Осень: 'autumn',
	}
	return translations[categoryName] || categoryName.toLowerCase()
}

const Accordion = () => {
	const [openIndexes, setOpenIndexes] = useState([])
	const [categories, setCategories] = useState([])
	const [subCategories, setSubCategories] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const contentRefs = useRef({})
	const navigate = useNavigate()
	const { category: urlCategory } = useParams()

	const [selectedCategory, setSelectedCategory] = useState(
		localStorage.getItem('category') || ''
	)
	const [selectedSubCategory, setSelectedSubCategory] = useState(
		localStorage.getItem('subCategory') || ''
	)

	// Получаем текущий выбранный гендер
	const getActiveGender = useCallback(() => {
		const activeMenuItem = localStorage.getItem('activeMenuItem') || 'woman'
		switch (activeMenuItem) {
			case 'man':
				return 'men'
			case 'woman':
				return 'women'
			case 'children': // This should match your localStorage value
				return 'kids' // This should match your database value
			default:
				return 'men'
		}
	}, [])

	// Получаем количество товаров для текущего гендера
	const getProductCountForGender = useCallback(
		subCategory => {
			const gender = getActiveGender()
			switch (gender) {
				case 'men':
					return subCategory.product_count?.men || 0
				case 'women':
					return subCategory.product_count?.women || 0
				case 'kids': // Changed from 'children' to match database
					return subCategory.product_count?.kids || 0 // Changed from 'children'
				default:
					return subCategory.product_count?.total || 0
			}
		},
		[getActiveGender]
	)

	// Получаем подкатегории с товарами для текущего гендера
	const getSubCategoriesWithProducts = useCallback(
		categoryId => {
			return subCategories
				.filter(subCat => subCat.category_id === categoryId)
				.map(subCat => ({
					...subCat,
					displayCount: getProductCountForGender(subCat),
				}))
				.filter(subCat => subCat.displayCount > 0)
		},
		[subCategories, getProductCountForGender]
	)

	// Проверяем, есть ли товары в категории (хотя бы в одной подкатегории)
	const hasProductsInCategory = useCallback(
		categoryId => {
			return getSubCategoriesWithProducts(categoryId).length > 0
		},
		[getSubCategoriesWithProducts]
	)

	// Получаем общее количество товаров в категории для текущего гендера
	const getTotalProductsForCategory = useCallback(
		categoryId => {
			const categorySubs = getSubCategoriesWithProducts(categoryId)
			return categorySubs.reduce((total, subCat) => {
				return total + subCat.displayCount
			}, 0)
		},
		[getSubCategoriesWithProducts]
	)

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [categoriesRes, subCategoriesRes] = await Promise.all([
					axios.get('http://localhost:8080/api/v1/categories'),
					axios.get('http://localhost:8080/api/v1/subcategory'),
				])

				setCategories(categoriesRes.data?.categories || [])
				setSubCategories(subCategoriesRes.data || [])
			} catch (err) {
				console.error('Ошибка при загрузке данных:', err)
				setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.')
			} finally {
				setLoading(false)
			}
		}
		fetchData()
	}, [])

	// Обновляем при изменении активного гендера
	useEffect(() => {
		const handleStorageChange = () => {
			setCategories(prev => [...prev])
		}

		window.addEventListener('storage', handleStorageChange)
		return () => window.removeEventListener('storage', handleStorageChange)
	}, [])

	const toggleAccordion = useCallback(index => {
		setOpenIndexes(prev =>
			prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
		)
	}, [])

	const handleCategoryClick = useCallback(
		(categoryName, index) => {
			const activeMenuItem = localStorage.getItem('activeMenuItem') || 'man'
			const translatedCategory = translateCategoryToEnglish(categoryName)
			setSelectedCategory(categoryName)
			setSelectedSubCategory('')
			localStorage.setItem('category', categoryName)
			localStorage.removeItem('subCategory')
			navigate(`/${activeMenuItem}/${translatedCategory}`)

			if (!openIndexes.includes(index)) {
				toggleAccordion(index)
			}
		},
		[navigate, openIndexes, toggleAccordion]
	)

	const handleSubCategoryClick = useCallback(
		(subCategoryName, categoryName) => {
			const activeMenuItem = localStorage.getItem('activeMenuItem') || 'man'
			const translatedCategory = translateCategoryToEnglish(categoryName)
			setSelectedSubCategory(subCategoryName)
			setSelectedCategory(categoryName)
			localStorage.setItem('subCategory', subCategoryName)
			localStorage.setItem('category', categoryName)
			navigate(`/${activeMenuItem}/${translatedCategory}`)
		},
		[navigate]
	)

	if (loading)
		return <div className='py-4 text-center'>Загрузка категорий...</div>
	if (error) return <div className='py-4 text-center text-red-500'>{error}</div>
	if (!categories.length)
		return <div className='py-4 text-center'>Нет доступных категорий</div>

	// Фильтруем категории - оставляем только те, где есть товары и подкатегории
	const visibleCategories = categories
		.slice(0, 8)
		.filter(category => hasProductsInCategory(category.id))

	if (visibleCategories.length === 0)
		return <div className='py-4 text-center'>Нет категорий с товарами</div>

	return (
		<div className='mr-5'>
			<ul className='space-y-2'>
				{visibleCategories.map((category, index) => {
					const categorySubs = getSubCategoriesWithProducts(category.id)
					const isCategorySelected = selectedCategory === category.name
					const isOpen = openIndexes.includes(index)
					const totalProducts = getTotalProductsForCategory(category.id)

					return (
						<li key={category.id} className='py-1'>
							<div
								className={`flex justify-between items-center px-3 py-2 ${
									isCategorySelected
										? 'bg-black rounded-md'
										: 'hover:bg-gray-100'
								}`}
							>
								<button
									onClick={() => handleCategoryClick(category.name, index)}
									className={`text-left focus:outline-none flex-grow ${
										isCategorySelected ? 'text-white' : 'text-black'
									}`}
								>
									<div className='flex items-center justify-between w-full'>
										<span className='text-lg font-semibold'>
											{category.name || 'Без названия'}
										</span>
										<span
											className={`text-sm ml-2 ${
												isCategorySelected ? 'text-white' : 'text-gray-500'
											}`}
										>
											{totalProducts}
										</span>
									</div>
								</button>
								{categorySubs.length > 0 && (
									<button
										onClick={e => {
											e.stopPropagation()
											toggleAccordion(index)
										}}
										className='focus:outline-none ml-2'
										aria-expanded={isOpen}
										aria-controls={`category-${category.id}-content`}
									>
										<img
											src={Arrow}
											alt={isOpen ? 'Свернуть' : 'Развернуть'}
											className={`h-6 w-6 transition-transform duration-200 ${
												isOpen ? 'rotate-180' : 'rotate-0'
											} ${isCategorySelected ? 'invert' : ''}`}
										/>
									</button>
								)}
							</div>
							<div
								id={`category-${category.id}-content`}
								ref={el => (contentRefs.current[category.id] = el)}
								style={{
									maxHeight: isOpen
										? `${contentRefs.current[category.id]?.scrollHeight}px`
										: '0',
									overflow: 'hidden',
									transition: 'max-height 0.2s ease-in-out',
								}}
								aria-hidden={!isOpen}
							>
								<ul className='pl-6 py-1 space-y-1'>
									{categorySubs.map(subCategory => {
										const isSubCategorySelected =
											selectedSubCategory === subCategory.name &&
											selectedCategory === category.name

										return (
											<li key={subCategory.id} className='py-1'>
												<div
													className={`flex items-center cursor-pointer hover:text-gray-700 relative px-3 py-1 rounded ${
														isSubCategorySelected
															? 'font-semibold bg-gray-200'
															: 'hover:bg-gray-100'
													}`}
													onClick={() =>
														handleSubCategoryClick(
															subCategory.name,
															category.name
														)
													}
												>
													<div className='flex-grow min-w-0'>
														<span className='text-sm break-words'>
															{subCategory.name || 'Без названия'}
														</span>
													</div>
													<span className='text-xs text-gray-500 ml-2 whitespace-nowrap'>
														{subCategory.displayCount}
													</span>
													{isSubCategorySelected && (
														<div className='ml-2 w-2 h-2 bg-black rounded-full flex-shrink-0'></div>
													)}
												</div>
											</li>
										)
									})}
								</ul>
							</div>
						</li>
					)
				})}
			</ul>
		</div>
	)
}

export default Accordion
