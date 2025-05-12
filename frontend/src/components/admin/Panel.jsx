import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
	FaUsers,
	FaBox,
	FaList,
	FaStream,
	FaShoppingBag,
	FaChartBar,
	FaCommentDots,
	FaMoneyBillAlt,
	FaCheckCircle,
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
		path: '/admin/orders',
		label: 'Заказы',
		icon: <FaShoppingBag className='mr-2' />,
	},
	{
		path: '/admin/reviews',
		label: 'Отзывы',
		icon: <FaCommentDots className='mr-2' />,
	},
	{
		path: '/admin/payment_details',
		label: 'Способ оплаты',
		icon: <FaMoneyBillAlt className='mr-2' />,
	},
	{
		path: '/admin/seller_applications',
		label: 'Заявки продавцов',
		icon: <FaCheckCircle className='mr-2' />,
		fullWidth: true,
	},
]

const Panel = () => {
	const navigate = useNavigate()
	const [searchTerm, setSearchTerm] = useState('')
	const [stats, setStats] = useState({ users: 0, products: 0, orders: 0 })

	useEffect(() => {
		document.title = 'Admin Panel'
		fetchStats()
	}, [])

	const fetchStats = async () => {
		try {
			const response = await axios.get('http://localhost:8080/api/v1/admin')
			setStats(response.data)
		} catch (error) {
			console.error('Ошибка при загрузке статистики:', error)
		}
	}

	const filteredButtons = buttons.filter(button =>
		button.label.toLowerCase().includes(searchTerm.toLowerCase())
	)

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

			<input
				type='text'
				placeholder='Поиск раздела...'
				value={searchTerm}
				onChange={e => setSearchTerm(e.target.value)}
				className='block w-full max-w-lg mx-auto mt-6 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent'
			/>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-8'>
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
				].map((stat, index) => (
					<div
						key={index}
						className='bg-gray-100 p-6 rounded-lg shadow-md flex items-center space-x-4'
					>
						{stat.icon}
						<div>
							<p className='text-2xl font-bold'>{stat.value}</p>
							<p className='text-gray-600'>{stat.label}</p>
						</div>
					</div>
				))}
			</div>

			<div className='grid mt-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto'>
				{filteredButtons.map((button, index) => (
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
		</div>
	)
}

export default Panel
