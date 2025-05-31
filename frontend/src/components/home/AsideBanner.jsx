import React, { useState, useEffect, useCallback } from 'react'
import navClose from '../../assets/home/AsideBanner/nav-close.svg'

function AsideBanner() {
	const salary = 20
	const [isVisible, setIsVisible] = useState(true)
	const [isClosing, setIsClosing] = useState(false)

	useEffect(() => {
		const isBannerClosed = localStorage.getItem('isBannerClosed')
		if (isBannerClosed === 'true') {
			setIsVisible(false)
		}
	}, [])

	const handleClose = useCallback(() => {
		setIsClosing(true)
		const timer = setTimeout(() => {
			setIsVisible(false)
			localStorage.setItem('isBannerClosed', 'true')
		}, 300)

		return () => clearTimeout(timer)
	}, [])

	if (!isVisible) return null

	return (
		<aside
			className={`w-full bg-black text-white py-3 px-4 flex justify-between items-center transition-opacity duration-300 ${
				isClosing ? 'opacity-0' : 'opacity-100'
			}`}
			role='banner'
			aria-label='Специальное предложение'
		>
			<div className='flex-1 text-center'>
				<p className='inline text-sm sm:text-base md:text-lg'>
					Зарегистрируйтесь и совершите первый заказ
				</p>
			</div>

			<button
				className='cursor-pointer focus:outline-none ml-4 flex-shrink-0'
				onClick={handleClose}
				aria-label='Закрыть баннер'
			>
				<img className='w-4 h-4 sm:w-5 sm:h-5' src={navClose} alt='Close' />
			</button>
		</aside>
	)
}

export default React.memo(AsideBanner)
