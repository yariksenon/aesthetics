import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
	FaUsers,
	FaBox,
	FaList,
	FaStream,
	FaShoppingBag,
	FaCommentDots,
	FaEnvelope,
	FaTruck,
	FaBuilding,
} from 'react-icons/fa'
import { Link } from 'react-router-dom'
import headerLogo from '../../assets/home/Header/Logo.svg'

const buttons = [
	{
		path: '/admin/users',
		label: 'Пользователи',
		icon: <FaUsers className='mr-2' />,
	},
	{
		path: '/admin/products',
		label: 'Товары',
		icon: <FaBox className='mr-2' />,
	},
	{
		path: '/admin/categories',
		label: 'Категории',
		icon: <FaList className='mr-2' />,
	},
	{
		path: '/admin/subcategories',
		label: 'Подкатегории',
		icon: <FaStream className='mr-2' />,
	},
	{
		path: '/admin/order',
		label: 'Заказы',
		icon: <FaShoppingBag className='mr-2' />,
	},
	{
		path: '/admin/review',
		label: 'Отзывы',
		icon: <FaCommentDots className='mr-2' />,
	},
	{
		path: '/admin/seller_request',
		label: 'Бренды',
		icon: <FaBuilding className='mr-2' />,
	},
	{
		path: '/admin/newsletter',
		label: 'Отправить письмо',
		icon: <FaEnvelope className='mr-2' />,
	},
	{
		path: '/admin/courier',
		label: 'Курьеры',
		icon: <FaTruck className='mr-2' />,
	},
]

const Panel = () => {
	const navigate = useNavigate()
	const [stats, setStats] = useState({
		brands: 0,
		categories: 0,
		couriers: 0,
		orders: 0,
		products: 0,
		reviews: 0,
		subcategories: 0,
		users: 0,
	})

	useEffect(() => {
		document.title = 'Admin Panel'
		fetchStats()
	}, [])

	const fetchStats = async () => {
		try {
			const response = await axios.get('http://45.12.74.28:8080/api/v1/admin')
			setStats(response.data)
		} catch (error) {
			console.error('Ошибка при загрузке статистики:', error)
		}
	}

	return (
		<div className='min-h-screen bg-white text-black p-8'>
			<div className='flex justify-center items-center'>
				<Link to='/' className='flex'>
					<img src={headerLogo} alt='Logo' />
				</Link>
			</div>

			<p className='text-center bold text-xl text-gray-700 font-bold mt-5'>
				Управление всеми аспектами приложения
			</p>

			<div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-8'>
				{[
					{
						label: 'Пользователи',
						value: stats.users,
						icon: <FaUsers className='text-2xl' />,
					},
					{
						label: 'Товары',
						value: stats.products,
						icon: <FaBox className='text-2xl' />,
					},
					{
						label: 'Заказы',
						value: stats.orders,
						icon: <FaShoppingBag className='text-2xl' />,
					},
					{
						label: 'Бренды',
						value: stats.brands,
						icon: <FaBuilding className='text-2xl' />,
					},
					{
						label: 'Категории',
						value: stats.categories,
						icon: <FaList className='text-2xl' />,
					},
					{
						label: 'Подкатегории',
						value: stats.subcategories,
						icon: <FaStream className='text-2xl' />,
					},
					{
						label: 'Отзывы',
						value: stats.reviews,
						icon: <FaCommentDots className='text-2xl' />,
					},
					{
						label: 'Курьеры',
						value: stats.couriers,
						icon: <FaTruck className='text-2xl' />,
					},
				].map((stat, index) => (
					<div
						key={index}
						className='bg-gray-100 p-6 rounded-lg shadow-md flex flex-col items-center '
					>
						<p className='text-2xl font-bold text-center'>{stat.value}</p>{' '}
						<div className='flex w-full justify-center space-x-2'>
							{stat.icon}
							<p className='text-gray-600'>{stat.label}</p>{' '}
						</div>
					</div>
				))}
			</div>

			<div className='grid mt-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto'>
				{buttons.map((button, index) => (
					<button
						key={index}
						onClick={() => navigate(button.path)}
						className={`flex items-center justify-center bg-gradient-to-r from-black to-gray-800 text-white px-6 py-4 rounded-lg shadow-lg hover:from-gray-800 hover:to-black transition duration-200 transform hover:scale-105 border border-gray-700 ${
							button.fullWidth ? 'col-span-full' : 'w-full'
						}`}
					>
						{button.icon}
						<span className='text-xl font-semibold'>{button.label}</span>
					</button>
				))}
			</div>

			<div className='mt-12 text-center text-gray-500 text-sm'>
				<p>
					© {new Date().getFullYear()} Административная панель. Все права
					защищены.
				</p>
			</div>
		</div>
	)
}

export default Panel
