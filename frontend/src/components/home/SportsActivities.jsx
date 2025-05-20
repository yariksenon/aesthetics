import React, { useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Ski from '../../assets/home/SportsActivities/Snow.svg'
import Tenis from '../../assets/home/SportsActivities/Tenis.svg'
import Volleybal from '../../assets/home/SportsActivities/Volleybal.svg'

const sportsActivities = [
	{
		src: Ski,
		alt: 'Snowing sport',
		category: 'skiing',
		russianCategory: 'Лыжи', // Добавлено русское название
	},
	{
		src: Tenis,
		alt: 'Playing tenis',
		category: 'tennis',
		russianCategory: 'Теннис', // Добавлено русское название
	},
	{
		src: Volleybal,
		alt: 'Playing volleyball',
		category: 'volleyball',
		russianCategory: 'Волейбол', // Добавлено русское название
	},
]

function SportActivityImage({ src, alt, category, russianCategory, onClick }) {
	return (
		<div
			className='cursor-pointer transform transition-transform hover:scale-95'
			onClick={() => onClick(category, russianCategory)}
		>
			<img
				src={src}
				alt={alt}
				className='w-full h-full object-cover transition duration-300 ease-in-out'
				width='100'
				height='100'
			/>
		</div>
	)
}

function SportActivities() {
	const navigate = useNavigate()
	const { gender } = useParams()

	const handleClick = useCallback(
		(category, russianCategory) => {
			navigate(`/${gender}/${category}`)
			// Сохраняем русское название категории в localStorage
			localStorage.setItem('category', russianCategory)
			console.log(`Saved to localStorage: ${russianCategory}`) // Для отладки
		},
		[navigate, gender]
	)

	return (
		<div className='flex mt-[3%] gap-x-2'>
			{sportsActivities.map((activity, index) => (
				<SportActivityImage
					key={index}
					src={activity.src}
					alt={activity.alt}
					category={activity.category}
					russianCategory={activity.russianCategory}
					onClick={handleClick}
				/>
			))}
		</div>
	)
}

export default SportActivities
