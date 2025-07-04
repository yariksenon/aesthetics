import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import leftArrow from '../../assets/home/Banner/LeftArrow.svg'
import rightArrow from '../../assets/home/Banner/RightArrow.svg'
import slash from '../../assets/home/Banner/Slash.svg'
import longLine from '../../assets/home/Banner/LongLine.svg'
import shortLine from '../../assets/home/Banner/ShortLine.svg'

import hockeyBanner from '../../assets/home/Advertisement/first_top.jpg'
import tenisBanner from '../../assets/home/Advertisement/first_low.jpg'

import advirtisement_1_1_man from '../../assets/home/Advertisement/man/advertisement-1.1.jpg'
import advirtisement_1_2_man from '../../assets/home/Advertisement/man/advertisement-1.2.jpg'
import advirtisement_1_3_man from '../../assets/home/Advertisement/man/advertisement-1.3.jpg'
import advirtisement_1_4_man from '../../assets/home/Advertisement/man/advirtisement_1_4.jpg'

import advirtisement_1_1_woman from '../../assets/home/Advertisement/woman/rugby_woman.jpg'
import advirtisement_1_2_woman from '../../assets/home/Advertisement/woman/basketballForm.jpg'
import advirtisement_1_3_woman from '../../assets/home/Advertisement/woman/basketball.jpg'
import advirtisement_1_4_woman from '../../assets/home/Advertisement/woman/runGirl.jpg'

import advirtisement_1_1_children from '../../assets/home/Advertisement/children/children_rugby.jpg'
import advirtisement_1_2_children from '../../assets/home/Advertisement/children/children_photo.webp'
import advirtisement_1_3_children from '../../assets/home/Advertisement/children/children_basketball.webp'
import advirtisement_1_4_children from '../../assets/home/Advertisement/children/children_run.webp'

const genderSlides = {
	man: [
		advirtisement_1_1_man,
		advirtisement_1_2_man,
		advirtisement_1_3_man,
		advirtisement_1_4_man,
	],
	woman: [
		advirtisement_1_1_woman,
		advirtisement_1_2_woman,
		advirtisement_1_3_woman,
		advirtisement_1_4_woman,
	],
	children: [
		advirtisement_1_1_children,
		advirtisement_1_2_children,
		advirtisement_1_3_children,
		advirtisement_1_4_children,
	],
}

const slideData = {
	man: [
		{
			text: 'Форма для регби',
			about: 'Качественные товары',
			category: 'rugby',
			russianCategory: 'Регби',
		},
		{
			text: 'Баскетбольная форма',
			about: 'Для любителей баскетбола',
			category: 'basketball',
			russianCategory: 'Баскетбол',
		},
		{
			text: 'Баскетбольное снаряжение',
			about: 'Лучшее для вас',
			category: 'basketball',
			russianCategory: 'Баскетбол',
		},
		{
			text: 'Костюм для бега',
			about: 'Для любителей побегать',
			category: 'running',
			russianCategory: 'Бег',
		},
	],
	woman: [
		{
			text: 'Форма для регби',
			about: 'Стильные женские модели',
			category: 'rugby',
			russianCategory: 'Регби',
		},
		{
			text: 'Баскетбольная форма',
			about: 'Женская коллекция',
			category: 'basketball',
			russianCategory: 'Баскетбол',
		},
		{
			text: 'Баскетбольное снаряжение',
			about: 'Для активных женщин',
			category: 'basketball',
			russianCategory: 'Баскетбол',
		},
		{
			text: 'Костюм для бега',
			about: 'Удобство и комфорт',
			category: 'running',
			russianCategory: 'Бег',
		},
	],
	children: [
		{
			text: 'Форма для регби',
			about: 'Для юных спортсменов',
			category: 'rugby',
			russianCategory: 'Регби',
		},
		{
			text: 'Баскетбольная форма',
			about: 'Детские размеры',
			category: 'basketball',
			russianCategory: 'Баскетбол',
		},
		{
			text: 'Баскетбольное снаряжение',
			about: 'Для детей',
			category: 'basketball',
			russianCategory: 'Баскетбол',
		},
		{
			text: 'Костюм для бега',
			about: 'Юным чемпионам',
			category: 'running',
			russianCategory: 'Бег',
		},
	],
}

