import React, { useState, useEffect } from 'react'
import {
	Table,
	Button,
	Modal,
	Descriptions,
	List,
	message,
	Spin,
	Steps,
	Card,
} from 'antd'
import axios from 'axios'

const { Step } = Steps

const API_BASE_URL = 'http://localhost:8080/api/v1/admin/order'

const Order = () => {
	const [orders, setOrders] = useState([])
	const [loading, setLoading] = useState(false)
	const [selectedOrder, setSelectedOrder] = useState(null)
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false)
	const [paymentStep, setPaymentStep] = useState(0)
	const userId = localStorage.getItem('userId')

	// Загрузка заказов
	const fetchOrders = async () => {
		if (!userId) {
			message.error('ID пользователя не найден в localStorage')
			return
		}
		setLoading(true)
		try {
			const response = await axios.get(`${API_BASE_URL}/${userId}`)
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
			const response = await axios.get(`${API_BASE_URL}/${userId}/${orderId}`)
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

	// Инициировать оплату
	const initiatePayment = async orderId => {
		setIsPaymentModalVisible(true)
		setPaymentStep(1)

		// Имитация процесса оплаты
		setTimeout(() => {
			setPaymentStep(2)
			// Имитация успешной оплаты через 2 секунды
			setTimeout(() => {
				completePayment(orderId)
			}, 2000)
		}, 2000)
	}

	// Завершение оплаты (обновление статуса)
	const completePayment = async orderId => {
		try {
			const response = await axios.post(
				`${API_BASE_URL}/${userId}/${orderId}/pay`,
				{
					payment_status: 'completed',
					payment_method: 'card',
				}
			)
			message.success('Оплата прошла успешно!')
			setPaymentStep(3)
			fetchOrders()
			setTimeout(() => {
				setIsPaymentModalVisible(false)
				setIsModalVisible(false)
			}, 1500)
		} catch (error) {
			message.error('Ошибка при обновлении статуса оплаты')
			setPaymentStep(0)
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
			render: total => `$${total.toFixed(2)}`,
		},
		{
			title: 'Статус',
			dataIndex: 'payment_status',
			key: 'payment_status',
			render: status => {
				let statusText = status
				let color = 'default'
				switch (status) {
					case 'pending':
						statusText = 'Ожидает оплаты'
						color = 'orange'
						break
					case 'completed':
						statusText = 'Оплачен'
						color = 'green'
						break
					case 'refunded':
						statusText = 'Возврат'
						color = 'red'
						break
					case 'failed':
						statusText = 'Ошибка оплаты'
						color = 'red'
						break
				}
				return <span style={{ color }}>{statusText}</span>
			},
		},
		{
			title: 'Дата создания',
			dataIndex: 'created_at',
			key: 'created_at',
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
					{record.payment_status === 'pending' && (
						<Button
							onClick={() => initiatePayment(record.id)}
							className='bg-green-600 text-white hover:bg-green-500 border-none'
						>
							Оплатить
						</Button>
					)}
				</div>
			),
		},
	]

	return (
		<div className='p-6 bg-white min-h-screen text-gray-800'>
			<h1 className='text-2xl font-bold mb-6'>Заказы</h1>
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
					selectedOrder?.order.payment_status === 'pending' && (
						<Button
							key='pay'
							onClick={() => initiatePayment(selectedOrder.order.id)}
							className='bg-green-600 text-white hover:bg-green-500 border-none'
						>
							Оплатить заказ
						</Button>
					),
					selectedOrder?.order.payment_status !== 'completed' &&
						selectedOrder?.order.payment_status !== 'refunded' && (
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
								${selectedOrder.order.total.toFixed(2)}
							</Descriptions.Item>
							<Descriptions.Item label='Статус'>
								{selectedOrder.order.payment_status === 'pending'
									? 'Ожидает оплаты'
									: selectedOrder.order.payment_status === 'completed'
									? 'Оплачен'
									: selectedOrder.order.payment_status === 'refunded'
									? 'Возврат'
									: selectedOrder.order.payment_status}
							</Descriptions.Item>
							<Descriptions.Item label='Дата создания'>
								{selectedOrder.order_date}
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
											<strong>Цена:</strong> $
											{item.price_at_purchase.toFixed(2)}
										</p>
									</div>
								</List.Item>
							)}
						/>
					</div>
				)}
			</Modal>

			{/* Модальное окно оплаты */}
			<Modal
				title='Оплата заказа'
				open={isPaymentModalVisible}
				onCancel={() => setIsPaymentModalVisible(false)}
				footer={null}
				closable={paymentStep !== 2}
				width={600}
			>
				<Steps current={paymentStep} className='mb-8'>
					<Step title='Подготовка' />
					<Step title='Оплата' />
					<Step title='Завершение' />
				</Steps>

				{paymentStep === 0 && (
					<Card>
						<p>Подготовка к оплате...</p>
					</Card>
				)}

				{paymentStep === 1 && (
					<Card title='Введите данные карты'>
						<div className='space-y-4'>
							<div>
								<label className='block mb-1'>Номер карты</label>
								<input
									type='text'
									placeholder='1234 5678 9012 3456'
									className='w-full p-2 border rounded'
								/>
							</div>
							<div className='flex gap-4'>
								<div className='flex-1'>
									<label className='block mb-1'>Срок действия</label>
									<input
										type='text'
										placeholder='MM/YY'
										className='w-full p-2 border rounded'
									/>
								</div>
								<div className='flex-1'>
									<label className='block mb-1'>CVV</label>
									<input
										type='text'
										placeholder='123'
										className='w-full p-2 border rounded'
									/>
								</div>
							</div>
						</div>
					</Card>
				)}

				{paymentStep === 2 && (
					<Card>
						<div className='text-center py-8'>
							<Spin size='large' />
							<p className='mt-4'>Идет обработка платежа...</p>
						</div>
					</Card>
				)}

				{paymentStep === 3 && (
					<Card className='text-center'>
						<div className='text-green-500 text-5xl mb-4'>✓</div>
						<h3 className='text-xl font-bold mb-2'>Оплата прошла успешно!</h3>
						<p>Ваш заказ # {selectedOrder?.order.id} успешно оплачен.</p>
					</Card>
				)}
			</Modal>
		</div>
	)
}

export default Order
