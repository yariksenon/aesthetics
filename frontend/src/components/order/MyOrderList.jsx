import React, { useState, useEffect } from 'react'
import {
	Table,
	Button,
	Modal,
	Descriptions,
	List,
	message,
	Spin,
	Image,
	Tag,
	Typography,
	Card,
} from 'antd'
import {
	DollarOutlined,
	ShoppingOutlined,
	CalculatorOutlined,
} from '@ant-design/icons'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import Header from '../home/Header'
import AsideBanner from '../home/AsideBanner'
import Section from '../home/Section'
import Footer from '../home/Footer'

const { Title, Text } = Typography
const API_BASE_URL = 'http://localhost:8080/api/v1/orders'
const STATIC_BASE_URL = 'http://localhost:8080/static/'

const MyOrderList = () => {
	const [orders, setOrders] = useState([])
	const [loading, setLoading] = useState(false)
	const [selectedOrder, setSelectedOrder] = useState(null)
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [hoverImageIndex, setHoverImageIndex] = useState({})
	const [hoveredProduct, setHoveredProduct] = useState(null)
	const userId = localStorage.getItem('userId')
	const navigate = useNavigate()

	const fetchOrders = async () => {
		if (!userId)
			return message.error('Пожалуйста, войдите для просмотра заказов')
		setLoading(true)
		try {
			const response = await axios.get(`${API_BASE_URL}/${userId}`)
			setOrders(
				response.data.orders?.sort(
					(a, b) => new Date(b.created_at) - new Date(a.created_at)
				) || []
			)
		} catch {
			message.error('Не удалось загрузить заказы')
		} finally {
			setLoading(false)
		}
	}

	const fetchOrderDetails = async orderId => {
		if (!userId)
			return message.error('Пожалуйста, войдите для просмотра деталей заказа')
		setLoading(true)
		try {
			const response = await axios.get(`${API_BASE_URL}/${userId}/${orderId}`)
			setSelectedOrder(response.data)
			setIsModalVisible(true)
		} catch (error) {
			message.error(
				error.response?.status === 404
					? 'Заказ не найден'
					: 'Не удалось загрузить детали заказа'
			)
			if (error.response?.status === 404) {
				await fetchOrders()
				setIsModalVisible(false)
			}
		} finally {
			setLoading(false)
		}
	}

	const handleMouseMove = (e, item) => {
		if (!item.image_paths?.length) return
		const rect = e.currentTarget.getBoundingClientRect()
		const mouseX = e.clientX - rect.left
		const sectionWidth = rect.width / item.image_paths.length
		const sectionIndex = Math.min(
			Math.floor(mouseX / sectionWidth),
			item.image_paths.length - 1
		)
		setHoverImageIndex(prev => ({ ...prev, [item.product_id]: sectionIndex }))
	}

	const handleMouseEnter = productId => setHoveredProduct(productId)
	const handleMouseLeave = productId => {
		setHoveredProduct(null)
		setHoverImageIndex(prev => ({ ...prev, [productId]: 0 }))
	}

	const formatPaymentMethod = method => {
		const methods = {
			cash: <Tag color='green'>Наличные</Tag>,
			card: <Tag color='blue'>Карта</Tag>,
			online: <Tag color='orange'>Онлайн</Tag>,
		}
		return methods[method] || <Tag>Не указан</Tag>
	}

	const formatDate = date => {
		try {
			return format(new Date(date), 'dd.MM.yyyy HH:mm')
		} catch {
			return date || '–'
		}
	}

	const getStatistics = () => {
		const completedOrders = orders.filter(order =>
			['завершено', 'завершено_частично'].includes(order.status)
		)
		const totalSpent = completedOrders.reduce(
			(sum, order) => sum + order.total,
			0
		)
		const totalOrders = orders.length
		const averageOrderValue = completedOrders.length
			? (totalSpent / completedOrders.length).toFixed(2)
			: 0
		return { totalSpent, totalOrders, averageOrderValue }
	}

	useEffect(() => {
		fetchOrders()
	}, [userId])

	const columns = [
		{
			title: 'Номер заказа',
			dataIndex: 'id',
			key: 'id',
			render: id => <Text strong>#{id}</Text>,
		},
		{
			title: 'Сумма',
			dataIndex: 'total',
			key: 'total',
			render: total => <Text strong>{total.toFixed(2)} BYN</Text>,
		},
		{
			title: 'Статус',
			dataIndex: 'status',
			key: 'status',
			render: status => (
				<Tag
					color={
						{
							ожидает: 'cyan',
							оформлен: 'blue',
							в_пути: 'orange',
							прибыл: 'purple',
							завершено: 'green',
							завершено_частично: 'gold',
							отменён: 'red',
						}[status] || 'default'
					}
				>
					{status}
				</Tag>
			),
		},
		{
			title: 'Дата создания',
			dataIndex: 'created_at',
			key: 'created_at',
			render: created_at => (
				<Text type='secondary'>{formatDate(created_at)}</Text>
			),
		},
		{
			title: 'Действия',
			key: 'actions',
			render: (_, record) => (
				<Button
					className='bg-gray-100 hover:bg-gray-200'
					onClick={() => fetchOrderDetails(record.id)}
				>
					Подробнее
				</Button>
			),
		},
	]

	return (
		<div>
			<AsideBanner />
			<Header />
			<Section />
			<div className='max-w-7xl mx-[15%] py-8'>
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className='mb-8'
				>
					<h1 className='text-3xl font-bold'>Мои заказы</h1>
				</motion.div>
				<Spin spinning={loading}>
					{orders.length === 0 ? (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5 }}
							className='text-center py-12'
						>
							<div className='max-w-md mx-auto'>
								<motion.div
									animate={{ y: [-5, 5, -5] }}
									transition={{ repeat: Infinity, duration: 3 }}
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-24 w-24 mx-auto text-gray-400 mb-6'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={1.5}
											d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
										/>
									</svg>
								</motion.div>
								<h2 className='text-2xl font-medium text-gray-700 mb-3'>
									У вас пока нет заказов
								</h2>
								<p className='text-gray-500 mb-8'>
									Сделайте свой первый заказ и он появится здесь!
								</p>
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									onClick={() => navigate('/cart')}
									className='bg-black text-white px-8 py-3 rounded-lg text-lg font-medium shadow-md hover:bg-gray-700 transition-colors'
								>
									Перейти в корзину
								</motion.button>
							</div>
						</motion.div>
					) : (
						<>
							<Card
								title={
									<span className='text-lg font-semibold text-gray-800'>
										Статистика заказов
									</span>
								}
								className='mb-6 shadow-md rounded-lg bg-white'
								headStyle={{
									background: 'linear-gradient(to right, #e6f3ff, #f0f8ff)',
								}}
							>
								<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
									<div className='flex items-center p-4 bg-gray-50 rounded-lg'>
										<ShoppingOutlined className='text-3xl text-blue-500 mr-4' />
										<div>
											<Text className='text-gray-600'>Всего заказов</Text>
											<Text strong className='block text-lg'>
												{getStatistics().totalOrders}
											</Text>
										</div>
									</div>
									<div className='flex items-center p-4 bg-gray-50 rounded-lg'>
										<DollarOutlined className='text-3xl text-green-500 mr-4' />
										<div>
											<Text className='text-gray-600'>
												Потрачено (завершённые)
											</Text>
											<Text strong className='block text-lg'>
												{getStatistics().totalSpent.toFixed(2)} BYN
											</Text>
										</div>
									</div>
									<div className='flex items-center p-4 bg-gray-50 rounded-lg'>
										<CalculatorOutlined className='text-3xl text-purple-500 mr-4' />
										<div>
											<Text className='text-gray-600'>
												Средняя стоимость заказа
											</Text>
											<Text strong className='block text-lg'>
												{getStatistics().averageOrderValue} BYN
											</Text>
										</div>
									</div>
								</div>
							</Card>
							<Table
								columns={columns}
								dataSource={orders}
								rowKey='id'
								pagination={{ pageSize: 10 }}
								className='shadow-md rounded-lg'
								rowClassName='hover:bg-gray-50'
							/>
						</>
					)}
				</Spin>
				<Modal
					title={
						<span className='text-xl font-bold text-gray-800'>
							Детали заказа #{selectedOrder?.order?.id}
						</span>
					}
					open={isModalVisible}
					onCancel={() => setIsModalVisible(false)}
					footer={null}
					width={800}
					className='rounded-lg'
				>
					{selectedOrder && (
						<div className='p-6 space-y-6'>
							<div>
								<Title level={4} className='text-gray-800'>
									Информация о заказе
								</Title>
								<Descriptions column={1} className='bg-gray-50 p-4 rounded-lg'>
									<Descriptions.Item label='Статус'>
										<Tag
											color={
												{
													ожидает: 'cyan',
													оформлен: 'blue',
													в_пути: 'orange',
													прибыл: 'purple',
													завершено: 'green',
													завершено_частично: 'gold',
													отменён: 'red',
												}[selectedOrder.order?.status] || 'default'
											}
										>
											{selectedOrder.order?.status || '—'}
										</Tag>
									</Descriptions.Item>
									<Descriptions.Item label='Сумма'>
										<Text strong>
											{selectedOrder.order?.total?.toFixed(2)} BYN
										</Text>
									</Descriptions.Item>
									<Descriptions.Item label='Способ оплаты'>
										{formatPaymentMethod(selectedOrder.order?.payment_method)}
									</Descriptions.Item>
									<Descriptions.Item label='Адрес доставки'>{`${
										selectedOrder.order?.address || ''
									}, ${selectedOrder.order?.city || ''}`}</Descriptions.Item>
									<Descriptions.Item label='Дата создания'>
										{formatDate(selectedOrder.order_date)}
									</Descriptions.Item>
									{selectedOrder.order?.notes && (
										<Descriptions.Item label='Примечания'>
											{selectedOrder.order?.notes}
										</Descriptions.Item>
									)}
								</Descriptions>
							</div>
							<div>
								<Title level={4} className='text-gray-800'>
									Товары в заказе
								</Title>
								<List
									dataSource={selectedOrder.items || []}
									renderItem={item => {
										const currentImageIndex =
											hoverImageIndex[item.product_id] || 0
										const currentImage =
											item.image_paths?.[currentImageIndex] ||
											item.photo_url ||
											'https://placehold.co/80x120'
										return (
											<List.Item
												onMouseMove={e => handleMouseMove(e, item)}
												onMouseEnter={() => handleMouseEnter(item.product_id)}
												onMouseLeave={() => handleMouseLeave(item.product_id)}
												className='hover:bg-gray-50 rounded-lg'
											>
												<div className='flex items-start w-full'>
													<div
														style={{
															position: 'relative',
															width: 80,
															height: 100,
															flexShrink: 0,
															marginRight: 16,
														}}
													>
														{hoveredProduct === item.product_id &&
															item.image_paths?.length > 1 && (
																<div
																	style={{
																		position: 'absolute',
																		top: 4,
																		left: '50%',
																		transform: 'translateX(-50%)',
																		display: 'flex',
																		gap: 2,
																	}}
																>
																	{item.image_paths.map((_, index) => (
																		<div
																			key={index}
																			style={{
																				width: 20,
																				height: 3,
																				backgroundColor:
																					index === currentImageIndex
																						? '#000'
																						: '#ccc',
																			}}
																		/>
																	))}
																</div>
															)}
														<Image
															src={`${STATIC_BASE_URL}${currentImage}`}
															alt={item.product_name || 'Товар'}
															preview={false}
															style={{
																width: '100%',
																height: '100%',
																objectFit: 'contain',
															}}
															onError={e =>
																(e.currentTarget.src =
																	'https://placehold.co/80x120')
															}
														/>
													</div>
													<div className='flex-1'>
														<Text strong className='block mb-1'>
															{item.product_name || '–'}
														</Text>
														<Text type='secondary' className='block mb-1'>
															Размер: {item.size_value || '–'}
														</Text>
														<Text type='secondary' className='block mb-1'>
															Количество: {item.quantity || 0}
														</Text>
														<Text type='secondary' className='block'>
															Цена: {(item.price_at_purchase || 0).toFixed(2)}{' '}
															BYN
														</Text>
													</div>
													<div className='text-right'>
														<Text strong>
															{(item.price_at_purchase * item.quantity).toFixed(
																2
															)}{' '}
															BYN
														</Text>
													</div>
												</div>
											</List.Item>
										)
									}}
								/>
							</div>
						</div>
					)}
				</Modal>
			</div>
			<Footer />
		</div>
	)
}

export default MyOrderList
