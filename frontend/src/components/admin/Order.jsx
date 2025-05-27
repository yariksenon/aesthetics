import React, { useState, useEffect } from 'react'
import {
	Table,
	Button,
	Modal,
	Descriptions,
	List,
	message,
	Spin,
	Tag,
	Select,
} from 'antd'
import axios from 'axios'
import moment from 'moment'
import 'moment/locale/ru'

const { Option } = Select

const API_BASE_URL = 'http://localhost:8080/api/v1/admin/order'

const Order = () => {
	const [orders, setOrders] = useState([])
	const [loading, setLoading] = useState(false)
	const [selectedOrder, setSelectedOrder] = useState(null)
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [statusLoading, setStatusLoading] = useState(false)
	const userId = localStorage.getItem('userId')

	const statusOptions = [
		{ value: 'ожидает', label: 'Ожидает', color: 'cyan' },
		{ value: 'оформлен', label: 'Оформлен', color: 'blue' },
		{ value: 'в_пути', label: 'В пути', color: 'orange' },
		{ value: 'прибыл', label: 'Прибыл', color: 'purple' },
		{ value: 'завершено', label: 'Завершено', color: 'green' },
		{ value: 'отменён', label: 'Отменён', color: 'red' },
	]

	// Загрузка заказов
	const fetchOrders = async () => {
		setLoading(true)
		try {
			const response = await axios.get(`${API_BASE_URL}`)
			setOrders(response.data.orders)
		} catch (error) {
			message.error('Не удалось загрузить заказы')
		} finally {
			setLoading(false)
		}
	}

	// Загрузка деталей заказа
	const fetchOrderDetails = async orderId => {
		if (!userId) {
			message.error('ID пользователя не найден в localStorage')
			return
		}
		setLoading(true)
		try {
			const response = await axios.get(`${API_BASE_URL}/${orderId}`)
			setSelectedOrder(response.data)
			setIsModalVisible(true)
		} catch (error) {
			message.error('Не удалось загрузить детали заказа')
		} finally {
			setLoading(false)
		}
	}

	// Отмена заказа
	const cancelOrder = async orderId => {
		if (!userId) {
			message.error('ID пользователя не найден в localStorage')
			return
		}
		setLoading(true)
		try {
			await axios.delete(`${API_BASE_URL}/${userId}/${orderId}`)
			message.success('Заказ успешно отменен')
			fetchOrders()
			setIsModalVisible(false)
		} catch (error) {
			message.error(error.response?.data?.error || 'Не удалось отменить заказ')
		} finally {
			setLoading(false)
		}
	}

	// Изменение статуса заказа
	const updateOrderStatus = async (orderId, newStatus) => {
		setStatusLoading(true)
		try {
			await axios.put(`${API_BASE_URL}/${orderId}/status`, {
				status: newStatus,
			})
			message.success('Статус заказа успешно обновлен')
			fetchOrders()
			// Обновляем статус в модальном окне, если оно открыто
			if (selectedOrder && selectedOrder.order.id === orderId) {
				setSelectedOrder({
					...selectedOrder,
					order: {
						...selectedOrder.order,
						status: newStatus,
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

	useEffect(() => {
		fetchOrders()
	}, [userId])

	const formatDate = dateString => {
		return moment(dateString).locale('ru').format('LLL')
	}

	const getPaymentMethod = method => {
		switch (method) {
			case 'cash':
				return 'Наличные'
			case 'card':
				return 'Карта'
			default:
				return method
		}
	}

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
			title: 'Способ оплаты',
			dataIndex: 'payment_provider',
			key: 'payment_provider',
			render: method => getPaymentMethod(method),
		},
		{
			title: 'Статус',
			dataIndex: 'status',
			key: 'status',
			render: (status, record) => (
				<Select
					value={status}
					style={{ width: 120 }}
					onChange={value => updateOrderStatus(record.id, value)}
					loading={statusLoading}
					disabled={status === 'отменён' || status === 'завершено'}
				>
					{statusOptions.map(option => (
						<Option key={option.value} value={option.value}>
							<Tag color={option.color}>{option.label}</Tag>
						</Option>
					))}
				</Select>
			),
		},
		{
			title: 'Дата создания',
			dataIndex: 'created_at',
			key: 'created_at',
			render: date => formatDate(date),
		},
		{
			title: 'Действия',
			key: 'actions',
			render: (_, record) => (
				<div className='flex gap-2'>
					<Button
						onClick={() => fetchOrderDetails(record.id)}
						className='bg-blue-600 text-white hover:bg-blue-500 border-none'
					>
						Подробнее
					</Button>
				</div>
			),
		},
	]

	return (
		<div className='p-6 bg-white min-h-screen text-gray-800'>
			<h1 className='text-2xl font-bold mb-6'>Управление заказами</h1>
			<Button
				onClick={() => window.history.back()}
				className='mb-4 bg-gray-200 text-gray-800 hover:bg-gray-300 border-none'
			>
				Назад
			</Button>
			<Spin spinning={loading}>
				<Table
					columns={columns}
					dataSource={orders}
					rowKey='id'
					className='[&_.ant-table]:bg-white [&_.ant-table-thead>tr>th]:bg-gray-100 [&_.ant-table-thead>tr>th]:text-gray-800 [&_.ant-table-tbody>tr>td]:text-gray-800 [&_.ant-table-tbody>tr:hover>td]:bg-gray-50 [&_.ant-table-thead>tr>th]:border-gray-200 [&_.ant-table-tbody>tr>td]:border-gray-200'
				/>
			</Spin>

			{/* Модальное окно с деталями заказа */}
			<Modal
				title='Детали заказа'
				open={isModalVisible}
				onCancel={() => setIsModalVisible(false)}
				footer={[
					<Button
						key='cancel'
						onClick={() => setIsModalVisible(false)}
						className='bg-gray-200 text-gray-800 hover:bg-gray-300 border-none'
					>
						Закрыть
					</Button>,
					selectedOrder?.order.status !== 'завершено' &&
						selectedOrder?.order.status !== 'отменён' && (
							<Button
								key='refund'
								onClick={() => cancelOrder(selectedOrder.order.id)}
								className='bg-red-600 text-white hover:bg-red-500 border-none'
								danger
							>
								Отменить заказ
							</Button>
						),
				]}
				className='[&_.ant-modal-content]:bg-white [&_.ant-modal-header]:bg-white [&_.ant-modal-title]:text-gray-800 [&_.ant-modal-footer]:border-gray-200'
				width={800}
			>
				{selectedOrder && (
					<div>
						<Descriptions
							title='Информация о заказе'
							column={1}
							className='[&_.ant-descriptions-item-label]:text-gray-800 [&_.ant-descriptions-item-content]:text-gray-800'
						>
							<Descriptions.Item label='Номер заказа'>
								{selectedOrder.order.id}
							</Descriptions.Item>
							<Descriptions.Item label='Сумма'>
								{selectedOrder.order.total.toFixed(2)} BYN
							</Descriptions.Item>
							<Descriptions.Item label='Статус'>
								<Select
									value={selectedOrder.order.status}
									style={{ width: 120 }}
									onChange={value =>
										updateOrderStatus(selectedOrder.order.id, value)
									}
									loading={statusLoading}
								>
									{statusOptions.map(option => (
										<Option key={option.value} value={option.value}>
											<Tag color={option.color}>{option.label}</Tag>
										</Option>
									))}
								</Select>
							</Descriptions.Item>
							<Descriptions.Item label='Дата создания'>
								{formatDate(selectedOrder.order_date)}
							</Descriptions.Item>
							<Descriptions.Item label='Способ оплаты'>
								{getPaymentMethod(selectedOrder.order.payment_provider)}
							</Descriptions.Item>
							<Descriptions.Item label='Адрес'>
								{selectedOrder.order.address}, {selectedOrder.order.city}
							</Descriptions.Item>
							<Descriptions.Item label='Примечания'>
								{selectedOrder.order.notes || 'Нет примечаний'}
							</Descriptions.Item>
						</Descriptions>

						<Descriptions
							title='Информация о пользователе'
							column={1}
							className='mt-4 [&_.ant-descriptions-item-label]:text-gray-800 [&_.ant-descriptions-item-content]:text-gray-800'
						>
							<Descriptions.Item label='Имя'>{`${selectedOrder.user.first_name} ${selectedOrder.user.last_name}`}</Descriptions.Item>
							<Descriptions.Item label='Email'>
								{selectedOrder.user.email}
							</Descriptions.Item>
							<Descriptions.Item label='Телефон'>
								{selectedOrder.user.phone}
							</Descriptions.Item>
						</Descriptions>

						<h3 className='text-lg font-semibold mt-6 mb-2 text-gray-800'>
							Товары
						</h3>
						<List
							dataSource={selectedOrder.items}
							renderItem={item => (
								<List.Item className='bg-gray-100 p-4 rounded mb-2 border-none'>
									<div className='text-gray-800'>
										<p>
											<strong>Товар:</strong> {item.product_name}
										</p>
										<p>
											<strong>Размер:</strong> {item.size_value}
										</p>
										<p>
											<strong>Количество:</strong> {item.quantity}
										</p>
										<p>
											<strong>Цена:</strong> {item.price_at_purchase.toFixed(2)}{' '}
											BYN
										</p>
									</div>
								</List.Item>
							)}
						/>
					</div>
				)}
			</Modal>
		</div>
	)
}

export default Order
