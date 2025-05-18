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
	Steps,
	Card,
	Input,
	Form,
} from 'antd'
import axios from 'axios'

import Header from '../home/Header'
import AsideBanner from '../home/AsideBanner'
import Section from '../home/Section'
import Footer from '../home/Footer'

const API_BASE_URL = 'http://localhost:8080/api/v1/orders'
const STATIC_BASE_URL = 'http://localhost:8080/static/'

const { Step } = Steps

const MyOrderList = () => {
	const [orders, setOrders] = useState([])
	const [loading, setLoading] = useState(false)
	const [selectedOrder, setSelectedOrder] = useState(null)
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false)
	const [paymentStep, setPaymentStep] = useState(0)
	const [paymentForm] = Form.useForm()
	const userId = localStorage.getItem('userId')

	// Fetch all orders for the user
	const fetchOrders = async () => {
		if (!userId) {
			message.error('Пожалуйста, войдите для просмотра заказов')
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

	// Fetch details for a specific order
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
			message.error('Не удалось загрузить детали заказа')
		} finally {
			setLoading(false)
		}
	}

	// Cancel an order
	const cancelOrder = async orderId => {
		if (!userId) {
			message.error('Пожалуйста, войдите для отмены заказа')
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

	// Initiate payment process
	const initiatePayment = async () => {
		setIsPaymentModalVisible(true)
		setPaymentStep(0)
	}

	// Process payment
	const processPayment = async () => {
		try {
			const values = await paymentForm.validateFields()
			setPaymentStep(1)

			// Simulate payment processing
			setTimeout(async () => {
				try {
					await axios.post(
						`${API_BASE_URL}/${userId}/${selectedOrder.order.id}/pay`,
						{
							payment_method: 'card',
							card_last_four: values.cardNumber.slice(-4),
							payment_status: 'completed',
						}
					)

					setPaymentStep(2)
					message.success('Оплата прошла успешно!')
					fetchOrders()

					setTimeout(() => {
						setIsPaymentModalVisible(false)
						setIsModalVisible(false)
					}, 2000)
				} catch (error) {
					message.error('Ошибка при обработке платежа')
					setPaymentStep(0)
				}
			}, 2000)
		} catch (error) {
			message.error('Пожалуйста, заполните все поля корректно')
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
				let className = ''
				switch (status) {
					case 'pending':
						statusText = 'Ожидает оплаты'
						className = 'text-gray-600'
						break
					case 'completed':
						statusText = 'Оплачен'
						className = 'text-black font-medium'
						break
					case 'refunded':
						statusText = 'Возвращен'
						className = 'text-gray-500 line-through'
						break
					default:
						className = 'text-black'
				}
				return <span className={className}>{statusText}</span>
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
				<Button
					onClick={() => fetchOrderDetails(record.id)}
					className='bg-black text-white hover:bg-gray-800 border-none'
				>
					Подробности
				</Button>
			),
		},
	]

	return (
		<div>
			<AsideBanner />
			<Header />
			<Section />
			<div className='mx-[15%]'>
				<div className='py-6 bg-white min-h-screen text-gray-900'>
					<h1 className='text-2xl font-bold mb-6 text-black'>Мои заказы</h1>
					<Spin spinning={loading}>
						<Table
							columns={columns}
							dataSource={orders}
							rowKey='id'
							className='[&_.ant-table]:bg-white [&_.ant-table-thead>tr>th]:bg-gray-100 [&_.ant-table-thead>tr>th]:text-gray-900 [&_.ant-table-tbody>tr>td]:text-gray-800 [&_.ant-table-tbody>tr:hover>td]:bg-gray-50 [&_.ant-table-thead>tr>th]:border-gray-200 [&_.ant-table-tbody>tr>td]:border-gray-200'
						/>
					</Spin>

					<Modal
						title='Детали заказа'
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
							selectedOrder?.order.payment_status === 'pending' && (
								<Button
									key='pay'
									onClick={initiatePayment}
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
										className='bg-black text-white hover:bg-gray-800 border-none'
									>
										Отменить заказ
									</Button>
								),
						]}
						className='[&_.ant-modal-content]:bg-white [&_.ant-modal-header]:bg-white [&_.ant-modal-title]:text-black [&_.ant-modal-footer]:border-gray-200'
						width={800}
					>
						{selectedOrder && (
							<div>
								<Descriptions
									title='Информация о заказе'
									column={1}
									className='[&_.ant-descriptions-item-label]:text-gray-900 [&_.ant-descriptions-item-content]:text-gray-800'
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
											? 'Возвращен'
											: selectedOrder.order.payment_status}
									</Descriptions.Item>
									<Descriptions.Item label='Дата создания'>
										{selectedOrder.order_date}
									</Descriptions.Item>
								</Descriptions>

								<Descriptions
									title='Информация о пользователе'
									column={1}
									className='mt-4 [&_.ant-descriptions-item-label]:text-gray-900 [&_.ant-descriptions-item-content]:text-gray-800'
								>
									<Descriptions.Item label='Имя'>{`${selectedOrder.user.first_name} ${selectedOrder.user.last_name}`}</Descriptions.Item>
									<Descriptions.Item label='Email'>
										{selectedOrder.user.email}
									</Descriptions.Item>
									<Descriptions.Item label='Телефон'>
										{selectedOrder.user.phone}
									</Descriptions.Item>
								</Descriptions>

								<h3 className='text-lg font-semibold mt-6 mb-2 text-black'>
									Товары
								</h3>
								<List
									dataSource={selectedOrder.items}
									renderItem={item => (
										<List.Item className='bg-gray-50 p-4 rounded mb-2 border border-gray-200 flex'>
											{item.photo_url && (
												<Image
													src={`${STATIC_BASE_URL}${item.photo_url}`}
													alt={item.product_name}
													preview={false}
												/>
											)}
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

					{/* Payment Modal */}
					<Modal
						title='Оплата заказа'
						open={isPaymentModalVisible}
						onCancel={() => setIsPaymentModalVisible(false)}
						footer={null}
						width={600}
						className='[&_.ant-modal-content]:bg-white [&_.ant-modal-header]:bg-white [&_.ant-modal-title]:text-black'
					>
						<Steps current={paymentStep} className='mb-6'>
							<Step title='Данные карты' />
							<Step title='Обработка' />
							<Step title='Завершение' />
						</Steps>

						{paymentStep === 0 && (
							<Card>
								<Form form={paymentForm} layout='vertical'>
									<Form.Item
										name='cardNumber'
										label='Номер карты'
										rules={[
											{
												required: true,
												message: 'Пожалуйста, введите номер карты',
											},
											{
												pattern: /^\d{16}$/,
												message: 'Номер карты должен содержать 16 цифр',
											},
										]}
									>
										<Input placeholder='1234 5678 9012 3456' maxLength={16} />
									</Form.Item>

									<div className='flex gap-4'>
										<Form.Item
											name='expiryDate'
											label='Срок действия'
											rules={[
												{
													required: true,
													message: 'Пожалуйста, введите срок действия',
												},
												{
													pattern: /^(0[1-9]|1[0-2])\/?([0-9]{2})$/,
													message: 'Формат: MM/YY',
												},
											]}
											className='flex-1'
										>
											<Input placeholder='MM/YY' />
										</Form.Item>

										<Form.Item
											name='cvv'
											label='CVV'
											rules={[
												{ required: true, message: 'Пожалуйста, введите CVV' },
												{
													pattern: /^\d{3}$/,
													message: 'CVV должен содержать 3 цифры',
												},
											]}
											className='flex-1'
										>
											<Input placeholder='123' maxLength={3} />
										</Form.Item>
									</div>

									<Button
										type='primary'
										onClick={processPayment}
										className='w-full bg-black text-white hover:bg-gray-800 border-none mt-4'
									>
										Оплатить ${selectedOrder?.order.total.toFixed(2)}
									</Button>
								</Form>
							</Card>
						)}

						{paymentStep === 1 && (
							<Card className='text-center py-8'>
								<Spin size='large' />
								<p className='mt-4'>Идет обработка платежа...</p>
							</Card>
						)}

						{paymentStep === 2 && (
							<Card className='text-center py-8'>
								<div className='text-green-500 text-5xl mb-4'>✓</div>
								<h3 className='text-xl font-bold mb-2'>
									Оплата прошла успешно!
								</h3>
								<p>Ваш заказ #{selectedOrder?.order.id} успешно оплачен.</p>
							</Card>
						)}
					</Modal>
				</div>
			</div>

			<Footer />
		</div>
	)
}

export default MyOrderList
