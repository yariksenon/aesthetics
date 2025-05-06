import React from 'react'
import Logo from '../../assets/home/Footer/Logo.svg'
import { Link, useNavigate } from 'react-router-dom'

function WhyUs() {
	const navigate = useNavigate()

	const handleShopNow = () => {
		const gender = localStorage.getItem('activeMenuItem') || 'unisex'
		navigate(`/${gender}/new`)
	}

	return (
		<div className='bg-black text-white min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden'>
			{/* Декоративные элементы на заднем фоне */}
			<div className='absolute inset-0 z-0 overflow-hidden'>
				{/* Абстрактные круги */}
				<div className='absolute w-64 h-64 bg-white opacity-10 rounded-full -top-32 -left-32 animate-spin-slow'></div>
				<div className='absolute w-96 h-96 bg-white opacity-5 rounded-full -bottom-48 -right-48 animate-pulse'></div>
				<div className='absolute w-80 h-80 bg-white opacity-10 rounded-full top-1/4 left-1/4 animate-bounce'></div>
				<div className='absolute w-72 h-72 bg-white opacity-5 rounded-full top-1/2 right-1/4 animate-ping'></div>

				{/* Градиентные пятна */}
				<div className='absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-purple-900 opacity-10'></div>

				{/* Хаотичные элементы */}
				<div className='absolute w-24 h-24 bg-purple-500 opacity-20 rounded-full top-1/3 left-1/4 animate-spin'></div>
				<div className='absolute w-40 h-40 bg-orange-500 opacity-20 rounded-full bottom-1/4 right-1/3 animate-wiggle'></div>
				<div className='absolute w-56 h-56 bg-pink-500 opacity-20 rounded-full top-1/2 left-1/2 animate-pulse'></div>

				{/* Случайные фигуры */}
				<div className='absolute w-48 h-48 bg-red-500 opacity-20 transform rotate-45 top-1/4 right-1/4 animate-spin-slow'></div>
				<div className='absolute w-36 h-36 bg-blue-500 opacity-20 transform skew-x-12 bottom-1/4 left-1/4 animate-wiggle'></div>
			</div>

			{/* Логотип */}
			<div className='mb-12 z-10 transform transition-all duration-500 hover:scale-110'>
				<Link to='/'>
					<img
						src={Logo}
						alt='Logo'
						className='h-24 w-auto filter hover:opacity-80 transition-opacity duration-300'
					/>
				</Link>
			</div>

			{/* Контент */}
			<div className='max-w-6xl mx-auto text-center z-10 px-4'>
				<h1 className='text-6xl font-bold mb-8 font-comic bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text animate-pulse'>
					Почему Мы? 🤔
				</h1>

				<div className='mb-16'>
					<p className='text-2xl mb-8 font-serif italic text-yellow-300'>
						Мы — команда профессионалов, посвятивших себя предоставлению
						высококачественных спортивных товаров и экипировки. Наша миссия —
						помочь вам достичь ваших спортивных целей с лучшими продуктами на
						рынке.
					</p>
					<p className='text-2xl mb-8 font-mono text-green-400'>
						Наш опыт и страсть к спорту позволяют нам предлагать уникальные
						решения, которые помогают нашим клиентам преуспеть в их спортивных
						начинаниях.
					</p>
				</div>

				{/* Кнопка покупки */}
				<button
					onClick={handleShopNow}
					className='mb-16 px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-full text-xl hover:from-purple-700 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl shadow-purple-500/30 animate-bounce'
				>
					Перейти к покупкам 🛍️
				</button>

				{/* Преимущества */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16'>
					{[
						{
							title: 'Гарантия Качества',
							text: 'Мы тщательно отбираем наши спортивные товары, чтобы обеспечить высочайшее качество и производительность.',
							color: 'from-purple-400 to-indigo-500',
						},
						{
							title: 'Широкий Ассортимент',
							text: 'Наш магазин предлагает разнообразный выбор спортивных товаров, от экипировки до оборудования.',
							color: 'from-orange-400 to-red-500',
						},
						{
							title: 'Поддержка Клиентов',
							text: 'Наша команда всегда готова помочь вам с любыми вопросами и обеспечить лучший опыт покупок.',
							color: 'from-green-400 to-teal-500',
						},
						{
							title: 'Быстрая Доставка',
							text: 'Мы предоставляем быструю и надёжную доставку, чтобы вы могли наслаждаться своими покупками скорее.',
							color: 'from-blue-400 to-cyan-500',
						},
						{
							title: 'Экологичные Товары',
							text: 'Мы стремимся предлагать экологически чистые товары и поддерживать устойчивые практики.',
							color: 'from-yellow-400 to-amber-500',
						},
						{
							title: 'Оптимальные Цены',
							text: 'Мы предлагаем высококачественные товары по конкурентоспособным ценам с лучшим соотношением.',
							color: 'from-pink-400 to-rose-500',
						},
					].map((item, index) => (
						<div
							key={index}
							className={`bg-gradient-to-br ${item.color} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}
						>
							<h2 className='text-2xl font-bold mb-4 text-white'>
								{item.title}
							</h2>
							<p className='text-white/90'>{item.text}</p>
						</div>
					))}
				</div>

				{/* Заключение */}
				<div className='bg-gradient-to-r from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700 backdrop-blur-sm'>
					<p className='text-2xl font-cursive text-blue-300'>
						Свяжитесь с нами, чтобы узнать больше о том, как мы можем помочь вам
						улучшить ваш спортивный опыт и достичь новых высот!
					</p>
				</div>
			</div>

			{/* Декоративные элементы */}
			<div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-20'></div>
			<div className='absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent z-20'></div>
		</div>
	)
}

export default WhyUs
