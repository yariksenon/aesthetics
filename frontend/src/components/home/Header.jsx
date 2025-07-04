import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import headerLogo from '../../assets/home/Header/Logo.svg'
import headerBasket from '../../assets/home/Header/Basket.svg'
import closeButtonWhite from '../../assets/home/Header/CloseButtonWhite.svg'
import AuthModal from './AuthModal'
import './custom.css'

const MenuItem = ({ label, value, activeMenuItem, onClick }) => (
	<li
		onClick={() => onClick(value)}
		className={`text-[10px] sm:text-xs md:text-sm lg:text-base ${
			activeMenuItem === value ? 'text-red-500' : 'text-black'
		} ${
			label === 'Скидки' ? 'text-red-500' : ''
		} custom-underline cursor-pointer whitespace-nowrap`}
	>
		{label}
	</li>
)

const MobileMenu = ({
	isMenuOpen,
	toggleMenu,
	menuItems,
	handleGenderChange,
	handleCategoryChange,
	activeMenuItem,
}) =>
	isMenuOpen && (
		<div
			className='fixed inset-0 bg-black bg-opacity-70 z-40 lg:hidden'
			onClick={toggleMenu}
		>
			<div className='bg-white w-3/4 h-full p-6 relative'>
				<ul className='space-y-4'>
					{menuItems.map((item, index) => (
						<MenuItem
							key={index}
							label={item.label}
							value={item.value}
							activeMenuItem={activeMenuItem}
							onClick={
								item.isGender ? handleGenderChange : handleCategoryChange
							}
						/>
					))}
				</ul>
			</div>

			<button
				onClick={toggleMenu}
				className='fixed right-[5%] sm:right-[10%] md:right-[15%] top-4 cursor-pointer z-50'
				aria-label='Закрыть меню'
			>
				<img
					src={closeButtonWhite}
					alt='Close menu'
					className='w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8'
				/>
			</button>
		</div>
	)

const UserAvatar = ({ email, firstName }) => {
	const getInitials = email => {
		if (!email) return '??'
		const parts = email.split('@')[0]
		if (parts.length >= 2) {
			return parts.substring(0, 2).toUpperCase()
		}
		return parts.length === 1 ? `${parts[0]}${parts[0]}`.toUpperCase() : '??'
	}

	return (
		<div className='flex items-center'>
			<div className='w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm md:text-base font-medium text-gray-700 cursor-pointer'>
				{getInitials(email)}
			</div>
			{firstName && (
				<span className='ml-2 text-[10px] sm:text-xs md:text-sm lg:text-base hidden md:inline'>
					{firstName}
				</span>
			)}
		</div>
	)
}

