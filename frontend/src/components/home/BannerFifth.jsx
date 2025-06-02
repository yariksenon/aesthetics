import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

// Импорты изображений
import BannerFifthGym from '../../assets/home/Advertisement/second_top.jpg'
import BannerFifthDayving from '../../assets/home/Advertisement/second_low.jpg'

// Импорты иконок
import leftArrow from '../../assets/home/Banner/LeftArrow.svg'
import rightArrow from '../../assets/home/Banner/RightArrow.svg'
import slash from '../../assets/home/Banner/Slash.svg'
import longLine from '../../assets/home/Banner/LongLine.svg'
import shortLine from '../../assets/home/Banner/ShortLine.svg'

// Импорты изображений для разных категорий
import man_run from '../../assets/home/BannerSecond/man/man_run.jpg'
import man_training from '../../assets/home/BannerSecond/man/man_training.jpg'
import man_rugby from '../../assets/home/BannerSecond/man/man_rugby.jpg'
import man_football from '../../assets/home/BannerSecond/man/man_football.png'

import woman_run from '../../assets/home/BannerSecond/woman/girl_run.avif'
import woman_training from '../../assets/home/BannerSecond/woman/girl_training.jpeg'
import woman_rugby from '../../assets/home/BannerSecond/woman/girl_rugby.webp'
import woman_football from '../../assets/home/BannerSecond/woman/girl_football.jpg'

import children_run from '../../assets/home/BannerSecond/children/children_run.jpg'
import children_training from '../../assets/home/BannerSecond/children/children_training.webp'
import children_rugby from '../../assets/home/BannerSecond/children/children_rugby.jpg'
import children_football from '../../assets/home/BannerSecond/children/children_football.jpg'

// Объект с изображениями для разных категорий
const genderSlides = {
	man: [man_run, man_training, man_rugby, man_football],
	woman: [woman_run, woman_training, woman_rugby, woman_football],
	children: [
		children_run,
		children_training,
		children_rugby,
		children_football,
	],
}

// Данные для слайдов
const slideData = {
	man: [
		{
			text: 'Форма для бега',
			about: 'Для удобства и скорости',
			category: 'running',
			russianCategory: 'Бег',
		},
		{
			text: 'Тренировочная форма',
			about: 'Комфорт и стиль',
			category: 'training',
			russianCategory: 'Тренировки',
		},
		{
			text: 'Форма для регби',
			about: 'Защита и комфорт',
			category: 'rugby',
			russianCategory: 'Регби',
		},
		{
			text: 'Футбольное снаряжение',
			about: 'Идеально для игры',
			category: 'football',
			russianCategory: 'Футбол',
		},
	],
	woman: [
		{
			text: 'Форма для бега',
			about: 'Лёгкость и удобство',
			category: 'running',
			russianCategory: 'Бег',
		},
		{
			text: 'Тренировочная форма',
			about: 'Женская коллекция',
			category: 'training',
			russianCategory: 'Тренировки',
		},
		{
			text: 'Форма для регби',
			about: 'Стиль и защита',
			category: 'rugby',
			russianCategory: 'Регби',
		},
		{
			text: 'Футбольное снаряжение',
			about: 'Для активных девушек',
			category: 'football',
			russianCategory: 'Футбол',
		},
	],
	children: [
		{
			text: 'Форма для бега',
			about: 'Для юных спортсменов',
			category: 'running',
			russianCategory: 'Бег',
		},
		{
			text: 'Тренировочная форма',
			about: 'Детские размеры',
			category: 'training',
			russianCategory: 'Тренировки',
		},
		{
			text: 'Форма для регби',
			about: 'Для детей',
			category: 'rugby',
			russianCategory: 'Регби',
		},
		{
			text: 'Футбольное снаряжение',
			about: 'Юным чемпионам',
			category: 'football',
			russianCategory: 'Футбол',
		},
	],
}

const bannerData = [
	{
		text: 'Снаряжение для зала',
		about: 'Для новых открытий',
		category: 'gym',
		russianCategory: 'Зал',
	},
	{
		text: 'Снаряжение для дайвинга',
		about: 'Для новых открытий',
		category: 'diving',
		russianCategory: 'Дайвинг',
	},
]

