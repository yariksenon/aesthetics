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
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { isValidPhoneNumber } from 'libphonenumber-js'

const { Option } = Select
const { Title, Paragraph } = Typography

const regionsOfBelarus = [
	{ value: 'brest', label: 'Брестская область' },
	{ value: 'vitebsk', label: 'Витебская область' },
	{ value: 'gomel', label: 'Гомельская область' },
	{ value: 'grodno', label: 'Гродненская область' },
	{ value: 'minsk', label: 'Минская область' },
	{ value: 'mogilev', label: 'Могилевская область' },
]

const transportOptions = [
	{ value: 'foot', label: 'Пешком' },
	{ value: 'bicycle', label: 'Велосипед' },
	{ value: 'motorcycle', label: 'Мотоцикл' },
	{ value: 'car', label: 'Автомобиль' },
]

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
	const [phoneValue, setPhoneValue] = useState('')
	const [phoneError, setPhoneError] = useState('')
	const [userData, setUserData] = useState(null)
	const navigate = useNavigate()

	const validatePhoneNumber = phoneNumber => {
		if (!phoneNumber || typeof phoneNumber !== 'string') {
			setPhoneError('Номер телефона обязателен')
			return false
		}

		const cleanedPhone = phoneNumber.replace(/\D/g, '')
		if (cleanedPhone.length > 12) {
			setPhoneError('Номер телефона не должен превышать 12 цифр')
			return false
		}

		if (!isValidPhoneNumber(phoneNumber)) {
			setPhoneError('Некорректный номер телефона')
			return false
		}

		setPhoneError('')
		return true
	}

	const handlePhoneChange = value => {
		setPhoneValue(value || '')
		form.setFieldsValue({ phone: value || '' })
		validatePhoneNumber(value || '')
	}

	useEffect(() => {
		const fetchUserData = async userId => {
			try {
				const response = await fetch(
					'http://45.12.74.28:8080/api/v1/admin/users'
				)
				if (!response.ok) {
					throw new Error('Ошибка при получении данных пользователя')
				}
				const users = await response.json()
				const currentUser = users.find(user => user.id === userId)
				if (currentUser) {
					setUserData(currentUser)
					return currentUser
				}
				return null
			} catch (error) {
				console.error('Ошибка при получении данных пользователя:', error)
				return null
			}
		}

		const storedUserData = localStorage.getItem('userData')
		let parsedUserData = null
		let parsedUserId = null

		try {
			parsedUserData = storedUserData ? JSON.parse(storedUserData) : null
			parsedUserId = parsedUserData?.id ? parseInt(parsedUserData.id, 10) : null
		} catch (e) {
			console.error('Ошибка при парсинге userData:', e)
		}

		if (!parsedUserData || !parsedUserId || isNaN(parsedUserId)) {
			setError('Пользователь не авторизован или данные недействительны')
			setCheckingSubmission(false)
			return
		}

		setUserId(parsedUserId)

		fetchUserData(parsedUserId).then(user => {
			// Проверяем значения first_name и last_name, заменяем "не указано"/"не указана" на пустую строку
			const defaultFirstName =
				user?.first_name === 'не указано' ||
				parsedUserData.first_name === 'не указано'
					? ''
					: user?.first_name || parsedUserData.first_name || ''
			const defaultLastName =
				user?.last_name === 'не указана' ||
				parsedUserData.last_name === 'не указана'
					? ''
					: user?.last_name || parsedUserData.last_name || ''
			const defaultPatronymic =
				user?.patronymic || parsedUserData.patronymic || ''

			if (user) {
				form.setFieldsValue({
					email: user.email || '',
					phone: user.phone || '',
					first_name: defaultFirstName,
					last_name: defaultLastName,
					patronymic: defaultPatronymic,
				})
				setPhoneValue(user.phone || '')
			} else {
				form.setFieldsValue({
					email: parsedUserData.email || '',
					phone: parsedUserData.phone || '',
					first_name: defaultFirstName,
					last_name: defaultLastName,
					patronymic: defaultPatronymic,
				})
				if (parsedUserData.phone) {
					setPhoneValue(parsedUserData.phone)
				}
			}

			const checkExistingApplication = async () => {
				try {
					const response = await fetch(
						`http://45.12.74.28:8080/api/v1/check-courier-application?userId=${parsedUserId}`
					)

					if (!response.ok) {
						throw new Error('Ошибка при проверке заявки')
					}

					const data = await response.json()

					if (data.exists && data.courier?.id) {
						setAlreadySubmitted(true)
						setSubmissionData(data.courier || { status: 'pending' })
						// Save courier ID to localStorage
						localStorage.setItem('courierId', data.courier.id)
						if (data.courier?.status === 'rejected') {
							const rejectedFirstName =
								data.courier.first_name === 'не указано'
									? ''
									: data.courier.first_name || defaultFirstName
							const rejectedLastName =
								data.courier.last_name === 'не указана'
									? ''
									: data.courier.last_name || defaultLastName
							const rejectedPatronymic =
								data.courier.patronymic || defaultPatronymic
							form.setFieldsValue({
								first_name: rejectedFirstName,
								last_name: rejectedLastName,
								patronymic: rejectedPatronymic,
								name:
									data.courier.name ||
									`${rejectedFirstName} ${rejectedLastName} ${rejectedPatronymic}`.trim(),
								phone:
									data.courier.phone ||
									user?.phone ||
									parsedUserData.phone ||
									'',
								email:
									data.courier.email ||
									user?.email ||
									parsedUserData.email ||
									'',
								transport: data.courier.transport,
								experience: data.courier.experience,
								region: data.courier.region,
							})
							setPhoneValue(
								data.courier.phone || user?.phone || parsedUserData.phone || ''
							)
						}
					}
				} catch (error) {
					setError(error.message)
				} finally {
					setCheckingSubmission(false)
				}
			}

			checkExistingApplication()
		})
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

	const validateNameField = (_, value) => {
		if (!value || value.trim() === '') {
			return Promise.reject('Пожалуйста, введите корректное значение')
		}
		if (value.length > 50) {
			return Promise.reject('Поле не должно превышать 50 символов')
		}
		return Promise.resolve()
	}

	const validateExperience = (_, value) => {
		const numValue = Number(value)
		if (numValue < 0) {
			return Promise.reject('Опыт не может быть отрицательным')
		}
		if (numValue > 99) {
			return Promise.reject('Опыт не может быть больше 99 лет')
		}
		if (!/^\d{1,2}$/.test(value)) {
			return Promise.reject('Введите число от 0 до 99')
		}
		return Promise.resolve()
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

		if (!validatePhoneNumber(values.phone)) {
			return
		}

		setLoading(true)
		setError(null)

		const transformedValues = {
			...values,
			experience: parseInt(values.experience, 10),
			userId: userId,
			name: `${values.first_name} ${values.last_name} ${
				values.patronymic || ''
			}`.trim(),
			city: values.region,
		}

		delete transformedValues.first_name
		delete transformedValues.last_name
		delete transformedValues.patronymic
		delete transformedValues.region

		try {
			let response
			if (
				alreadySubmitted &&
				submissionData?.id &&
				submissionData?.status === 'rejected'
			) {
				response = await fetch(
					`http://45.12.74.28:8080/api/v1/courier/${submissionData.id}/resubmit`,
					{
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(transformedValues),
					}
				)
			} else if (!alreadySubmitted) {
				response = await fetch('http://45.12.74.28:8080/api/v1/be-courier', {
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
							{submissionData?.created_at
								? new Date(submissionData.created_at).toLocaleDateString(
										'ru-RU',
										{
											day: 'numeric',
											month: 'long',
											year: 'numeric',
											hour: '2-digit',
											minute: '2-digit',
										}
								  )
								: 'Неизвестно'}
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
					name='first_name'
					label='Имя'
					rules={[{ required: true, validator: validateNameField }]}
				>
					<Input
						prefix={<UserOutlined className='text-gray-400' />}
						placeholder='Введите ваше имя'
						className='py-2'
						size='large'
					/>
				</Form.Item>
				<Form.Item
					name='last_name'
					label='Фамилия'
					rules={[{ required: true, validator: validateNameField }]}
				>
					<Input
						prefix={<UserOutlined className='text-gray-400' />}
						placeholder='Введите вашу фамилию'
						className='py-2'
						size='large'
					/>
				</Form.Item>
				<Form.Item
					name='patronymic'
					label='Отчество'
					rules={[{ required: true, message: 'Пожалуйста, введите отчество' }]}
				>
					<Input
						prefix={<UserOutlined className='text-gray-400' />}
						placeholder='Введите ваше отчество'
						className='py-2'
						size='large'
					/>
				</Form.Item>

				<Form.Item
					name='phone'
					label='Телефон'
					validateStatus={phoneError ? 'error' : ''}
					help={phoneError}
					rules={[
						{
							validator: () =>
								phoneError ? Promise.reject(phoneError) : Promise.resolve(),
						},
					]}
				>
					<PhoneInput
						international
						defaultCountry='BY'
						value={phoneValue}
						onChange={handlePhoneChange}
						className={`ant-input ant-input-lg w-full p-2 border rounded`}
						style={{
							borderColor: phoneError ? '#ff4d4f' : '#d9d9d9',
							height: '40px',
						}}
						placeholder='Введите номер телефона'
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
						{ validator: validateExperience },
					]}
				>
					<Input
						type='number'
						placeholder='10'
						className='py-2'
						size='large'
						max={99}
						min={0}
					/>
				</Form.Item>

				<Form.Item
					name='region'
					label='Область'
					rules={[{ required: true, message: 'Пожалуйста, выберите область' }]}
				>
					<Select
						placeholder='Выберите область'
						size='large'
						suffixIcon={<EnvironmentOutlined className='text-gray-400' />}
					>
						{regionsOfBelarus.map(region => (
							<Option key={region.value} value={region.value}>
								{region.label}
							</Option>
						))}
					</Select>
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
						disabled={!rulesChecked || !!phoneError}
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
