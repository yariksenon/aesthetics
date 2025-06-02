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
	Tabs,
	Divider,
	Typography,
	Card,
} from 'antd'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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

	const statusOptions = [
		{ value: 'ожидает', label: 'Ожидает', color: 'cyan' },
		{ value: 'оформлен', label: 'Оформлен', color: 'blue' },
		{ value: 'в_пути', label: 'В пути', color: 'orange' },
		{ value: 'прибыл', label: 'Прибыл', color: 'purple' },
		{ value: 'завершено', label: 'Завершено', color: 'green' },
		{ value: 'завершено_частично', label: 'Завершено частично', color: 'gold' },
		{ value: 'отменён', label: 'Отменён', color: 'red' },
	]

	const fetchOrders = async () => {
		if (!userId) {
			message.error('Пожалуйста, войдите для просмотра заказов')
			return
		}
		setLoading(true)
		try {
			const response = await axios.get(`${API_BASE_URL}/${userId}`)
			setOrders(response.data.orders || [])
		} catch (error) {
			message.error('Не удалось загрузить заказы')
		} finally {
			setLoading(false)
		}
	}

	const fetchOrderDetails = async orderId => {
		if (!userId) {
			message.error('Пожалуйста, войдите для просмотра деталей заказа')
			return
		}
		setLoading(true)
		try {
			const response = await axios.get(`${API_BASE_URL}/${userId}/${orderId}`)
			setSelectedOrder(response.data)
			setIsModalVisible(true)
		} catch (error) {
			if (error.response?.status === 404) {
				message.error('Заказ не найден')
				await fetchOrders()
				setIsModalVisible(false)
			} else {
				message.error('Не удалось загрузить детали заказа')
			}
		} finally {
			setLoading(false)
		}
	}

	const handleMouseMove = (e, item) => {
		if (!item.image_paths?.length) return
		const container = e.currentTarget
		const rect = container.getBoundingClientRect()
		const mouseX = e.clientX - rect.left
		const sectionWidth = rect.width / item.image_paths.length
		const sectionIndex = Math.floor(mouseX / sectionWidth)
		const imageCount = item.image_paths.length
		const effectiveIndex = Math.min(sectionIndex, imageCount - 1)
		setHoverImageIndex(prev => ({
			...prev,
			[item.product_id]: effectiveIndex,
		}))
	}

	const handleMouseEnter = productId => {
		setHoveredProduct(productId)
	}

	const handleMouseLeave = productId => {
		setHoveredProduct(null)
		setHoverImageIndex(prev => ({
			...prev,
			[productId]: 0,
		}))
	}

	const formatPaymentMethod = method => {
		switch (method) {
			case 'cash':
				return <Tag color='green'>Наличные</Tag>
			case 'card':
				return <Tag color='blue'>Карта</Tag>
			case 'online':
				return <Tag color='orange'>Онлайн</Tag>
			default:
				return <Tag>Не указан</Tag>
		}
	}

	const formatDate = date => {
		try {
			return format(new Date(date), 'dd.MM.yyyy HH:mm')
		} catch {
			return date || '–'
		}
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
			render: status => {
				const statusOption = statusOptions.find(s => s.value === status)
				return (
					<Tag
						color={statusOption?.color || 'default'}
						style={{
							fontWeight: 500,
							borderRadius: 4,
							padding: '4px 8px',
						}}
					>
						{statusOption?.label || status}
					</Tag>
				)
			},
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
					onClick={() => fetchOrderDetails(record.id)}
					style={{
						background: '#f0f0f0',
						border: 'none',
						borderRadius: 4,
						fontWeight: 500,
					}}
				>
					Подробнее
				</Button>
			),
		},
	]

	return (
		<div className='bg-gray-50 min-h-screen'>
			<AsideBanner />
			<Header />
			<Section />
			<div className='mx-[15%] py-8'>
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className='mb-8'
				>
					<h1 className='text-3xl font-bold m-0'>Заказы</h1>
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
									Сделайте свой первый заказ и он появится здесь. Мы сохраняем
									историю всех ваших покупок!
								</p>
								<motion.button
									whileHover={{ scale: 1.03, backgroundColor: '#1a1a1a' }}
									whileTap={{ scale: 0.98 }}
									onClick={() => navigate('/cart')}
									className='bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors text-lg font-medium shadow-md'
								>
									Перейти в корзину
								</motion.button>
							</div>
						</motion.div>
					) : (
						<Tabs
							defaultActiveKey='all'
							items={[
								{
									key: 'all',
									label: 'Все заказы',
									children: (
										<Table
											columns={columns}
											dataSource={orders}
											rowKey='id'
											pagination={{ pageSize: 10 }}
											style={{ borderTop: '1px solid #f0f0f0' }}
											className='custom-orders-table'
										/>
									),
								},
								...statusOptions.map(status => ({
									key: status.value,
									label: status.label,
									children: (
										<Table
											columns={columns}
											dataSource={orders.filter(
												order => order.status === status.value
											)}
											rowKey='id'
											pagination={{ pageSize: 10 }}
											style={{ borderTop: '1px solid #f0f0f0' }}
											className='custom-orders-table'
										/>
									),
								})),
							]}
						/>
					)}
				</Spin>

				<Modal
					title={
						<span className='text-xl font-bold'>
							Детали заказа #{selectedOrder?.order?.id}
						</span>
					}
					open={isModalVisible}
					onCancel={() => setIsModalVisible(false)}
					footer={null}
					width={800}
					style={{ top: 20 }}
					bodyStyle={{ padding: 0 }}
				>
					{selectedOrder && (
						<div className='space-y-6'>
							<div className='p-6'>
								<div className='mb-6'>
									<Title level={4} style={{ marginBottom: 16 }}>
										Информация о заказе
									</Title>
									<Descriptions column={1} className='order-details'>
										<Descriptions.Item label='Статус'>
											<Tag
												color={
													statusOptions.find(
														s => s.value === selectedOrder.order?.status
													)?.color || 'default'
												}
												style={{
													fontWeight: 500,
													borderRadius: 4,
													padding: '4px 8px',
												}}
											>
												{statusOptions.find(
													s => s.value === selectedOrder.order?.status
												)?.label ||
													selectedOrder.order?.status ||
													'—'}
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
										<Descriptions.Item label='Адрес доставки'>
											{`${selectedOrder.order?.address || ''}, ${
												selectedOrder.order?.city || ''
											}`}
										</Descriptions.Item>
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

								<Divider />

								<div className='mb-6'>
									<Title level={4} style={{ marginBottom: 16 }}>
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
													className='order-item'
													onMouseMove={e => handleMouseMove(e, item)}
													onMouseEnter={() => handleMouseEnter(item.product_id)}
													onMouseLeave={() => handleMouseLeave(item.product_id)}
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
																			zIndex: 10,
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
																	transition: 'opacity 0.3s ease',
																}}
																onError={e => {
																	e.currentTarget.src =
																		'https://placehold.co/80x120'
																	e.currentTarget.style = {
																		objectFit: 'contain',
																		padding: '8px',
																		backgroundColor: '#f5f5f5',
																	}
																}}
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
																{(
																	item.price_at_purchase * item.quantity
																).toFixed(2)}{' '}
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
						</div>
					)}
				</Modal>
			</div>
			<Footer />
		</div>
	)
}

export default MyOrderList
