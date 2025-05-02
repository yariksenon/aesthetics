import { useState, useEffect, useCallback } from 'react'
import { FiChevronDown, FiChevronUp, FiX, FiCheck } from 'react-icons/fi'

const ProductFilter = ({ onFilter }) => {
	const [filters, setFilters] = useState({
		colors: [],
		priceRange: { min: 0, max: 0 },
		sortBy: '',
		availability: '',
	})

	const [priceLimits, setPriceLimits] = useState({ min: 0, max: 0 })
	const [activeDropdown, setActiveDropdown] = useState(null)
	const [isLoadingPrices, setIsLoadingPrices] = useState(true)

	// Загрузка данных о ценах
	useEffect(() => {
		const fetchPrices = async () => {
			try {
				const response = await fetch('http://localhost:8080/api/v1/products')
				const products = await response.json()

				if (products?.length > 0) {
					const prices = products.map(p => p.price)
					const minPrice = Math.min(...prices)
					const maxPrice = Math.max(...prices)

					setPriceLimits({ min: minPrice, max: maxPrice })
					setFilters(prev => ({
						...prev,
						priceRange: { min: minPrice, max: maxPrice },
					}))
				}
			} catch (error) {
				console.error('Ошибка при загрузке цен:', error)
				setPriceLimits({ min: 0, max: 1000 })
				setFilters(prev => ({
					...prev,
					priceRange: { min: 0, max: 1000 },
				}))
			} finally {
				setIsLoadingPrices(false)
			}
		}

		fetchPrices()
	}, [])

	// Обновление фильтров
	const toggleFilter = (filterType, value) => {
		setFilters(prev => {
			const currentValues = prev[filterType]
			const newValues = Array.isArray(currentValues)
				? currentValues.includes(value)
					? currentValues.filter(v => v !== value)
					: [...currentValues, value]
				: value

			const newFilters = { ...prev, [filterType]: newValues }
			if (onFilter) onFilter(newFilters)
			return newFilters
		})
	}

	// Обновление ценового диапазона
	const handlePriceChange = useCallback(
		e => {
			const { name, value } = e.target
			setFilters(prev => {
				const newRange = { ...prev.priceRange, [name]: parseInt(value) }

				if (name === 'min' && newRange.min > prev.priceRange.max) {
					newRange.max = newRange.min
				} else if (name === 'max' && newRange.max < prev.priceRange.min) {
					newRange.min = newRange.max
				}

				const newFilters = { ...prev, priceRange: newRange }
				if (onFilter) onFilter(newFilters)
				return newFilters
			})
		},
		[onFilter]
	)

	// Стиль для ползунка
	const getTrackStyle = () => {
		const minPercent =
			((filters.priceRange.min - priceLimits.min) /
				(priceLimits.max - priceLimits.min)) *
			100
		const maxPercent =
			((filters.priceRange.max - priceLimits.min) /
				(priceLimits.max - priceLimits.min)) *
			100

		return {
			background: `linear-gradient(to right, 
        #e5e5e5 ${minPercent}%, 
        #000 ${minPercent}%, 
        #000 ${maxPercent}%, 
        #e5e5e5 ${maxPercent}%)`,
		}
	}

	// Сброс фильтров
	const resetFilters = () => {
		setFilters({
			colors: [],
			priceRange: priceLimits,
			sortBy: '',
			availability: '',
		})
		setActiveDropdown(null)
		if (onFilter) onFilter({})
	}

	// Сброс конкретного фильтра
	const resetFilter = filterType => {
		setFilters(prev => {
			const newValue =
				filterType === 'priceRange'
					? priceLimits
					: Array.isArray(prev[filterType])
					? []
					: ''

			const newFilters = { ...prev, [filterType]: newValue }
			if (onFilter) onFilter(newFilters)
			return newFilters
		})
	}

	// Опции фильтров
	const filterOptions = {
		colors: [
			{ id: 'red', name: 'Красный', hex: '#ff0000' },
			{ id: 'blue', name: 'Синий', hex: '#0000ff' },
			{ id: 'green', name: 'Зелёный', hex: '#00ff00' },
			{ id: 'black', name: 'Чёрный', hex: '#000000' },
			{ id: 'white', name: 'Белый', hex: '#ffffff' },
			{ id: 'yellow', name: 'Жёлтый', hex: '#ffff00' },
		],
		sortOptions: [
			{ id: 'default', label: 'По умолчанию' },
			{ id: 'price-asc', label: 'Цена по возрастанию' },
			{ id: 'price-desc', label: 'Цена по убыванию' },
		],
		availabilityOptions: [
			{ id: 'in-stock', label: 'В наличии' },
			{ id: 'pre-order', label: 'Под заказ' },
		],
	}

	// Рендер выбранных фильтров
	const renderSelectedFilters = () => {
		const selected = []

		if (filters.colors.length > 0) {
			selected.push({
				type: 'colors',
				label: `Цвета: ${filters.colors.length}`,
				value: filters.colors,
			})
		}

		if (
			filters.priceRange.min !== priceLimits.min ||
			filters.priceRange.max !== priceLimits.max
		) {
			selected.push({
				type: 'priceRange',
				label: `Цена: ${filters.priceRange.min} - ${filters.priceRange.max} BYN`,
				value: filters.priceRange,
			})
		}

		if (filters.availability) {
			const avail = filterOptions.availabilityOptions.find(
				a => a.id === filters.availability
			)
			selected.push({
				type: 'availability',
				label: avail?.label,
				value: filters.availability,
			})
		}

		if (filters.sortBy) {
			const sort = filterOptions.sortOptions.find(s => s.id === filters.sortBy)
			selected.push({
				type: 'sortBy',
				label: `Сортировка: ${sort?.label}`,
				value: filters.sortBy,
			})
		}

		if (selected.length === 0) return null

		return (
			<div className='flex flex-wrap gap-2 mb-4 items-center'>
				{selected.map((item, index) => (
					<span
						key={index}
						className='flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm'
					>
						{item.label}
						<button
							onClick={() => resetFilter(item.type)}
							className='ml-1 text-gray-500 hover:text-gray-700'
						>
							<FiX size={14} />
						</button>
					</span>
				))}
				<button onClick={resetFilters} className='text-sm ml-2'>
					Очистить все
				</button>
			</div>
		)
	}

	const FilterDropdown = ({ type, label, options, multiSelect = true }) => {
		const isOpen = activeDropdown === type
		const hasValue = multiSelect
			? filters[type].length > 0
			: type === 'priceRange'
			? filters.priceRange.min !== priceLimits.min ||
			  filters.priceRange.max !== priceLimits.max
			: filters[type] !== '' && filters[type] !== 'default'

		return (
			<div className='relative'>
				<button
					onClick={() => setActiveDropdown(isOpen ? null : type)}
					className={`flex items-center gap-2 bg-white px-4 py-2 border rounded-sm text-sm ${
						hasValue ? 'border-black' : 'border-gray-300 hover:border-gray-500'
					}`}
				>
					{label}
					{multiSelect && filters[type].length > 0 && (
						<span className='bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
							{filters[type].length}
						</span>
					)}
					{isOpen ? <FiChevronUp /> : <FiChevronDown />}
				</button>

				{isOpen && type === 'priceRange' && (
					<div className='absolute left-0 mt-2 bg-white shadow-lg rounded-lg p-4 w-72 border border-gray-200 z-20'>
						{isLoadingPrices ? (
							<div className='py-4 text-center text-sm'>Загрузка цен...</div>
						) : (
							<>
								<div className='mb-6'>
									<div
										className='relative h-1 bg-gray-200 rounded-full'
										style={getTrackStyle()}
									>
										<input
											type='range'
											name='min'
											min={priceLimits.min}
											max={priceLimits.max}
											value={filters.priceRange.min}
											onChange={handlePriceChange}
											className='absolute w-full h-1 opacity-0 cursor-pointer z-10'
										/>
										<div
											className='absolute top-1/2 h-4 w-4 bg-black border-2 border-white rounded-full shadow-md transform -translate-y-1/2 -translate-x-1/2'
											style={{
												left: `${
													((filters.priceRange.min - priceLimits.min) /
														(priceLimits.max - priceLimits.min)) *
													100
												}%`,
											}}
										/>
										<div
											className='absolute top-1/2 h-4 w-4 bg-black border-2 border-white rounded-full shadow-md transform -translate-y-1/2 -translate-x-1/2'
											style={{
												left: `${
													((filters.priceRange.max - priceLimits.min) /
														(priceLimits.max - priceLimits.min)) *
													100
												}%`,
											}}
										/>
									</div>
								</div>

								<div className='flex justify-between mb-4'>
									<div className='text-sm'>
										<div className='font-medium'>Мин. цена</div>
										<div>{filters.priceRange.min} BYN</div>
									</div>
									<div className='text-sm'>
										<div className='font-medium'>Макс. цена</div>
										<div>{filters.priceRange.max} BYN</div>
									</div>
								</div>

								<button
									onClick={() => setActiveDropdown(null)}
									className='w-full bg-black text-white py-2 rounded-sm text-sm'
								>
									Применить
								</button>
							</>
						)}
					</div>
				)}

				{isOpen && type !== 'priceRange' && (
					<div className='absolute left-0 mt-2 bg-white shadow-lg rounded-lg p-3 w-64 border border-gray-200 z-20'>
						{multiSelect ? (
							<div className='max-h-60 overflow-y-auto'>
								{options.map(option => {
									const isSelected = filters[type].includes(option.id || option)
									return (
										<div
											key={option.id || option}
											className='flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-2 py-2 rounded-lg'
											onClick={() => toggleFilter(type, option.id || option)}
										>
											{type === 'colors' && (
												<div
													className='w-5 h-5 rounded-full border border-gray-300'
													style={{ backgroundColor: option.hex }}
												/>
											)}
											<input
												type='checkbox'
												checked={isSelected}
												readOnly
												className='h-4 w-4 rounded focus:ring-black'
											/>
											<span className='text-sm'>
												{option.name || option.label || option}
											</span>
											{isSelected && <FiCheck className='ml-auto' size={14} />}
										</div>
									)
								})}
							</div>
						) : (
							<div className='space-y-2'>
								{options.map(option => (
									<div
										key={option.id}
										className={`flex items-center gap-3 cursor-pointer px-2 py-2 rounded-lg ${
											filters[type] === option.id
												? 'bg-gray-50'
												: 'hover:bg-gray-50'
										}`}
										onClick={() => toggleFilter(type, option.id)}
									>
										<div
											className={`h-4 w-4 rounded-full border ${
												filters[type] === option.id
													? 'border-black'
													: 'border-gray-300'
											}`}
										/>
										<span className='text-sm'>{option.label}</span>
										{filters[type] === option.id && (
											<FiCheck className='ml-auto' size={14} />
										)}
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		)
	}

	return (
		<div className='bg-white rounded-xl'>
			<div className='flex flex-wrap gap-3 pb-4'>
				<FilterDropdown
					type='colors'
					label='Цвет'
					options={filterOptions.colors}
				/>
				<FilterDropdown
					type='priceRange'
					label='Цена'
					options={[]}
					multiSelect={false}
				/>
				<FilterDropdown
					type='availability'
					label='Наличие'
					options={filterOptions.availabilityOptions}
					multiSelect={false}
				/>
				<FilterDropdown
					type='sortBy'
					label='Сортировка'
					options={filterOptions.sortOptions}
					multiSelect={false}
				/>
			</div>

			{renderSelectedFilters()}
		</div>
	)
}

export default ProductFilter
