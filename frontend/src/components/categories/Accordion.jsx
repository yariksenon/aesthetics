import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Arrow from '../../assets/category/accordion/DownArrow.svg'

const Accordion = () => {
	const [openIndexes, setOpenIndexes] = useState([])
	const [categories, setCategories] = useState([])
	const [subCategories, setSubCategories] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const contentRefs = useRef([])

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [categoriesRes, subCategoriesRes] = await Promise.all([
					axios.get('http://localhost:8080/api/v1/gender/category/'),
					axios.get('http://localhost:8080/api/v1/subcategory'),
				])

				// Обрабатываем категории
				const validCategories = (categoriesRes.data?.category || []).filter(
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

	// Группируем подкатегории по category_id
	const getSubCategoriesByCategory = categoryId => {
		return subCategories.filter(subCat => subCat.category_id === categoryId)
	}

	const toggleAccordion = index => {
		setOpenIndexes(prev =>
			prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
		)
	}

	if (loading)
		return <div className='py-4 text-center'>Загрузка категорий...</div>
	if (error) return <div className='py-4 text-center text-red-500'>{error}</div>
	if (!categories.length)
		return <div className='py-4 text-center'>Нет доступных категорий</div>

	return (
		<div className='mr-5'>
			<ul>
				{categories.slice(0, 8).map((category, index) => {
					const categorySubs = getSubCategoriesByCategory(category.id)

					return (
						<li key={category.id} className='py-1'>
							<button
								onClick={() => toggleAccordion(index)}
								className='w-full text-left focus:outline-none flex justify-between items-center'
								aria-expanded={openIndexes.includes(index)}
								aria-controls={`category-${category.id}-content`}
							>
								<span className='text-lg py-1 font-semibold'>
									{category.name || 'Без названия'}
								</span>
								{categorySubs.length > 0 && (
									<img
										src={Arrow}
										alt={
											openIndexes.includes(index) ? 'Свернуть' : 'Развернуть'
										}
										className={`h-6 w-6 transition-transform duration-300 ${
											openIndexes.includes(index) ? 'rotate-180' : 'rotate-0'
										}`}
									/>
								)}
							</button>
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
								className='mt-2'
								aria-hidden={!openIndexes.includes(index)}
							>
								{categorySubs.length > 0 ? (
									categorySubs.map(subCategory => (
										<div key={subCategory.id} className='py-2'>
											<span className='text-md cursor-pointer text-gray-600 hover:text-stone-900'>
												{subCategory.name || 'Без названия'}
											</span>
										</div>
									))
								) : (
									<div className='py-2 text-gray-400'>Нет подкатегорий</div>
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
