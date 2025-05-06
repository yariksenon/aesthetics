import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { Spin, message } from 'antd'

const ShoppingCart = () => {
	const {
		cart,
		cartTotal,
		loading,
		notification,
		removeFromCart,
		updateQuantity,
		clearCart,
	} = useCart()
	const navigate = useNavigate()

	// Показываем уведомления
	useEffect(() => {
		if (notification) {
			message.info(notification)
		}
	}, [notification])

	if (loading) {
		return (
			<div className='flex justify-center items-center min-h-screen'>
				<Spin size='large' />
			</div>
		)
	}

	return (
		<div className='container mx-auto px-4 py-8 bg-white text-black min-h-screen'>
			<h1 className='text-3xl font-bold mb-8 border-b border-gray-300 pb-2'>
				Корзина
			</h1>

			{!cart || cart.length === 0 ? (
				<div className='text-center'>
					<p className='text-gray-500 text-xl mb-4'>Ваша корзина пуста</p>
					<button
						onClick={() => navigate('/')}
						className='bg-black text-white px-6 py-2 rounded hover:bg-gray-800'
					>
						Вернуться к покупкам
					</button>
				</div>
			) : (
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					<div className='lg:col-span-2'>
						<div className='bg-white rounded-lg shadow-lg p-6 border border-gray-300'>
							{cart.map(item => (
								<div
									key={item.id}
									className='p-4 border-b border-gray-300 flex flex-col sm:flex-row'
								>
									<div className='w-full sm:w-32 h-32 flex-shrink-0 mb-4 sm:mb-0'>
										<img
											src={
												item.image_path
													? `http://localhost:8080/static/${item.image_path}`
													: 'https://placehold.co/200'
											}
											alt={item.name}
											className='w-full h-full object-contain'
											onError={e => {
												e.target.src = 'https://placehold.co/200'
											}}
										/>
									</div>
									<div className='flex-1 sm:ml-4'>
										<h2 className='text-lg font-semibold'>{item.name}</h2>
										<p className='text-gray-600'>Br {item.price.toFixed(2)}</p>

										<div className='mt-3 flex items-center'>
											<button
												onClick={() =>
													updateQuantity(item.id, item.quantity - 1)
												}
												className='bg-gray-200 text-black px-3 py-1 rounded-l hover:bg-gray-100'
												disabled={item.quantity <= 1}
											>
												-
											</button>
											<span className='bg-gray-100 px-4 py-1'>
												{item.quantity}
											</span>
											<button
												onClick={() =>
													updateQuantity(item.id, item.quantity + 1)
												}
												className='bg-gray-200 text-black px-3 py-1 rounded-r hover:bg-gray-100'
											>
												+
											</button>
										</div>

										<button
											onClick={() => removeFromCart(item.id)}
											className='mt-3 text-red-500 hover:text-red-700 text-sm'
										>
											Удалить
										</button>
									</div>
									<div className='mt-2 sm:mt-0 sm:ml-4 text-right'>
										<p className='text-lg font-semibold'>
											Br {(item.price * item.quantity).toFixed(2)}
										</p>
									</div>
								</div>
							))}

							<button
								onClick={clearCart}
								className='mt-4 text-red-500 hover:text-red-700 text-sm'
							>
								Очистить корзину
							</button>
						</div>
					</div>

					<div className='lg:col-span-1'>
						<div className='bg-white rounded-lg shadow-lg p-6 border border-gray-300'>
							<h2 className='text-xl font-bold mb-4 border-b border-gray-300 pb-2'>
								Итого
							</h2>
							<div className='space-y-3 text-gray-600'>
								{cart.map(item => (
									<div key={item.id} className='flex justify-between'>
										<span>
											{item.name} × {item.quantity}
										</span>
										<span>Br {(item.price * item.quantity).toFixed(2)}</span>
									</div>
								))}
							</div>
							<div className='border-t mt-4 pt-4 flex justify-between font-bold text-lg'>
								<span>Всего:</span>
								<span>Br {cartTotal.toFixed(2)}</span>
							</div>
							<button
								onClick={() => navigate('/checkout')}
								className='w-full mt-6 bg-black text-white py-3 px-4 rounded hover:bg-gray-800'
							>
								Оформить заказ
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default ShoppingCart
