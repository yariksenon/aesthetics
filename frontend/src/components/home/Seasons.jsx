import React, { useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BannerSeasonsWinter from '../../assets/home/Seasons/Winter.svg'
import BannerSeasonsSummer from '../../assets/home/Seasons/Summer.svg'
import BannerSeasonsSpring from '../../assets/home/Seasons/Spring.svg'
import BannerSeasonsAutumn from '../../assets/home/Seasons/Autumn.svg'
import './custom.css'

const seasonsData = [
	{
		image: BannerSeasonsWinter,
		alt: 'Winter',
		text: 'WINTER',
		hoverColor: '#9CA3AF',
		category: 'winter', // изменено с winter на ski
		russianCategory: 'Зима',
	},
	{
		image: BannerSeasonsSummer,
		alt: 'Summer',
		text: 'SUMMER',
		hoverColor: '#4ADE80',
		category: 'summer', // изменено с summer на volleyball
		russianCategory: 'Лето',
	},
	{
		image: BannerSeasonsSpring,
		alt: 'Spring',
		text: 'SPRING',
		hoverColor: '#F472B6',
		category: 'spring', // изменено с spring на tennis
		russianCategory: 'Весна',
	},
	{
		image: BannerSeasonsAutumn,
		alt: 'Autumn',
		text: 'AUTUMN',
		hoverColor: '#FB923C',
		category: 'autumn',
		russianCategory: 'Осень',
	},
]

function BannerSixth() {
	const navigate = useNavigate()
	const { gender } = useParams()

	const handleClick = useCallback(
		(category, russianCategory) => {
			navigate(`/${gender}/${category}`)
			// Сохраняем русское название категории в localStorage
			localStorage.setItem('category', russianCategory)
		},
		[navigate, gender]
	)

	const seasons = useMemo(() => seasonsData, [])

	const handleMouseEnter = useCallback((e, hoverColor) => {
		e.target.style.color = hoverColor
	}, [])

	const handleMouseLeave = useCallback(e => {
		e.target.style.color = 'transparent'
	}, [])

	// Внутри компонента BannerSixth, измените return часть:
	return (
		<div className='flex mt-[10%] gap-x-2 justify-between'>
			{seasons.map(season => (
				<div
					key={season.category}
					className='relative'
					onClick={() => handleClick(season.category, season.russianCategory)}
				>
					<figure className='h-auto transform transition duration-500 hover:scale-105 cursor-pointer'>
						<img src={season.image} alt={season.alt} className='w-full' />
						<figcaption
							className='font-bebas-neue absolute inset-0 flex items-center justify-center text-xl lg:text-5xl animate-fade-in transition duration-500'
							style={{
								background: 'linear-gradient(to bottom, white 80%, black 100%)',
								WebkitBackgroundClip: 'text',
								backgroundClip: 'text',
								color: 'transparent',
							}}
							onMouseEnter={e => handleMouseEnter(e, season.hoverColor)}
							onMouseLeave={handleMouseLeave}
						>
							{season.text}
						</figcaption>
					</figure>
				</div>
			))}
		</div>
	)
}

export default BannerSixth
