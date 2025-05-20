import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import advirtisement_2_1 from '../../assets/home/Advertisement/advertisement-2.1.jpg'
import advirtisement_3_2 from '../../assets/home/Advertisement/advertisement-2.2.jpg'
import advirtisement_4_3 from '../../assets/home/Advertisement/advertisement-2.3.jpg'
import advirtisement_5_4 from '../../assets/home/Advertisement/advertisement-2.4.png'

import BannerFifthGym from '../../assets/home/Advertisement/second_top.jpg'
import BannerFifthDayving from '../../assets/home/Advertisement/second_low.jpg'

import leftArrow from '../../assets/home/Banner/LeftArrow.svg'
import rightArrow from '../../assets/home/Banner/RightArrow.svg'
import slash from '../../assets/home/Banner/Slash.svg'
import longLine from '../../assets/home/Banner/LongLine.svg'
import shortLine from '../../assets/home/Banner/ShortLine.svg'

const slides = [
	advirtisement_2_1,
	advirtisement_3_2,
	advirtisement_4_3,
	advirtisement_5_4,
]
const totalSlides = slides.length

const slideData = [
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
]

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
			navigate(`/${gender}/${category}`)
			localStorage.setItem('category', russianCategory)
			console.log(`Saved category to localStorage: ${russianCategory}`)
		},
		[navigate, gender]
	)

	useEffect(() => {
		const interval = setInterval(() => {
			handleNextSlide()
		}, 4000)

		return () => clearInterval(interval)
	}, [currentSlide, totalSlides, handleNextSlide])

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

			<div className='col-span-2 relative h-[25vh] md:h-[40vh] lg:h-[50vh] xl:h-full group p-0 m-0 w-full'>
				<div className='relative w-full h-full overflow-hidden'>
					{slides.map((slide, index) => (
						<img
							key={index}
							src={slide}
							alt={`Advertisement ${index + 1}`}
							className={`absolute w-full h-full object-cover cursor-pointer transition-transform duration-500 ease-in-out ${
								index === currentSlide ? 'translate-x-0' : 'translate-x-full'
							}`}
							onClick={() =>
								handleClick(
									slideData[index].category,
									slideData[index].russianCategory
								)
							}
						/>
					))}
					<ProgressBar />
				</div>

				<div className='flex items-center justify-between mt-2'>
					<div>
						<button className='block text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>
							{slideData[currentSlide].text}
						</button>
						<button className='absolute group-hover:hidden text-gray-600 text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>
							{slideData[currentSlide].about}
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