const bannerData = [
	{
		text: 'Хоккейная экипировка',
		about: 'Подарок для хоккеиста',
		category: 'hockey',
		russianCategory: 'Хоккей',
	},
	{
		text: 'Снаряжение для тенниса',
		about: 'Для новых открытий',
		category: 'tennis',
		russianCategory: 'Теннис',
	},
]

function BannerFirst() {
	const navigate = useNavigate()
	const { gender } = useParams()
	const [currentSlide, setCurrentSlide] = useState(0)
	const [isTransitioning, setIsTransitioning] = useState(false)
	const [activeMenuItem, setActiveMenuItem] = useState(
		localStorage.getItem('activeMenuItem') || 'man'
	)

	// Listen for localStorage changes and check in current tab
	useEffect(() => {
		const handleStorageChange = e => {
			if (e.key === 'activeMenuItem') {
				setActiveMenuItem(e.newValue || 'man')
				setCurrentSlide(0) // Reset to first slide
			}
		}

		const checkLocalStorageChanges = () => {
			const currentValue = localStorage.getItem('activeMenuItem')
			if (currentValue !== activeMenuItem) {
				setActiveMenuItem(currentValue || 'man')
				setCurrentSlide(0) // Reset to first slide
			}
		}

		window.addEventListener('storage', handleStorageChange)
		const interval = setInterval(checkLocalStorageChanges, 500)

		return () => {
			window.removeEventListener('storage', handleStorageChange)
			clearInterval(interval)
		}
	}, [activeMenuItem])

	// Get slides and slide data based on activeMenuItem
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
		}, 300)
	}, [totalSlides])

	const handlePrevSlide = useCallback(() => {
		setIsTransitioning(true)
		setTimeout(() => {
			setCurrentSlide(prevSlide => (prevSlide - 1 + totalSlides) % totalSlides)
			setIsTransitioning(false)
		}, 300)
	}, [totalSlides])

	const handleClick = useCallback(
		(category, russianCategory) => {
			navigate(`/${gender || activeMenuItem}/${category}`)
			localStorage.setItem('category', russianCategory)
		},
		[navigate, gender, activeMenuItem]
	)

	useEffect(() => {
		const interval = setInterval(() => {
			handleNextSlide()
		}, 4000)

		return () => clearInterval(interval)
	}, [handleNextSlide])

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

	const NavigationButtons = () => (
		<div className='flex items-center space-x-2'>
			<button onClick={handlePrevSlide} className='cursor-pointer'>
				<img
					src={leftArrow}
					alt='Previous Slide'
					className='w-4 h-full sm:w-6 md:w-8 lg:w-10'
				/>
			</button>
			<div className='flex items-center space-x-1'>
				<p className=''>{currentSlide + 1}</p>
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
		<div className='grid grid-cols-3 h-full w-full gap-1 lg:gap-4'>
			<div className='col-span-2 relative group h-[25vh] md:h-[40vh] lg:h-[50vh] xl:h-[60vh]'>
				<div className='relative w-full h-full overflow-hidden'>
					{slides.map((slide, index) => (
						<img
							key={`${activeMenuItem}-${index}`} // Ensure unique key for re-render
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
						alt='Short Line Decoration'
						className='hidden group-hover:block w-[20%]'
					/>
					<p className='ml-[2%] hidden text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-600 group-hover:block'>
						Купить
					</p>
				</div>
			</div>

			<div className='grid grid-rows-2 gap-10 lg:gap-12 col-span-1 h-[25vh] md:h-[40vh] lg:h-[50vh] xl:h-[60vh]'>
				{[hockeyBanner, tenisBanner].map((banner, index) => (
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
		</div>
	)
}

export default BannerFirst
