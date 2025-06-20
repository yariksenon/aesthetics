import { useState, useEffect, useCallback, useRef, memo } from 'react'
import { FiChevronDown, FiChevronUp, FiX, FiCheck } from 'react-icons/fi'

const ProductFilter = ({ onFilter }) => {
	const [filters, setFilters] = useState({
		colors: [],
		priceRange: { min: 0, max: 0 },
		sortBy: '',
		availability: '',
	})

	const [priceLimits, setPriceLimits] = useState({ min: 0, max: 0 })
	const [availableColors, setAvailableColors] = useState([])
	const [activeDropdown, setActiveDropdown] = useState(null)
	const [isLoadingPrices, setIsLoadingPrices] = useState(true)
	const [colorSearch, setColorSearch] = useState('')
	const colorInputRef = useRef(null)

	// Загрузка данных о ценах и цветах
	useEffect(() => {
		const fetchPricesAndColors = async () => {
			try {
				const response = await fetch('http://45.12.74.28:8080/api/v1/products')
				const data = await response.json()

				if (data?.products?.length > 0) {
					const prices = data.products.map(p => p.price)
					const minPrice = Math.min(...prices)
					const maxPrice = Math.max(...prices)

					const colors = [...new Set(data.products.map(p => p.color))].map(
						color => ({
							id: color.toLowerCase(),
							name: color,
							hex: getColorHex(color),
						})
					)

					setPriceLimits({ min: minPrice, max: maxPrice })
					setAvailableColors(colors)
					setFilters(prev => ({
						...prev,
						priceRange: { min: minPrice, max: maxPrice },
					}))
				}
			} catch (error) {
				console.error('Ошибка при загрузке данных:', error)
				setPriceLimits({ min: 0, max: 1000 })
				setAvailableColors([])
				setFilters(prev => ({
					...prev,
					priceRange: { min: 0, max: 1000 },
				}))
			} finally {
				setIsLoadingPrices(false)
			}
		}

		fetchPricesAndColors()
	}, [])

	// Функция для преобразования названия цвета в HEX
	const getColorHex = color => {
		const colorMap = {
			red: '#ff0000',
			green: '#00ff00',
			blue: '#0000ff',
			black: '#000000',
			white: '#ffffff',
			yellow: '#ffff00',
			purple: '#800080',
			pink: '#ffc0cb',
			orange: '#ffa500',
			gray: '#808080',
			silver: '#c0c0c0',
			gold: '#ffd700',
			серый: '#808080',
			красный: '#ff0000',
			зелёный: '#00ff00',
			синий: '#0000ff',
			чёрный: '#000000',
			белый: '#ffffff',
			жёлтый: '#ffff00',
			фиолетовый: '#800080',
			розовый: '#ffc0cb',
			оранжевый: '#ffa500',
			серебристый: '#c0c0c0',
			золотой: '#ffd700',
		}

		const colorLower = color.toLowerCase()
		const isHex = /^#[0-9A-Fa-f]{6}$/i.test(color)
		return isHex ? color : colorMap[colorLower] || '#cccccc'
	}

	// Добавление пользовательского цвета
	const addCustomColor = useCallback(() => {
		if (!colorSearch.trim()) return

		const isHex = /^#[0-9A-Fa-f]{6}$/i.test(colorSearch)
		const newColor = {
			id: colorSearch.toLowerCase(),
			name: colorSearch,
			hex: isHex ? colorSearch : getColorHex(colorSearch),
		}

		if (!availableColors.some(c => c.id === newColor.id)) {
			setAvailableColors(prev => [...prev, newColor])
		}

		toggleFilter('colors', newColor.id)
		setColorSearch('')
		if (colorInputRef.current) {
			colorInputRef.current.focus()
		}
	}, [colorSearch, availableColors])

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

	// Обработка перетаскивания ползунков
	const [activeSlider, setActiveSlider] = useState(null)

	const handleSliderMouseDown = sliderName => {
		setActiveSlider(sliderName)
	}

	const handleSliderMouseUp = () => {
		setActiveSlider(null)
	}

	const handleSliderMove = e => {
		if (!activeSlider) return

		const slider = e.target.closest('.price-slider-container')
		if (!slider) return

		const rect = slider.getBoundingClientRect()
		const percent = Math.min(
			Math.max((e.clientX - rect.left) / rect.width, 0),
			1
		)
		const value = Math.round(
			priceLimits.min + percent * (priceLimits.max - priceLimits.min)
		)

		if (activeSlider === 'min') {
			setFilters(prev => {
				const newMin = Math.min(value, prev.priceRange.max)
				const newFilters = {
					...prev,
					priceRange: { ...prev.priceRange, min: newMin },
				}
				if (onFilter) onFilter(newFilters)
				return newFilters
			})
		} else {
			setFilters(prev => {
				const newMax = Math.max(value, prev.priceRange.min)
				const newFilters = {
					...prev,
					priceRange: { ...prev.priceRange, max: newMax },
				}
				if (onFilter) onFilter(newFilters)
				return newFilters
			})
		}
	}

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
		setColorSearch('')
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
		sortOptions: [
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

	const FilterDropdown = memo(
		({ type, label, options, multiSelect = true }) => {
			console.log(`FilterDropdown rendered for type: ${type}`) // Отладка ререндеров
			const isOpen = activeDropdown === type
			const hasValue = multiSelect
				? filters[type].length > 0
				: type === 'priceRange'
				? filters.priceRange.min !== priceLimits.min ||
				  filters.priceRange.max !== priceLimits.max
				: filters[type] !== ''

			const filteredOptions =
				type === 'colors'
					? options.filter(option =>
							option.name.toLowerCase().includes(colorSearch.toLowerCase())
					  )
					: options

			const handleInputClick = useCallback(e => {
				e.stopPropagation()
			}, [])

			const handleKeyDown = useCallback(
				e => {
					if (e.key === 'Enter') {
						e.preventDefault()
						addCustomColor()
					}
				},
				[addCustomColor]
			)

			return (
				<div className='relative'>
					<button
						onClick={() => setActiveDropdown(isOpen ? null : type)}
						className={`flex items-center gap-2 bg-white px-4 py-2 border rounded-sm text-sm ${
							hasValue
								? 'border-black'
								: 'border-gray-300 hover:border-gray-500'
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
						<div
							className='absolute left-0 mt-2 bg-white shadow-lg rounded-lg p-4 w-72 border border-gray-200 z-20 price-slider-container'
							onMouseMove={handleSliderMove}
							onMouseUp={handleSliderMouseUp}
							onMouseLeave={handleSliderMouseUp}
						>
							{isLoadingPrices ? (
								<div className='py-4 text-center text-sm'>Загрузка цен...</div>
							) : (
								<>
									<div className='mb-6 relative h-1'>
										<div
											className='absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-full'
											style={getTrackStyle()}
										/>
										<div
											className='absolute top-1/2 h-4 w-4 bg-black border-2 border-white rounded-full shadow-md transform -translate-y-1/2 -translate-x-1/2 cursor-pointer z-10'
											style={{
												left: `${
													((filters.priceRange.min - priceLimits.min) /
														(priceLimits.max - priceLimits.min)) *
													100
												}%`,
											}}
											onMouseDown={() => handleSliderMouseDown('min')}
										/>
										<div
											className='absolute top-1/2 h-4 w-4 bg-black border-2 border-white rounded-full shadow-md transform -translate-y-1/2 -translate-x-1/2 cursor-pointer z-10'
											style={{
												left: `${
													((filters.priceRange.max - priceLimits.min) /
														(priceLimits.max - priceLimits.min)) *
													100
												}%`,
											}}
											onMouseDown={() => handleSliderMouseDown('max')}
										/>
									</div>

									<div className='flex justify-between mb-4'>
										<div className='text-sm'>
											<div className='font-medium'>Мин. цена</div>
											<input
												type='number'
												name='min'
												min={priceLimits.min}
												max={priceLimits.max}
												value={filters.priceRange.min}
												onChange={handlePriceChange}
												className='w-20 border border-gray-300 px-2 py-1 rounded'
											/>
										</div>
										<div className='text-sm'>
											<div className='font-medium'>Макс. цена</div>
											<input
												type='number'
												name='max'
												min={priceLimits.min}
												max={priceLimits.max}
												value={filters.priceRange.max}
												onChange={handlePriceChange}
												className='w-20 border border-gray-300 px-2 py-1 rounded'
											/>
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

					{isOpen && type === 'colors' && (
						<div className='absolute left-0 mt-2 bg-white shadow-lg rounded-lg p-3 w-64 border border-gray-200 z-20'>
							<div className='mb-2'>
								<input
									ref={colorInputRef}
									type='text'
									value={colorSearch}
									onChange={e => setColorSearch(e.target.value)}
									onClick={handleInputClick}
									onKeyDown={handleKeyDown}
									placeholder='Введите цвет'
									className='w-full border border-gray-300 px-2 py-1 rounded text-sm'
								/>
							</div>
							<div className='max-h-60 overflow-y-auto mb-2'>
								{filteredOptions.length > 0 ? (
									filteredOptions.map(option => {
										const isSelected = filters[type].includes(option.id)
										return (
											<div
												key={option.id}
												className='flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-2 py-2 rounded-lg'
												onClick={() => toggleFilter(type, option.id)}
											>
												<div
													className='w-5 h-5 rounded-full'
													style={{ backgroundColor: option.hex || '#cccccc' }}
												/>
												<input
													type='checkbox'
													checked={isSelected}
													readOnly
													className='h-4 w-4 rounded focus:ring-black'
												/>
												<span className='text-sm'>{option.name}</span>
												{isSelected && (
													<FiCheck className='ml-auto' size={14} />
												)}
											</div>
										)
									})
								) : (
									<div className='text-sm text-gray-500 px-2 py-2'>
										Нет подходящих цветов
									</div>
								)}
							</div>
							{colorSearch &&
								!filteredOptions.some(
									o => o.name.toLowerCase() === colorSearch.toLowerCase()
								) && (
									<div className='flex items-center gap-2 mt-2'>
										<button
											onClick={addCustomColor}
											className='w-full bg-black text-white px-3 py-1 rounded text-sm'
										>
											Добавить цвет: {colorSearch}
										</button>
									</div>
								)}
						</div>
					)}

					{isOpen && type !== 'priceRange' && type !== 'colors' && (
						<div className='absolute left-0 mt-2 bg-white shadow-lg rounded-lg p-3 w-64 border border-gray-200 z-20'>
							{multiSelect ? (
								<div className='max-h-60 overflow-y-auto'>
									{options.map(option => {
										const isSelected = filters[type].includes(
											option.id || option
										)
										return (
											<div
												key={option.id || option}
												className='flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-2 py-2 rounded-lg'
												onClick={() => toggleFilter(type, option.id || option)}
											>
												<input
													type='checkbox'
													checked={isSelected}
													readOnly
													className='h-4 w-4 rounded focus:ring-black'
												/>
												<span className='text-sm'>
													{option.name || option.label || option}
												</span>
												{isSelected && (
													<FiCheck className='ml-auto' size={14} />
												)}
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
	)

	return (
		<div className='bg-white rounded-xl'>
			<div className='flex flex-wrap gap-3 pb-4'>
				<FilterDropdown
					type='colors'
					label='Цвет'
					options={availableColors}
					multiSelect={true}
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
