import React, { useState, useEffect, useRef } from 'react'
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
	const contentRefs = useRef([])
	const navigate = useNavigate()
	const { category: urlCategory } = useParams()

	const [selectedCategory, setSelectedCategory] = useState(
		localStorage.getItem('category') || ''
	)
	const [selectedSubCategory, setSelectedSubCategory] = useState(
		localStorage.getItem('subCategory') || ''
	)

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [categoriesRes, subCategoriesRes] = await Promise.all([
					axios.get('http://localhost:8080/api/v1/categories'),
					axios.get('http://localhost:8080/api/v1/subcategory'),
				])
				const validCategories = (categoriesRes.data?.categories || []).filter(
					cat => cat?.id && cat?.name?.trim()
				)
				setCategories(validCategories)
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

	const getSubCategoriesByCategory = categoryId => {
		return subCategories.filter(subCat => subCat.category_id === categoryId)
	}

	const toggleAccordion = index => {
		setOpenIndexes(prev =>
			prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
		)
	}

	const handleCategoryClick = (categoryName, index) => {
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
	}

	const handleSubCategoryClick = (subCategoryName, categoryName) => {
		const activeMenuItem = localStorage.getItem('activeMenuItem') || 'man'
		const translatedCategory = translateCategoryToEnglish(categoryName)
		setSelectedSubCategory(subCategoryName)
		setSelectedCategory(categoryName)
		localStorage.setItem('subCategory', subCategoryName)
		localStorage.setItem('category', categoryName)
		navigate(`/${activeMenuItem}/${translatedCategory}`)
	}

	if (loading)
		return <div className='py-4 text-center'>Загрузка категорий...</div>
	if (error) return <div className='py-4 text-center text-red-500'>{error}</div>
	if (!categories.length)
		return <div className='py-4 text-center'>Нет доступных категорий</div>

	return (
		<div className='mr-5'>
			<ul className='space-y-2'>
				{' '}
				{/* Добавлен отступ между категориями */}
				{categories.slice(0, 8).map((category, index) => {
					const categorySubs = getSubCategoriesByCategory(category.id)
					const isCategorySelected = selectedCategory === category.name

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
									<div className='flex items-center'>
										<span className='text-lg font-semibold'>
											{category.name || 'Без названия'}
										</span>
										<span
											className={`text-sm mx-2 ${
												isCategorySelected ? 'text-white' : 'text-gray-500'
											}`}
										>
											{category.product_count}
										</span>
									</div>
								</button>
								{categorySubs.length > 0 && (
									<button
										onClick={() => toggleAccordion(index)}
										className='focus:outline-none'
										aria-expanded={openIndexes.includes(index)}
										aria-controls={`category-${category.id}-content`}
									>
										<img
											src={Arrow}
											alt={
												openIndexes.includes(index) ? 'Свернуть' : 'Развернуть'
											}
											className={`h-6 w-6 transition-transform duration-300 ${
												openIndexes.includes(index) ? 'rotate-180' : 'rotate-0'
											} ${isCategorySelected ? 'invert' : ''}`}
										/>
									</button>
								)}
							</div>
							<div
								id={`category-${category.id}-content`}
								ref={el => (contentRefs.current[index] = el)}
								style={{
									maxHeight: openIndexes.includes(index)
										? `${contentRefs.current[index]?.scrollHeight}px`
										: '0',
									overflow: 'hidden',
									transition: 'max-height 0.3s ease-out',
								}}
								aria-hidden={!openIndexes.includes(index)}
							>
								{categorySubs.length > 0 ? (
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
															{subCategory.product_count || 0}
														</span>
														{isSubCategorySelected && (
															<div className='ml-2 w-2 h-2 bg-black rounded-full flex-shrink-0'></div>
														)}
													</div>
												</li>
											)
										})}
									</ul>
								) : (
									<div className='py-2 text-gray-400 pl-6'>
										Нет подкатегорий
									</div>
								)}
							</div>
						</li>
					)
				})}
			</ul>
		</div>
	)
}

export default Accordion