function Header() {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [isLogin, setIsLogin] = useState(true)
	const [showSocials, setShowSocials] = useState(false)
	const [activeMenuItem, setActiveMenuItem] = useState(() => {
		const savedMenuItem = localStorage.getItem('activeMenuItem')
		return savedMenuItem && ['woman', 'man', 'children'].includes(savedMenuItem)
			? savedMenuItem
			: 'woman'
	})
	const [wishlistItemsCount, setWishlistItemsCount] = useState(0)
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [userData, setUserData] = useState(null)
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const [cartItemsCount, setCartItemsCount] = useState(0)
	const dropdownRef = useRef(null)
	const navigate = useNavigate()
	const { gender } = useParams()
	const isAdmin = userData?.role === 'admin'

	const userId = localStorage.getItem('userId')

	const fetchWishlistCount = async () => {
		if (!userId) return

		try {
			const response = await axios.get(
				`http://45.12.74.28:8080/api/v1/wishlist/${userId}`
			)
			const items = response.data?.items || []
			setWishlistItemsCount(items.length)
		} catch (error) {
			console.error('Ошибка при загрузке избранного:', error)
			setWishlistItemsCount(0)
		}
	}

	useEffect(() => {
		const token = localStorage.getItem('authToken')
		const user = JSON.parse(localStorage.getItem('userData'))

		if (token && user) {
			setIsAuthenticated(true)
			setUserData(user)
		}

		fetchCartCount()
		fetchWishlistCount()
	}, [])

	const fetchCartCount = async () => {
		if (!userId) return

		try {
			const response = await axios.get(
				`http://45.12.74.28:8080/api/v1/cart/${userId}`
			)
			const items = response.data?.items || []
			const count = items.reduce((total, item) => total + item.quantity, 0)
			setCartItemsCount(count)
		} catch (error) {
			console.error('Ошибка при загрузке корзины:', error)
			setCartItemsCount(0)
		}
	}

	useEffect(() => {
		const handleClickOutside = event => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsDropdownOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const handleLoginSuccess = useCallback((token, user) => {
		localStorage.setItem('authToken', token)
		localStorage.setItem('userData', JSON.stringify(user))
		setIsAuthenticated(true)
		setUserData(user)
		setIsModalOpen(false)
		fetchCartCount()
		fetchWishlistCount()
	}, [])

	const handleLogout = useCallback(() => {
		localStorage.removeItem('authToken')
		localStorage.removeItem('userData')
		localStorage.removeItem('userId')
		setIsAuthenticated(false)
		setUserData(null)
		setIsDropdownOpen(false)
		setCartItemsCount(0)
		setWishlistItemsCount(0)
		navigate('/')
	}, [navigate])

	useEffect(() => {
		if (['woman', 'man', 'children'].includes(activeMenuItem)) {
			localStorage.setItem('activeMenuItem', activeMenuItem)
		}
	}, [activeMenuItem])

	const openModal = useCallback(() => setIsModalOpen(true), [])
	const closeModal = useCallback(e => {
		e.stopPropagation()
		setIsModalOpen(false)
	}, [])
	const toggleMenu = useCallback(() => setIsMenuOpen(!isMenuOpen), [isMenuOpen])
	const toggleDropdown = useCallback(e => {
		e.stopPropagation()
		setIsDropdownOpen(prev => !prev)
	}, [])

	const switchToRegister = useCallback(() => setIsLogin(false), [])
	const switchToLogin = useCallback(() => setIsLogin(true), [])
	const toggleSocials = useCallback(
		() => setShowSocials(!showSocials),
		[showSocials]
	)

	const handleGenderChange = useCallback(
		newGender => {
			setActiveMenuItem(newGender)
			navigate(`/${newGender}`)
		},
		[navigate]
	)

	const handleCategoryChange = useCallback(
		category => {
			setActiveMenuItem(category)
			navigate(`/${gender}/${category}`)
		},
		[navigate, gender]
	)

	const menuItems = [
		{ label: 'Женщинам', value: 'woman', isGender: true },
		{ label: 'Мужчинам', value: 'man', isGender: true },
		{ label: 'Детям', value: 'children', isGender: true },
	]

	return (
		<header className='mx-[15%] mt-[1%] flex justify-between items-center'>
			<div className='lg:hidden'>
				<button onClick={toggleMenu} aria-label='Открыть меню'>
					<svg
						className='w-6 h-6'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							d='M4 6h16M4 12h16m-7 6h7'
						></path>
					</svg>
				</button>
			</div>

			<div className='flex items-center flex-grow'>
				<div className='hidden lg:flex md:space-x-5 lg:space-x-6'>
					{menuItems.slice(0, 3).map((item, index) => (
						<button
							key={index}
							onClick={() =>
								item.isGender
									? handleGenderChange(item.value)
									: handleCategoryChange(item.value)
							}
							className={`text-[10px] sm:text-xs md:text-sm lg:text-base ${
								activeMenuItem === item.value ? 'text-red-500' : 'text-black'
							} ${
								item.label === 'Скидки' ? 'text-red-500' : ''
							} custom-underline`}
						>
							{item.label}
						</button>
					))}
				</div>

				<div className='flex justify-center flex-grow'>
					<Link to='/' target='_top'>
						<img
							src={headerLogo}
							alt='Logo'
							className='cursor-pointer h-6 md:h-10 w-auto'
						/>
					</Link>
				</div>
			</div>

			<div className='flex space-x-2 sm:space-x-3 md:space-x-5 lg:space-x-10 items-center'>
				{isAuthenticated ? (
					<div className='relative' ref={dropdownRef}>
						<button
							onClick={toggleDropdown}
							className='flex items-center focus:outline-none'
							aria-label='Меню пользователя'
							aria-expanded={isDropdownOpen}
						>
							<UserAvatar
								email={userData?.email}
								firstName={userData?.firstName}
							/>
						</button>
						{isDropdownOpen && (
							<div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200'>
								<Link
									to='/profile'
									className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors'
									onClick={() => setIsDropdownOpen(false)}
								>
									Профиль
								</Link>
								<Link
									to='/my-order'
									className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors'
									onClick={() => setIsDropdownOpen(false)}
								>
									Заказы
								</Link>
								<Link
									to='/brand'
									className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors'
									onClick={() => setIsDropdownOpen(false)}
								>
									Бренд
								</Link>
								<Link
									to='/courier'
									className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors'
									onClick={() => setIsDropdownOpen(false)}
								>
									Курьер
								</Link>
								{isAdmin && (
									<Link
										to='/admin'
										className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors'
										onClick={() => setIsDropdownOpen(false)}
									>
										Админ
									</Link>
								)}
								<div className='border-t border-gray-200 my-1'></div>
								<button
									onClick={e => {
										e.preventDefault()
										handleLogout()
									}}
									className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors'
								>
									Выйти
								</button>
							</div>
						)}
					</div>
				) : (
					<button
						className='text-[10px] sm:text-xs md:text-sm lg:text-base text-black bg-white py-0.5 sm:py-1.5 md:py-2 px-2 sm:px-4 md:px-6 border-[1px] md:border-2 border-black rounded-lg transition duration-300 ease-in-out transform hover:bg-black hover:text-white hover:border-white hover:shadow-lg'
						onClick={openModal}
						aria-label='Войти'
					>
						Войти
					</button>
				)}

				<div className='flex items-center transition-transform duration-300 ease-in-out hover:scale-110'>
					<Link to='/favorites' className='flex items-center'>
						<div className='relative mr-1'>
							<svg
								className='w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 fill-black'
								viewBox='0 0 24 24'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' />
							</svg>
							{wishlistItemsCount > 0 && (
								<span className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-[8px] sm:text-[10px] md:text-xs font-bold'>
									{wishlistItemsCount > 99 ? '99+' : wishlistItemsCount}
								</span>
							)}
						</div>
						<span className='text-[10px] sm:text-xs md:text-sm lg:text-base text-black custom-underline'>
							Избранное
						</span>
					</Link>
				</div>
				<div className='flex items-center transition-transform duration-300 ease-in-out hover:scale-110 relative'>
					<Link to='/cart' className='flex items-center'>
						<img
							src={headerBasket}
							className='h-6 sm:h-8 md:h-10 w-6 sm:w-8 md:w-10 cursor-pointer'
							alt='Basket'
						/>
						{cartItemsCount > 0 && (
							<span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center'>
								{cartItemsCount > 99 ? '99+' : cartItemsCount}
							</span>
						)}
						<span className='text-[10px] sm:text-xs md:text-sm lg:text-base text-black custom-underline ml-1'>
							Корзина
						</span>
					</Link>
				</div>
			</div>

			{isModalOpen && (
				<AuthModal
					isLogin={isLogin}
					closeModal={closeModal}
					switchToRegister={switchToRegister}
					switchToLogin={switchToLogin}
					showSocials={showSocials}
					toggleSocials={toggleSocials}
					onLoginSuccess={handleLoginSuccess}
				/>
			)}

			<MobileMenu
				isMenuOpen={isMenuOpen}
				toggleMenu={toggleMenu}
				menuItems={menuItems}
				handleGenderChange={handleGenderChange}
				handleCategoryChange={handleCategoryChange}
				activeMenuItem={activeMenuItem}
			/>
		</header>
	)
}

export default React.memo(Header)
