import React, { useState, useEffect } from 'react'
import {
	Form,
	Input,
	Button,
	message,
	Typography,
	Card,
	Spin,
	Alert,
	Divider,
	Select,
	Checkbox,
	Modal,
} from 'antd'
import {
	UserOutlined,
	PhoneOutlined,
	MailOutlined,
	CarOutlined,
	EnvironmentOutlined,
	CheckCircleOutlined,
	FileTextOutlined,
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import CourierOrders from './CourierOrders'

const { Option } = Select
const { Title, Paragraph, Link } = Typography

const CourierApplicationForm = () => {
	const [form] = Form.useForm()
	const [loading, setLoading] = useState(false)
	const [checkingSubmission, setCheckingSubmission] = useState(true)
	const [alreadySubmitted, setAlreadySubmitted] = useState(false)
	const [submissionData, setSubmissionData] = useState(null)
	const [error, setError] = useState(null)
	const [userId, setUserId] = useState(null)
	const [rulesChecked, setRulesChecked] = useState(false)
	const [rulesModalVisible, setRulesModalVisible] = useState(false)
	const navigate = useNavigate()

	const transportOptions = [
		{ value: 'foot', label: 'Пешком' },
		{ value: 'bicycle', label: 'Велосипед' },
		{ value: 'motorcycle', label: 'Мотоцикл' },
		{ value: 'car', label: 'Автомобиль' },
	]

	useEffect(() => {
		const storedUserId = localStorage.getItem('userId')
		const parsedUserId = storedUserId ? parseInt(storedUserId, 10) : null

		if (!storedUserId || isNaN(parsedUserId)) {
			setError('Пользователь не авторизован или ID пользователя недействителен')
			setCheckingSubmission(false)
			return
		}

		setUserId(parsedUserId)

		const checkExistingApplication = async () => {
			try {
				const response = await fetch(
					`http://localhost:8080/api/v1/check-courier-application?userId=${parsedUserId}`
				)

				if (!response.ok) {
					throw new Error('Ошибка при проверке заявки')
				}

				const data = await response.json()

				if (data.exists) {
					setAlreadySubmitted(true)
					setSubmissionData(data.courier || { status: 'pending' })
					if (data.courier?.status === 'rejected') {
						form.setFieldsValue({
							name: data.courier.name,
							phone: data.courier.phone,
							email: data.courier.email,
							transport: data.courier.transport,
							experience: data.courier.experience,
							city: data.courier.city,
						})
					}
				}
			} catch (error) {
				setError(error.message)
			} finally {
				setCheckingSubmission(false)
			}
		}

		checkExistingApplication()
	}, [form])

	const showRulesModal = () => {
		setRulesModalVisible(true)
	}

	const handleRulesOk = () => {
		setRulesModalVisible(false)
	}

	const handleRulesCancel = () => {
		setRulesModalVisible(false)
	}

	const onFinish = async values => {
		if (!userId || isNaN(userId)) {
			setError('Не удалось идентифицировать пользователя')
			return
		}

		if (!rulesChecked) {
			setError('Пожалуйста, ознакомьтесь с правилами и подтвердите согласие')
			return
		}

		setLoading(true)
		setError(null)

		const transformedValues = {
			...values,
			experience: parseInt(values.experience, 10),
			userId: userId,
		}

		try {
			let response
			if (
				alreadySubmitted &&
				submissionData?.id &&
				submissionData?.status === 'rejected'
			) {
				response = await fetch(
					`http://localhost:8080/api/v1/courier/${submissionData.id}/resubmit`,
					{
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(transformedValues),
					}
				)
			} else if (!alreadySubmitted) {
				response = await fetch('http://localhost:8080/api/v1/be-courier', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(transformedValues),
				})
			} else {
				throw new Error(
					'Невозможно отправить заявку: уже существует активная заявка'
				)
			}

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Ошибка сервера')
			}

			const data = await response.json()
			setAlreadySubmitted(true)
			setSubmissionData({
				...transformedValues,
				id: data.courier?.id || submissionData?.id,
				status: 'pending',
				date: new Date().toISOString(),
			})

			message.success(
				data.message || 'Ваша заявка успешно отправлена на рассмотрение!'
			)
		} catch (error) {
			setError(error.message)
			if (error.message.includes('already exists')) {
				message.error(
					'Заявка для этого пользователя уже существует. Если она отклонена, вы можете её отредактировать.'
				)
			} else {
				message.error(error.message || 'Произошла ошибка при отправке заявки')
			}
		} finally {
			setLoading(false)
		}
	}

	if (checkingSubmission) {
		return (
			<div className='w-full min-h-screen flex items-center justify-center'>
				<Spin size='large'>
					<div className='ml-4'>Проверяем ваши заявки...</div>
				</Spin>
			</div>
		)
	}

	if (error && (!userId || isNaN(userId))) {
		return (
			<div className='w-full min-h-screen flex items-center justify-center'>
				<Alert
					message='Ошибка'
					description='Пользователь не авторизован. Пожалуйста, войдите в систему.'
					type='error'
					showIcon
				/>
			</div>
		)
	}

	// Если заявка одобрена - показываем панель управления заказами
	if (alreadySubmitted && submissionData?.status === 'approved') {
		return <CourierOrders />
	}

	if (alreadySubmitted && submissionData?.status !== 'rejected') {
		return (
			<div className='w-full min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8'>
				<div className='max-w-2xl mx-auto'>
					<Card className='text-center'>
						<CheckCircleOutlined
							style={{ fontSize: '48px', color: '#52c41a' }}
						/>
						<Title level={3} className='mt-4'>
							Ваша заявка отправлена
						</Title>
						<Paragraph className='mt-4'>
							Вы уже подали заявку на курьерство.
						</Paragraph>
						<Paragraph>
							<strong>Статус:</strong> На рассмотрении
						</Paragraph>
						<Paragraph>
							<strong>Дата подачи:</strong>{' '}
							{submissionData?.date
								? new Date(submissionData.date).toLocaleDateString('ru-RU')
								: new Date().toLocaleDateString('ru-RU')}
						</Paragraph>
						<Paragraph type='secondary' className='mt-4'>
							Мы свяжемся с вами по email:{' '}
							{submissionData?.email || submissionData?.phone}
						</Paragraph>
					</Card>
				</div>
			</div>
		)
	}

	return (
		<div className='container mx-auto py-8'>
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='mb-8'
			>
				<div className='text-black'>
					<h1 className='text-3xl font-bold m-0'>
						{submissionData?.status === 'rejected'
							? 'Редактировать заявку'
							: 'Стать курьером'}
					</h1>
				</div>
			</motion.div>
			<Divider className='my-6' />
			{error && (
				<Alert
					message='Ошибка'
					description={error}
					type='error'
					showIcon
					className='mb-6'
					closable
					onClose={() => setError(null)}
				/>
			)}
			{submissionData?.status === 'rejected' && (
				<Alert
					message='Заявка отклонена'
					description='Ваша заявка была отклонена. Пожалуйста, отредактируйте данные и отправьте снова.'
					type='warning'
					showIcon
					className='mb-6'
				/>
			)}

			<Form
				form={form}
				layout='vertical'
				onFinish={onFinish}
				className='space-y-6'
			>
				<Form.Item
					name='name'
					label='ФИО'
					rules={[
						{ required: true, message: 'Пожалуйста, введите ваше ФИО' },
						{ max: 255, message: 'ФИО не должно превышать 255 символов' },
					]}
				>
					<Input
						prefix={<UserOutlined className='text-gray-400' />}
						placeholder='Введите ваше ФИО'
						className='py-2'
						size='large'
					/>
				</Form.Item>

				<Form.Item
					name='phone'
					label='Телефон'
					rules={[
						{ required: true, message: 'Пожалуйста, введите номер телефона' },
						{
							pattern: /^[\d\s\-()+]+$/,
							message: 'Введите корректный номер телефона',
						},
					]}
				>
					<Input
						prefix={<PhoneOutlined className='text-gray-400' />}
						placeholder='Введите номер телефона'
						className='py-2'
						size='large'
					/>
				</Form.Item>

				<Form.Item
					name='email'
					label='Электронная почта'
					rules={[{ type: 'email', message: 'Введите корректный email' }]}
				>
					<Input
						prefix={<MailOutlined className='text-gray-400' />}
						placeholder='Введите email'
						className='py-2'
						size='large'
					/>
				</Form.Item>

				<Form.Item
					name='transport'
					label='Тип транспорта'
					rules={[
						{ required: true, message: 'Пожалуйста, выберите тип транспорта' },
					]}
				>
					<Select
						placeholder='Выберите тип транспорта'
						size='large'
						suffixIcon={<CarOutlined className='text-gray-400' />}
					>
						{transportOptions.map(option => (
							<Option key={option.value} value={option.value}>
								{option.label}
							</Option>
						))}
					</Select>
				</Form.Item>

				<Form.Item
					name='experience'
					label='Опыт работы (лет)'
					rules={[
						{ required: true, message: 'Пожалуйста, укажите ваш опыт' },
						{
							type: 'number',
							min: 0,
							max: 50,
							message: 'Введите число от 0 до 50',
							transform: value => Number(value),
						},
					]}
				>
					<Input
						type='number'
						placeholder='Укажите ваш опыт работы курьером в годах'
						className='py-2'
						size='large'
					/>
				</Form.Item>

				<Form.Item
					name='city'
					label='Город'
					rules={[{ required: true, message: 'Пожалуйста, укажите город' }]}
				>
					<Input
						prefix={<EnvironmentOutlined className='text-gray-400' />}
						placeholder='Введите город работы'
						className='py-2'
						size='large'
					/>
				</Form.Item>

				<Form.Item>
					<div className='flex items-center mb-4'>
						<Checkbox
							checked={rulesChecked}
							onChange={e => setRulesChecked(e.target.checked)}
						>
							Я ознакомлен с{' '}
							<Button
								type='link'
								onClick={showRulesModal}
								icon={<FileTextOutlined />}
								className='p-0'
							>
								правилами работы курьера
							</Button>
						</Checkbox>
					</div>
				</Form.Item>

				<Form.Item>
					<Button
						type='primary'
						htmlType='submit'
						loading={loading}
						className='w-full bg-black hover:bg-gray-800 text-white py-4 h-auto text-lg font-medium'
						size='large'
						disabled={!rulesChecked}
					>
						{submissionData?.status === 'rejected'
							? 'ОТПРАВИТЬ ПОВТОРНО'
							: 'ОТПРАВИТЬ ЗАЯВКУ'}
					</Button>
				</Form.Item>
			</Form>

			<Modal
				title='Правила работы курьера'
				visible={rulesModalVisible}
				onOk={handleRulesOk}
				onCancel={handleRulesCancel}
				footer={[
					<Button key='back' onClick={handleRulesCancel}>
						Закрыть
					</Button>,
					<Button
						key='submit'
						type='primary'
						onClick={() => {
							setRulesChecked(true)
							handleRulesOk()
						}}
					>
						Ознакомлен
					</Button>,
				]}
				width={800}
			>
				<div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
					<Paragraph>
						<strong>1. Общие положения</strong>
						<br />
						Курьер обязан соблюдать правила доставки и обеспечивать сохранность
						товаров.
					</Paragraph>

					<Paragraph>
						<strong>2. Внешний вид</strong>
						<br />
						Обязательно наличие опрятного внешнего вида и фирменной атрибутики.
					</Paragraph>

					<Paragraph>
						<strong>3. Оборудование</strong>
						<br />
						При себе необходимо иметь терминал для безналичной оплаты.
					</Paragraph>

					<Paragraph>
						<strong>4. Коммуникация</strong>
						<br />
						Курьер обязан позвонить клиенту за 15-30 минут до доставки.
					</Paragraph>

					<Paragraph>
						<strong>5. Временные интервалы</strong>
						<br />
						Соблюдать временной интервал доставки (не более 2 часов ожидания).
					</Paragraph>

					<Paragraph>
						<strong>6. Примерка</strong>
						<br />
						При доставке с примеркой - предоставить клиенту до 15 минут на
						примерку.
					</Paragraph>

					<Paragraph>
						<strong>7. Оплата</strong>
						<br />
						Принимать оплату наличными или картой, выдать чек.
					</Paragraph>

					<Paragraph>
						<strong>8. Транспортировка</strong>
						<br />
						Соблюдать правила хранения и транспортировки спортивного инвентаря.
					</Paragraph>

					<Paragraph>
						<strong>9. Форс-мажор</strong>
						<br />В случае форс-мажора незамедлительно сообщать в службу
						поддержки.
					</Paragraph>

					<Paragraph>
						<strong>10. Возвраты</strong>
						<br />
						При возврате товара проверить его целостность и комплектацию.
					</Paragraph>
				</div>
			</Modal>
		</div>
	)
}

export default CourierApplicationForm
