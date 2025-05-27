import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
	FaCheck,
	FaTimes,
	FaSearch,
	FaMapMarkerAlt,
	FaBoxOpen,
	FaTruck,
	FaCheckCircle,
	FaMoneyBillWave,
	FaInfoCircle,
} from 'react-icons/fa'
import { motion } from 'framer-motion'
import Swal from 'sweetalert2'

const CourierOrders = () => {
	const [orders, setOrders] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [statusFilter, setStatusFilter] = useState('all')
	const [selectedOrder, setSelectedOrder] = useState(null)
	const navigate = useNavigate()

	// Получение заказов для курьера
	useEffect(() => {
		const fetchOrders = async () => {
			try {
				setLoading(true)
				const response = await axios.get(
					'http://localhost:8080/api/v1/courier/available-orders'
				)
				if (response.data.success) {
					setOrders(response.data.orders || [])
				} else {
					setError('Не удалось загрузить заказы')
				}
			} catch (err) {
				setError(err.response?.data?.error || 'Ошибка при загрузке заказов')
			} finally {
				setLoading(false)
			}
		}
		fetchOrders()
	}, [])

	// Фильтрация заказов
	const filteredOrders = orders.filter(order => {
		const matchesSearch =
			order.id.toString().includes(searchTerm) ||
			(order.notes &&
				order.notes.toLowerCase().includes(searchTerm.toLowerCase()))
		const matchesStatus =
			statusFilter === 'all' || order.status === statusFilter
		return matchesSearch && matchesStatus
	})

	// Принять заказ
	const handleAcceptOrder = async orderId => {
		try {
			const response = await axios.put(
				`http://localhost:8080/api/v1/courier/accept/${orderId}`,
				{ courier_id: 1 } // Assuming courier_id is 1 for the logged-in courier
			)
			if (response.data.success) {
				setOrders(
					orders.map(order =>
						order.id === orderId
							? { ...order, status: 'в_пути', courier_id: 1 }
							: order
					)
				)
				Swal.fire('Успех!', 'Заказ принят в работу', 'success')
			} else {
				Swal.fire(
					'Ошибка!',
					response.data.error || 'Не удалось принять заказ',
					'error'
				)
			}
		} catch (err) {
			Swal.fire(
				'Ошибка!',
				err.response?.data?.error || 'Не удалось принять заказ',
				'error'
			)
		}
	}

	// Обновить статус заказа
	const handleUpdateStatus = async (orderId, status) => {
		console.log('Sending payload:', { status }) // Add this for debugging
		try {
			const response = await axios.put(
				`http://localhost:8080/api/v1/courier/orders/${orderId}/status`,
				{ status }
			)
			if (response.data.success) {
				setOrders(
					orders.map(order =>
						order.id === orderId ? { ...order, status } : order
					)
				)
				Swal.fire('Успех!', 'Статус заказа обновлен', 'success')
			} else {
				Swal.fire(
					'Ошибка!',
					response.data.error || 'Не удалось обновить статус',
					'error'
				)
			}
		} catch (err) {
			Swal.fire(
				'Ошибка!',
				err.response?.data?.error || 'Не удалось обновить статус',
				'error'
			)
		}
	}

	// Отменить заказ
	const handleCancelOrder = async orderId => {
		try {
			const result = await Swal.fire({
				title: 'Вы уверены?',
				text: 'Вы действительно хотите отменить этот заказ?',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#d33',
				cancelButtonColor: '#3085d6',
				confirmButtonText: 'Да, отменить!',
				cancelButtonText: 'Нет, оставить',
			})

			if (result.isConfirmed) {
				const response = await axios.put(
					`http://localhost:8080/api/v1/courier/orders/${orderId}/cancel`
				)

				if (response.data.success) {
					setOrders(
						orders.map(order =>
							order.id === orderId ? { ...order, status: 'отменён' } : order
						)
					)
					Swal.fire('Отменено!', 'Заказ был успешно отменен.', 'success')
				} else {
					Swal.fire(
						'Ошибка!',
						response.data.error || 'Не удалось отменить заказ',
						'error'
					)
				}
			}
		} catch (err) {
			Swal.fire(
				'Ошибка!',
				err.response?.data?.error || 'Не удалось отменить заказ',
				'error'
			)
		}
	}

	// Функция для отображения статуса
	const renderStatusBadge = status => {
		const statusConfig = {
			оформлен: {
				color: 'blue',
				text: 'Оформлен',
				icon: <FaInfoCircle className='mr-1' />,
			},
			ожидает: {
				color: 'orange',
				text: 'Ожидает курьера',
				icon: <FaInfoCircle className='mr-1' />,
			},
			в_пути: {
				color: 'purple',
				text: 'В пути',
				icon: <FaTruck className='mr-1' />,
			},
			прибыл: {
				color: 'geekblue',
				text: 'Прибыл',
				icon: <FaMapMarkerAlt className='mr-1' />,
			},
			завершено: {
				color: 'green',
				text: 'Завершено',
				icon: <FaCheckCircle className='mr-1' />,
			},
			завершено_частично: {
				color: 'gold',
				text: 'Завершено частично',
				icon: <FaCheckCircle className='mr-1' />,
			},
			отменён: {
				color: 'red',
				text: 'Отменён',
				icon: <FaTimes className='mr-1' />,
			},
		}

		const config = statusConfig[status] || {
			color: 'gray',
			text: status,
			icon: <FaInfoCircle className='mr-1' />,
		}

		return (
			<span
				className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}
			>
				{config.icon}
				{config.text}
			</span>
		)
	}

	// Функция для отображения способа оплаты
	const renderPaymentMethod = method => {
		const methodConfig = {
			cash: {
				color: 'green',
				text: 'Наличные',
				icon: <FaMoneyBillWave className='mr-1' />,
			},
			card: {
				color: 'blue',
				text: 'Карта',
				icon: <FaMoneyBillWave className='mr-1' />,
			},
			online: {
				color: 'purple',
				text: 'Онлайн',
				icon: <FaMoneyBillWave className='mr-1' />,
			},
		}

		const config = methodConfig[method] || {
			color: 'gray',
			text: method,
			icon: <FaMoneyBillWave className='mr-1' />,
		}

		return (
			<span
				className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}
			>
				{config.icon}
				{config.text}
			</span>
		)
	}

	if (loading) {
		return (
			<div className='flex justify-center items-center h-screen'>
				<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
			</div>
		)
	}

	return (
		<div className='container mx-auto p-4'>
			<h1 className='text-2xl font-bold mb-6 text-center'>Доступные заказы</h1>

			{error && (
				<div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
					{error}
				</div>
			)}

			{/* Фильтры и поиск */}
			<div className='bg-white p-4 rounded-lg shadow-md mb-6'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					<div className='relative'>
						<input
							type='text'
							placeholder='Поиск по ID или примечанию'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							className='w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
						/>
						<FaSearch className='absolute left-3 top-3 text-gray-400' />
					</div>

					<select
						value={statusFilter}
						onChange={e => setStatusFilter(e.target.value)}
						className='px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
					>
						<option value='all'>Все статусы</option>
						<option value='оформлен'>Оформлен</option>
						<option value='ожидает'>Ожидает курьера</option>
						<option value='в_пути'>В пути</option>
						<option value='прибыл'>Прибыл</option>
						<option value='завершено'>Завершено</option>
						<option value='завершено_частично'>Завершено частично</option>
						<option value='отменён'>Отменён</option>
					</select>
				</div>
			</div>

			{/* Список заказов */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
				{filteredOrders.map(order => (
					<motion.div
						key={order.id}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
						className={`border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
							order.status === 'завершено'
								? 'bg-green-50 border-green-200'
								: order.status === 'завершено_частично'
								? 'bg-yellow-50 border-yellow-200'
								: order.status === 'отменён'
								? 'bg-red-50 border-red-200'
								: 'bg-white border-gray-200'
						}`}
						onClick={() => setSelectedOrder(order)}
					>
						<div className='flex justify-between items-start mb-2'>
							<h3 className='font-bold text-lg'>Заказ #{order.id}</h3>
							{renderStatusBadge(order.status)}
						</div>

						<div className='mb-2'>
							<p className='text-gray-600'>
								<span className='font-semibold'>Сумма:</span> {order.total} BYN
							</p>
							<p className='text-gray-600'>
								<span className='font-semibold'>Оплата:</span>{' '}
								{renderPaymentMethod(order.payment_provider)}
							</p>
						</div>

						<div className='mb-3'>
							<div className='flex items-center text-gray-600 mb-1'>
								<FaMapMarkerAlt className='mr-2 text-red-500' />
								<span className='font-semibold'>Адрес:</span> {order.address},{' '}
								{order.city}
							</div>
							{order.notes && (
								<div className='flex items-center text-gray-600'>
									<FaInfoCircle className='mr-2 text-blue-500' />
									<span className='font-semibold'>Примечание:</span>{' '}
									{order.notes}
								</div>
							)}
						</div>

						<div className='flex flex-wrap gap-2 mt-3'>
							{order.status === 'ожидает' && (
								<button
									onClick={e => {
										e.stopPropagation()
										handleAcceptOrder(order.id)
									}}
									className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm flex items-center transition-colors'
								>
									<FaCheck className='mr-1' /> Принять заказ
								</button>
							)}

							{order.status === 'оформлен' && (
								<button
									onClick={e => {
										e.stopPropagation()
										handleUpdateStatus(order.id, 'в_пути')
									}}
									className='bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-lg text-sm flex items-center transition-colors'
								>
									<FaTruck className='mr-1' /> Взять в доставку
								</button>
							)}

							{order.status === 'в_пути' && (
								<>
									<button
										onClick={e => {
											e.stopPropagation()
											handleUpdateStatus(order.id, 'прибыл')
										}}
										className='bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm flex items-center transition-colors'
									>
										<FaCheckCircle className='mr-1' /> Отметить прибытие
									</button>
									<button
										onClick={e => {
											e.stopPropagation()
											handleCancelOrder(order.id)
										}}
										className='bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm flex items-center transition-colors'
									>
										<FaTimes className='mr-1' /> Отменить заказ
									</button>
								</>
							)}

							{order.status === 'прибыл' && (
								<>
									<button
										onClick={e => {
											e.stopPropagation()
											handleUpdateStatus(order.id, 'завершено')
										}}
										className='bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm flex items-center transition-colors'
									>
										<FaCheckCircle className='mr-1' /> Завершить доставку
									</button>
									<button
										onClick={e => {
											e.stopPropagation()
											handleUpdateStatus(order.id, 'завершено_частично')
										}}
										className='bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-lg text-sm flex items-center transition-colors'
									>
										<FaCheckCircle className='mr-1' /> Завершить частично
									</button>
									<button
										onClick={e => {
											e.stopPropagation()
											handleCancelOrder(order.id)
										}}
										className='bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm flex items-center transition-colors'
									>
										<FaTimes className='mr-1' /> Отменить заказ
									</button>
								</>
							)}
						</div>
					</motion.div>
				))}
			</div>

			{/* Модальное окно с деталями заказа */}
			{selectedOrder && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						className='bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'
					>
						<div className='flex justify-between items-start mb-4'>
							<h2 className='text-xl font-bold'>
								Детали заказа #{selectedOrder.id}
							</h2>
							<button
								onClick={() => setSelectedOrder(null)}
								className='text-gray-500 hover:text-gray-700'
							>
								<FaTimes />
							</button>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
							<div className='bg-gray-50 p-4 rounded-lg'>
								<h3 className='font-semibold mb-2'>Информация о заказе</h3>
								<div className='space-y-2'>
									<p>
										<span className='font-medium'>Статус:</span>{' '}
										{renderStatusBadge(selectedOrder.status)}
									</p>
									<p>
										<span className='font-medium'>Сумма:</span>{' '}
										{selectedOrder.total} BYN
									</p>
									<p>
										<span className='font-medium'>Оплата:</span>{' '}
										{renderPaymentMethod(selectedOrder.payment_provider)}
									</p>
									<p>
										<span className='font-medium'>Дата создания:</span>{' '}
										{new Date(selectedOrder.created_at).toLocaleString()}
									</p>
								</div>
							</div>

							<div className='bg-gray-50 p-4 rounded-lg'>
								<h3 className='font-semibold mb-2'>Адрес доставки</h3>
								<div className='flex items-start'>
									<FaMapMarkerAlt className='text-red-500 mt-1 mr-2' />
									<div>
										<p className='font-medium'>{selectedOrder.city}</p>
										<p>{selectedOrder.address}</p>
										{selectedOrder.notes && (
											<p className='mt-2'>
												<span className='font-medium'>Примечание:</span>{' '}
												{selectedOrder.notes}
											</p>
										)}
									</div>
								</div>
							</div>
						</div>

						<div className='mb-6'>
							<h3 className='font-semibold mb-2'>Действия</h3>
							<div className='flex flex-wrap gap-2'>
								{selectedOrder.status === 'ожидает' && (
									<button
										onClick={() => {
											handleAcceptOrder(selectedOrder.id)
											setSelectedOrder(null)
										}}
										className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors'
									>
										<FaCheck className='mr-2' /> Принять заказ
									</button>
								)}

								{selectedOrder.status === 'оформлен' && (
									<button
										onClick={() => {
											handleUpdateStatus(selectedOrder.id, 'в_пути')
											setSelectedOrder(null)
										}}
										className='bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors'
									>
										<FaTruck className='mr-2' /> Взять в доставку
									</button>
								)}

								{selectedOrder.status === 'в_пути' && (
									<>
										<button
											onClick={() => {
												handleUpdateStatus(selectedOrder.id, 'прибыл')
												setSelectedOrder(null)
											}}
											className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors'
										>
											<FaCheckCircle className='mr-2' /> Отметить прибытие
										</button>
										<button
											onClick={() => {
												handleCancelOrder(selectedOrder.id)
												setSelectedOrder(null)
											}}
											className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors'
										>
											<FaTimes className='mr-2' /> Отменить заказ
										</button>
									</>
								)}

								{selectedOrder.status === 'прибыл' && (
									<>
										<button
											onClick={() => {
												handleUpdateStatus(selectedOrder.id, 'завершено')
												setSelectedOrder(null)
											}}
											className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors'
										>
											<FaCheckCircle className='mr-2' /> Завершить доставку
										</button>
										<button
											onClick={() => {
												handleUpdateStatus(
													selectedOrder.id,
													'завершено_частично'
												)
												setSelectedOrder(null)
											}}
											className='bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors'
										>
											<FaCheckCircle className='mr-2' /> Завершить частично
										</button>
										<button
											onClick={() => {
												handleCancelOrder(selectedOrder.id)
												setSelectedOrder(null)
											}}
											className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors'
										>
											<FaTimes className='mr-2' /> Отменить заказ
										</button>
									</>
								)}

								<button
									onClick={() => setSelectedOrder(null)}
									className='bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors'
								>
									Закрыть
								</button>
							</div>
						</div>
					</motion.div>
				</div>
			)}

			{filteredOrders.length === 0 && !loading && (
				<div className='text-center py-10'>
					<p className='text-gray-500 text-lg'>
						Нет доступных заказов по выбранным критериям
					</p>
				</div>
			)}
		</div>
	)
}

export default CourierOrders