function BannerFifth() {
	const navigate = useNavigate()
	const { gender } = useParams()
	const [currentSlide, setCurrentSlide] = useState(0)
	const [isTransitioning, setIsTransitioning] = useState(false)
	const [activeMenuItem, setActiveMenuItem] = useState(
		localStorage.getItem('activeMenuItem') || 'man'
	)

	// Эффект для отслеживания изменений в localStorage
	useEffect(() => {
		const handleStorageChange = () => {
			const currentValue = localStorage.getItem('activeMenuItem')
			if (currentValue && currentValue !== activeMenuItem) {
				setActiveMenuItem(currentValue)
				setCurrentSlide(0) // Сбрасываем на первый слайд при изменении категории
			}
		}

		// Проверяем изменения каждые 500мс (на случай изменений в этой же вкладке)
		const interval = setInterval(() => {
			const currentValue = localStorage.getItem('activeMenuItem')
			if (currentValue !== activeMenuItem) {
				setActiveMenuItem(currentValue || 'man')
				setCurrentSlide(0)
			}
		}, 500)

		window.addEventListener('storage', handleStorageChange)

		return () => {
			window.removeEventListener('storage', handleStorageChange)
			clearInterval(interval)
		}
	}, [activeMenuItem])

	// Получаем текущие слайды и данные в зависимости от выбранной категории
	const getCurrentSlides = useCallback(() => {
		const menuItem = activeMenuItem || gender || 'man'
		return genderSlides[menuItem] || genderSlides.man
	}, [activeMenuItem, gender])

	const getCurrentSlideData = useCallback(() => {
		const menuItem = activeMenuItem || gender || 'man'
		return slideData[menuItem] || slideData.man
	}, [activeMenuItem, gender])

	const slides = getCurrentSlides()
	const currentSlideData = getCurrentSlideData()
	const totalSlides = slides.length

	const handleNextSlide = useCallback(() => {
		setIsTransitioning(true)
		setTimeout(() => {
			setCurrentSlide(prevSlide => (prevSlide + 1) % totalSlides)
			setIsTransitioning(false)
		}, 500)
	}, [totalSlides])

	const handlePrevSlide = useCallback(() => {
		setIsTransitioning(true)
		setTimeout(() => {
			setCurrentSlide(prevSlide => (prevSlide - 1 + totalSlides) % totalSlides)
			setIsTransitioning(false)
		}, 500)
	}, [totalSlides])

	const handleClick = useCallback(
		(category, russianCategory) => {
			navigate(`/${gender || activeMenuItem}/${category}`)
			localStorage.setItem('category', russianCategory)
		},
		[navigate, gender, activeMenuItem]
	)

	// Автопереключение слайдов
	useEffect(() => {
		const interval = setInterval(() => {
			handleNextSlide()
		}, 4000)

		return () => clearInterval(interval)
	}, [handleNextSlide])

	// Компонент прогресс-бара
	const ProgressBar = () => (
		<div className='absolute bottom-0 left-0 right-0 h-1 bg-gray-200 bg-opacity-50'>
			<div
				className='h-1 bg-black'
				style={{
					width: `${((currentSlide + 1) / totalSlides) * 100}%`,
					transition: 'width 0.5s ease-in-out',
				}}
			></div>
		</div>
	)

	// Компонент кнопок навигации
	const NavigationButtons = () => (
		<div className='flex mt-[1%] items-center space-x-2'>
			<button onClick={handlePrevSlide} className='cursor-pointer'>
				<img
					src={leftArrow}
					alt='Previous Slide'
					className='w-4 h-full sm:w-6 md:w-8 lg:w-10'
				/>
			</button>
			<div className='flex items-center space-x-1'>
				<p className='text-[10px] sm:text-xs md:text-sm lg:text-base'>
					{currentSlide + 1}
				</p>
				<img
					src={slash}
					alt='Separator'
					className='w-3 h-full sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6'
				/>
				<p className='text-[10px] sm:text-xs md:text-sm lg:text-base'>
					{totalSlides}
				</p>
			</div>
			<button onClick={handleNextSlide} className='cursor-pointer'>
				<img
					src={rightArrow}
					alt='Next Slide'
					className='w-4 h-full sm:w-6 md:w-8 lg:w-10'
				/>
			</button>
		</div>
	)

	return (
		<div className='grid grid-cols-3 gap-4 mt-[5%]'>
			{/* Боковые баннеры (статические) */}
			<div className='grid grid-rows-2 gap-10 lg:gap-12 col-span-1 h-[25vh] md:h-[40vh] lg:h-[50vh] xl:h-[60vh]'>
				{[BannerFifthGym, BannerFifthDayving].map((banner, index) => (
					<div key={index} className='group'>
						<img
							src={banner}
							alt={`Banner ${index + 1}`}
							className='w-full h-full object-cover cursor-pointer hover:opacity-75'
							onClick={() =>
								handleClick(
									bannerData[index].category,
									bannerData[index].russianCategory
								)
							}
						/>
						<div>
							<button className='block text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>
								{bannerData[index].text}
							</button>
							<button className='block group-hover:hidden text-gray-600 text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>
								{bannerData[index].about}
							</button>
						</div>
						<div className='flex items-center transform -translate-x-5 group-hover:translate-x-0 transition-transform duration-300 ease-in-out'>
							<img
								src={shortLine}
								alt='Short Line Decoration'
								className='hidden group-hover:block w-[20%]'
							/>
							<p className='ml-[2%] hidden text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-600 group-hover:block'>
								Купить
							</p>
						</div>
					</div>
				))}
			</div>

			{/* Основной слайдер */}
			<div className='col-span-2 relative h-[25vh] md:h-[40vh] lg:h-[50vh] xl:h-full group p-0 m-0 w-full'>
				<div className='relative w-full h-full overflow-hidden'>
					{slides.map((slide, index) => (
						<img
							key={`${activeMenuItem}-${index}`} // Уникальный ключ с учетом категории
							src={slide}
							alt={`Advertisement ${index + 1}`}
							className={`absolute w-full h-full object-cover cursor-pointer transition-transform duration-500 ease-in-out ${
								index === currentSlide ? 'translate-x-0' : 'translate-x-full'
							} ${isTransitioning ? 'pointer-events-none' : ''}`}
							onClick={() =>
								handleClick(
									currentSlideData[index].category,
									currentSlideData[index].russianCategory
								)
							}
						/>
					))}
					<ProgressBar />
				</div>

				<div className='flex items-center justify-between mt-2'>
					<div>
						<button className='block text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>
							{currentSlideData[currentSlide].text}
						</button>
						<button className='absolute group-hover:hidden text-gray-600 text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>
							{currentSlideData[currentSlide].about}
						</button>
					</div>
					<NavigationButtons />
				</div>

				<div className='flex items-center transform -translate-x-5 group-hover:translate-x-0 transition-transform duration-300 ease-in-out'>
					<img
						src={longLine}
						alt='Long Line Decoration'
						className='hidden group-hover:block w-[20%]'
					/>
					<p className='ml-[2%] hidden text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-600 group-hover:block'>
						Купить
					</p>
				</div>
			</div>
		</div>
	)
}

export default BannerFifth
