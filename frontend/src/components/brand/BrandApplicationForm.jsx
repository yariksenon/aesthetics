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
	Tabs,
	Checkbox,
	Modal,
} from 'antd'
import {
	MailOutlined,
	GlobalOutlined,
	IdcardOutlined,
	CheckCircleOutlined,
	BarChartOutlined,
	ShoppingOutlined,
	PlusCircleOutlined,
	FileTextOutlined,
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import AddForm from '../admin/product/AdminProductAdd'
import StatisticsDashboard from './StatisticsDashboard'
import BrandProductsForm from './BrandProductsForm'

const { TextArea } = Input
const { Title, Paragraph } = Typography
const { TabPane } = Tabs

// Error Boundary Component
class ErrorBoundary extends React.Component {
	state = { hasError: false, error: null }

	static getDerivedStateFromError(error) {
		return { hasError: true, error }
	}

	render() {
		if (this.state.hasError) {
			return (
				<Alert
					message='Компонент не загрузился'
					description={this.state.error?.message || 'Неизвестная ошибка'}
					type='error'
					showIcon
				/>
			)
		}
		return this.props.children
	}
}

const BrandApplicationForm = () => {
	const [form] = Form.useForm()
	const [loading, setLoading] = useState(false)
	const [checkingSubmission, setCheckingSubmission] = useState(true)
	const [alreadySubmitted, setAlreadySubmitted] = useState(false)
	const [submissionData, setSubmissionData] = useState(null)
	const [error, setError] = useState(null)
	const [userId, setUserId] = useState(null)
	const [activeTab, setActiveTab] = useState('statistics')
	const [rulesChecked, setRulesChecked] = useState(false)
	const [rulesModalVisible, setRulesModalVisible] = useState(false)

	const formatDate = dateString => {
		if (!dateString) return 'Неизвестно'

		const date = new Date(dateString)
		return date.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	useEffect(() => {
		const storedUserData = localStorage.getItem('userData')
		let parsedUserData = null
		let parsedUserId = null
		let defaultEmail = 'user@example.com' // Fallback email

		try {
			parsedUserData = storedUserData ? JSON.parse(storedUserData) : null
			parsedUserId = parsedUserData?.id ? parseInt(parsedUserData.id, 10) : null
			defaultEmail = parsedUserData?.email || defaultEmail
		} catch (e) {
			setError('Ошибка при чтении данных пользователя из localStorage')
		}

		if (!parsedUserData || !parsedUserId || isNaN(parsedUserId)) {
			setError('Пользователь не авторизован или ID пользователя недействителен')
			setCheckingSubmission(false)
			return
		}

		setUserId(parsedUserId)

		const checkExistingApplication = async () => {
			try {
				const response = await fetch(
					`http://localhost:8080/api/v1/check-brand-application?userId=${parsedUserId}`
				)

				if (!response.ok) {
					throw new Error('Ошибка при проверке заявки')
				}

				const data = await response.json()

				if (data.exists) {
					setAlreadySubmitted(true)
					setSubmissionData(data.brand || { status: 'pending' })
					if (data.brand?.status === 'rejected') {
						form.setFieldsValue({
							name: data.brand.name,
							email: data.brand.email,
							website: data.brand.website,
							description: data.brand.description,
						})
					}
				} else {
					// Set default email from localStorage
					form.setFieldsValue({
						email: defaultEmail,
					})
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

		try {
			let response
			if (
				alreadySubmitted &&
				submissionData?.id &&
				submissionData?.status === 'rejected'
			) {
				response = await fetch(
					`http://localhost:8080/api/v1/brand/${submissionData.id}/resubmit`,
					{
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(values),
					}
				)
			} else if (!alreadySubmitted) {
				response = await fetch('http://localhost:8080/api/v1/be-brand', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						...values,
						userId: userId,
					}),
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
				...values,
				id: data.brand?.id || submissionData?.id,
				status: 'pending',
				created_at: data.brand?.created_at || submissionData?.created_at,
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

	const validateSingleValue = fieldName => ({
		validator(_, value) {
			if (!value) return Promise.resolve()
			const values = value
				.split(',')
				.map(v => v.trim())
				.filter(v => v)
			if (value.trim().includes('  ')) {
				return Promise.reject(
					new Error(`Поле "${fieldName}" содержит лишние пробелы`)
				)
			}
			return Promise.resolve()
		},
	})

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

	if (alreadySubmitted && submissionData?.status !== 'rejected') {
		if (submissionData?.status === 'approved') {
			return (
				<div className='w-full min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8'>
					<div className=''>
						<Card className='text-center'>
							<CheckCircleOutlined
								style={{ fontSize: '48px', color: '#52c41a' }}
							/>
							<Title level={3} className='mt-4'>
								Ваш бренд одобрен!
							</Title>
							<Paragraph className='mt-4'>
								Поздравляем! Ваш бренд <strong>{submissionData?.name}</strong>{' '}
								успешно одобрен. Теперь вы можете управлять продуктами и
								просматривать статистику.
							</Paragraph>

							<Divider className='my-6' />

							<Tabs
								activeKey={activeTab}
								onChange={setActiveTab}
								tabPosition='top'
								size='large'
								className='brand-tabs'
							>
								<TabPane
									tab={
										<span>
											<BarChartOutlined />
											Статистика
										</span>
									}
									key='statistics'
								>
									<ErrorBoundary>
										<StatisticsDashboard />
									</ErrorBoundary>
								</TabPane>

								<TabPane
									tab={
										<span>
											<ShoppingOutlined />
											Товары бренда
										</span>
									}
									key='products'
								>
									<ErrorBoundary>
										<BrandProductsForm />
									</ErrorBoundary>
								</TabPane>

								<TabPane
									tab={
										<span>
											<PlusCircleOutlined />
											Добавить товар
										</span>
									}
									key='add-product'
								>
									<ErrorBoundary>
										<AddForm
											onProductAdded={() =>
												window.dispatchEvent(new Event('refreshProducts'))
											}
										/>
									</ErrorBoundary>
								</TabPane>
							</Tabs>
						</Card>
					</div>
				</div>
			)
		}

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
							Вы уже подали заявку на создание бренда:{' '}
							<strong>{submissionData?.name}</strong>
						</Paragraph>
						<Paragraph>
							<strong>Статус:</strong> На рассмотрении
						</Paragraph>
						<Paragraph>
							<strong>Дата подачи:</strong>{' '}
							{formatDate(submissionData?.created_at)}
						</Paragraph>
						<Paragraph type='secondary' className='mt-4'>
							Мы свяжемся с вами по email: {submissionData?.email}
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
							: 'Стать брендом'}
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
					name='name'
					label='Название бренда'
					rules={[
						{ required: true, message: 'Пожалуйста, введите название бренда' },
						{ max: 50, message: 'Название не должно превышать 50 символов' },
						validateSingleValue('Название бренда'),
					]}
				>
					<Input
						prefix={<IdcardOutlined className='text-gray-400' />}
						placeholder='Введите название бренда'
						className='py-2'
						size='large'
						maxLength={50}
					/>
				</Form.Item>

				<Form.Item
					name='email'
					label='Электронная почта'
					rules={[
						{ required: true, message: 'Пожалуйста, введите email' },
						{ type: 'email', message: 'Введите корректный email' },
						{ max: 255, message: 'Email не должен превышать 255 символов' },
					]}
				>
					<Input
						prefix={<MailOutlined className='text-gray-400' />}
						placeholder='Введите email'
						className='py-2'
						size='large'
						maxLength={255}
					/>
				</Form.Item>

				<Form.Item
					name='website'
					label='Веб-сайт'
					rules={[
						{ required: true, message: 'Пожалуйста, введите URL веб-сайта' },
						{
							type: 'url',
							message:
								'Введите корректный URL (начинается с http:// или https://)',
						},
						{ max: 255, message: 'URL не должен превышать 255 символов' },
					]}
				>
					<Input
						prefix={<GlobalOutlined className='text-gray-400' />}
						placeholder='https://example.com'
						className='py-2'
						size='large'
						maxLength={255}
					/>
				</Form.Item>

				<Form.Item
					name='description'
					label='Описание бренда'
					rules={[
						{ required: true, message: 'Пожалуйста, введите описание бренда' },
						{
							min: 50,
							message: 'Описание должно содержать не менее 50 символов',
						},
						{
							max: 500,
							message: 'Описание не должно превышать 500 символов',
						},
						validateSingleValue('Описание бренда'),
					]}
				>
					<TextArea
						rows={6}
						placeholder='Расскажите о вашем бренде, его ценностях и уникальности...'
						className='py-2'
						size='large'
						maxLength={500}
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
								правилами работы с брендами
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
				title='Правила работы с брендами'
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
						Бренд обязан соблюдать правила платформы и обеспечивать
						достоверность информации о товарах.
					</Paragraph>

					<Paragraph>
						<strong>2. Требования к товарам</strong>
						<br />
						Все товары должны иметь четкие фотографии и точные описания.
					</Paragraph>

					<Paragraph>
						<strong>3. Ответственность</strong>
						<br />
						Бренд несет ответственность за соответствие товаров заявленным
						характеристикам.
					</Paragraph>

					<Paragraph>
						<strong>4. Комиссия</strong>
						<br />
						Платформа берет комиссию 10% с каждой успешной продажи.
					</Paragraph>

					<Paragraph>
						<strong>5. Оплата</strong>
						<br />
						Выплаты брендам производятся 2 раза в месяц (10 и 25 числа).
					</Paragraph>

					<Paragraph>
						<strong>6. Возвраты</strong>
						<br />
						Бренд обязан принимать возвраты.
					</Paragraph>

					<Paragraph>
						<strong>7. Контент</strong>
						<br />
						Запрещается размещение незаконного или оскорбительного контента.
					</Paragraph>

					<Paragraph>
						<strong>8. Нарушения</strong>
						<br />
						За нарушения правил возможна блокировка аккаунта.
					</Paragraph>
				</div>
			</Modal>
		</div>
	)
}

export default BrandApplicationForm
