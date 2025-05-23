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
	Popconfirm,
} from 'antd'
import axios from 'axios'
import { format } from 'date-fns'
import Header from '../home/Header'
import AsideBanner from '../home/AsideBanner'
import Section from '../home/Section'
import Footer from '../home/Footer'

const API_BASE_URL = 'http://localhost:8080/api/v1/orders'
const STATIC_BASE_URL = 'http://localhost:8080/static/'

const MyOrderList = () => {
	const [orders, setOrders] = useState([])
	const [loading, setLoading] = useState(false)
	const [statusLoading, setStatusLoading] = useState(false) // Added missing state
	const [selectedOrder, setSelectedOrder] = useState(null)
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [hoverImageIndex, setHoverImageIndex] = useState({})
	const [hoveredProduct, setHoveredProduct] = useState(null)
	const userId = localStorage.getItem('userId')

	const statusOptions = [
		{ value: 'оформлен', label: 'Оформлен', color: 'blue' },
		{ value: 'в_пути', label: 'В пути', color: 'orange' },
		{ value: 'прибыл', label: 'Прибыл', color: 'purple' },
		{ value: 'завершено', label: 'Завершено', color: 'green' },
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

	const updateOrderStatus = async orderId => {
		setStatusLoading(true)
		try {
			await axios.put(
				`http://localhost:8080/api/v1/admin/order/${orderId}/status`,
				{
					status: 'отменён', // Hardcoded to 'отменён'
				}
			)
			message.success('Статус заказа успешно обновлен')
			fetchOrders()
			if (selectedOrder && selectedOrder.order.id === orderId) {
				setSelectedOrder({
					...selectedOrder,
					order: {
						...selectedOrder.order,
						status: 'отменён',
					},
				})
			}
		} catch (error) {
			message.error(
				error.response?.data?.error || 'Не удалось обновить статус заказа'
			)
		} finally {
			setStatusLoading(false)
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
		},
		{
			title: 'Сумма',
			dataIndex: 'total',
			key: 'total',
			render: total => `${total.toFixed(2)} BYN`,
		},
		{
			title: 'Статус',
			dataIndex: 'status',
			key: 'status',
			render: status => {
				const statusOption = statusOptions.find(s => s.value === status)
				return (
					<Tag color={statusOption?.color || 'default'}>
						{statusOption?.label || status}
					</Tag>
				)
			},
		},
		{
			title: 'Адрес',
			key: 'address',
			render: (_, record) => `${record.address}, ${record.city}`,
		},
		{
			title: 'Способ оплаты',
			dataIndex: 'payment_method',
			key: 'payment_method',
			render: method => formatPaymentMethod(method),
		},
		{
			title: 'Дата создания',
			dataIndex: 'created_at',
			key: 'created_at',
			render: created_at => formatDate(created_at),
		},
		{
			title: 'Действия',
			key: 'actions',
			render: (_, record) => (
				<div className='flex gap-2'>
					<Button onClick={() => fetchOrderDetails(record.id)}>
						Подробности
					</Button>
					{record.status !== 'отменён' && (
						<Popconfirm
							title='Вы уверены, что хотите отменить заказ?'
							onConfirm={() => {
								setSelectedOrder({ order: record })
								updateOrderStatus(record.id)
							}}
							okText='Да'
							cancelText='Нет'
						>
							<Button danger>Отменить</Button>
						</Popconfirm>
					)}
				</div>
			),
		},
	]

	return (
		<div>
			<AsideBanner />
			<Header />
			<Section />
			<div className='mx-[15%]'>
				<h1 className='text-3xl font-bold m-0'>Мои заказы</h1>
				<Spin spinning={loading}>
					<Tabs
						defaultActiveKey='all'
						items={[
							{
								key: 'all',
								label: 'Все',
								children: (
									<Table
										columns={columns}
										dataSource={orders}
										rowKey='id'
										className='[&_.ant-table]:bg-white [&_.ant-table-thead>tr>th]:bg-gray-100 [&_.ant-table-thead>tr>th]:text-gray-900 [&_.ant-table-tbody>tr>td]:text-gray-800 [&_.ant-table-tbody>tr:hover>td]:bg-gray-50 [&_.ant-table-thead>tr>th]:border-gray-200 [&_.ant-table-tbody>tr>td]:border-gray-200'
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
										className='[&_.ant-table]:bg-white [&_.ant-table-thead>tr>th]:bg-gray-100 [&_.ant-table-thead>tr>th]:text-gray-900 [&_.ant-table-tbody>tr>td]:text-gray-800 [&_.ant-table-tbody>tr:hover>td]:bg-gray-50 [&_.ant-table-thead>tr>th]:border-gray-200 [&_.ant-table-tbody>tr>td]:border-gray-200'
									/>
								),
							})),
						]}
					/>
				</Spin>

				<Modal
					title={<span className='text-xl font-bold'>Детали заказа</span>}
					open={isModalVisible}
					onCancel={() => setIsModalVisible(false)}
					footer={[
						<Button
							key='cancel'
							onClick={() => setIsModalVisible(false)}
							className='bg-gray-200 text-gray-900 hover:bg-gray-300 border-none'
						>
							Закрыть
						</Button>,
					]}
					styles={{ body: { background: 'white' } }}
					className='[&_.ant-modal-content]:bg-white [&_.ant-modal-header]:bg-white [&_.ant-modal-title]:text-gray-900 [&_.ant-modal-footer]:border-gray-200'
					width={800}
				>
					{selectedOrder && (
						<div className='space-y-6'>
							<div className='bg-gray-50 p-4 rounded-lg'>
								<h3 className='text-lg font-semibold mb-3'>
									Информация о заказе
								</h3>
								<Descriptions column={1} className='custom-descriptions'>
									<Descriptions.Item label='Номер заказа'>
										<span className='font-medium'>
											#{selectedOrder.order?.id}
										</span>
									</Descriptions.Item>
									<Descriptions.Item label='Сумма'>
										<span className='font-medium'>
											{selectedOrder.order?.total?.toFixed(2)} BYN
										</span>
									</Descriptions.Item>
									<Descriptions.Item label='Адрес'>
										{`${selectedOrder.order?.address || ''}, ${
											selectedOrder.order?.city || ''
										}`}
									</Descriptions.Item>
									<Descriptions.Item label='Способ оплаты'>
										{formatPaymentMethod(selectedOrder.order?.payment_method)}
									</Descriptions.Item>
									<Descriptions.Item label='Статус'>
										<Tag
											color={
												statusOptions.find(
													s => s.value === selectedOrder.order?.status
												)?.color || 'default'
											}
										>
											{statusOptions.find(
												s => s.value === selectedOrder.order?.status
											)?.label ||
												selectedOrder.order?.status ||
												'—'}
										</Tag>
									</Descriptions.Item>
									<Descriptions.Item label='Примечания'>
										{selectedOrder.order?.notes || '–'}
									</Descriptions.Item>
									<Descriptions.Item label='Дата создания'>
										{formatDate(selectedOrder.order_date)}
									</Descriptions.Item>
								</Descriptions>
							</div>

							<div className='bg-gray-50 p-4 rounded-lg'>
								<h3 className='text-lg font-semibold mb-3'>
									Информация о пользователе
								</h3>
								<Descriptions column={1} className='custom-descriptions'>
									<Descriptions.Item label='Имя'>
										{`${selectedOrder.user?.first_name || ''} ${
											selectedOrder.user?.last_name || ''
										}`}
									</Descriptions.Item>
									<Descriptions.Item label='Email'>
										{selectedOrder.user?.email || '–'}
									</Descriptions.Item>
									<Descriptions.Item label='Телефон'>
										{selectedOrder.user?.phone || '–'}
									</Descriptions.Item>
								</Descriptions>
							</div>

							<div>
								<h3 className='text-lg font-semibold mb-3'>Товары в заказе</h3>
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
												className='bg-gray-50 p-4 rounded-lg mb-3 border border-gray-200 flex justify-between hover:bg-gray-100 transition-colors'
												onMouseMove={e => handleMouseMove(e, item)}
												onMouseEnter={() => handleMouseEnter(item.product_id)}
												onMouseLeave={() => handleMouseLeave(item.product_id)}
											>
												<div className='flex items-center'>
													<div
														style={{
															position: 'relative',
															width: 80,
															height: 120,
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
													<div className='ml-4'>
														<p className='font-medium text-gray-900'>
															{item.product_name || '–'}
														</p>
														<p className='text-gray-600'>
															Размер: {item.size_value || '–'}
														</p>
														<p className='text-gray-600'>
															Количество: {item.quantity || 0}
														</p>
														<p className='text-gray-600'>
															Цена: {(item.price_at_purchase || 0).toFixed(2)}{' '}
															BYN
														</p>
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
