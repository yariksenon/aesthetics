import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
	Form,
	Input,
	Button,
	Switch,
	Spin,
	Alert,
	Typography,
	Divider,
	Descriptions,
	message,
	Space,
} from 'antd'
import {
	UserOutlined,
	MailOutlined,
	PhoneOutlined,
	EditOutlined,
	CheckOutlined,
	CloseOutlined,
	BellOutlined,
	CalendarOutlined,
	DownloadOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import 'antd/dist/reset.css'

const { Text, Title } = Typography
const API_BASE_URL = 'http://localhost:8080/api/v1/profile'

const UserAvatar = ({ email, firstName }) => {
	const getInitials = email => {
		if (!email) return '??'
		const parts = email.split('@')[0]
		if (parts.length >= 2) {
			return parts.substring(0, 2).toUpperCase()
		}
		return parts.length === 1 ? `${parts[0]}${parts[0]}`.toUpperCase() : '??'
	}

	return (
		<div
			style={{
				width: '120px',
				height: '120px',
				borderRadius: '50%',
				backgroundColor: '#f5f5f5',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontSize: '48px',
				fontWeight: 'bold',
				color: '#222',
				margin: '0 auto 16px',
				border: '3px solid #222',
				boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
				transition: 'all 0.3s ease',
				cursor: 'pointer',
				':hover': {
					transform: 'scale(1.05)',
					boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
				},
			}}
		>
			{getInitials(email)}
		</div>
	)
}

const UserProfile = () => {
	const [profile, setProfile] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [isEditing, setIsEditing] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const [form] = Form.useForm()
	const navigate = useNavigate()
	const userId = localStorage.getItem('userId')

	const fetchProfile = async () => {
		try {
			if (!userId) throw new Error('Пользователь не авторизован')
			const { data } = await axios.get(`${API_BASE_URL}/${userId}`, {
				headers: { 'Content-Type': 'application/json' },
				withCredentials: true,
			})
			setProfile(data)
			form.setFieldsValue({
				username: data.username || '',
				first_name: data.first_name || '',
				last_name: data.last_name || '',
				email: data.email || '',
				phone: data.phone || '',
				subscription: data.subscription || false,
			})
		} catch (err) {
			setError(
				err.response?.data?.message || err.message || 'Ошибка загрузки профиля'
			)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchProfile()
	}, [])

	const handleSubmit = async values => {
		try {
			setIsSubmitting(true)
			if (!userId) throw new Error('Пользователь не авторизован')
			await axios.put(`${API_BASE_URL}/${userId}`, values, {
				headers: { 'Content-Type': 'application/json' },
			})
			setProfile({ ...profile, ...values })
			setIsEditing(false)
			message.success('Данные успешно сохранены')
		} catch (err) {
			message.error(
				err.response?.data?.message ||
					err.message ||
					'Ошибка обновления профиля'
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	const cancelEdit = () => {
		setIsEditing(false)
		form.resetFields()
		form.setFieldsValue({
			username: profile?.username || '',
			first_name: profile?.first_name || '',
			last_name: profile?.last_name || '',
			email: profile?.email || '',
			phone: profile?.phone || '',
			subscription: profile?.subscription || false,
		})
		message.info('Изменения отменены')
	}

	const exportData = () => {
		if (!profile) return

		const dataStr = JSON.stringify(profile, null, 2)
		const dataUri =
			'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

		const exportFileDefaultName = `user-profile-${
			profile.username || 'data'
		}.json`

		const linkElement = document.createElement('a')
		linkElement.setAttribute('href', dataUri)
		linkElement.setAttribute('download', exportFileDefaultName)
		linkElement.click()

		message.success('Данные успешно экспортированы')
	}

	if (loading) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
					backgroundColor: '#fafafa',
				}}
			>
				<Spin size='large' style={{ fontSize: '24px', color: '#222' }} />
			</div>
		)
	}

	if (error) {
		return (
			<div style={{ padding: 24, backgroundColor: '#fafafa' }}>
				<Alert
					message='Ошибка'
					description={error}
					type='error'
					showIcon
					style={{
						fontSize: '18px',
						border: '1px solid #222',
						backgroundColor: '#fff',
					}}
					action={
						<Button
							type='primary'
							onClick={() => navigate('/login')}
							style={{
								fontSize: '16px',
								backgroundColor: '#222',
								borderColor: '#222',
								':hover': {
									backgroundColor: '#444',
									borderColor: '#444',
								},
							}}
						>
							Войти
						</Button>
					}
				/>
			</div>
		)
	}

	return (
		<div
			style={{
				width: '100%',
				minHeight: '100vh',
				padding: '24px 0',
				display: 'flex',
				justifyContent: 'center',
			}}
		>
			<div
				style={{
					width: '100%',
					maxWidth: '1200px',
					display: 'grid',
					gap: '24px',
					padding: '0 24px',
				}}
			>
				<div
					style={{
						paddingRight: '24px',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
					}}
				>
					<UserAvatar email={profile?.email} firstName={profile?.first_name} />

					<Title
						level={3}
						style={{
							marginBottom: '16px',
							textAlign: 'center',
							color: '#222',
							textTransform: 'uppercase',
							letterSpacing: '1px',
						}}
					>
						Статистика
					</Title>

					<Descriptions
						column={1}
						bordered
						style={{
							width: '100%',
							borderColor: '#222',
							backgroundColor: '#fff',
							boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
							transition: 'all 0.3s ease',
							':hover': {
								boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
							},
						}}
						labelStyle={{
							color: '#222',
							fontWeight: 'bold',
							backgroundColor: '#f0f0f0',
						}}
						contentStyle={{
							color: '#222',
							backgroundColor: '#fff',
						}}
					>
						<Descriptions.Item label='Активность'>
							<Text>Ежедневно</Text>
						</Descriptions.Item>
						<Descriptions.Item label='Последний вход'>
							<Text>{dayjs().format('DD.MM.YYYY HH:mm')}</Text>
						</Descriptions.Item>
						<Descriptions.Item label='Статус'>
							<Text>Подтвержден</Text>
						</Descriptions.Item>
					</Descriptions>
				</div>

				{/* Правая колонка - Основная информация */}
				<div>
					<Title
						level={2}
						style={{
							marginBottom: '24px',
							color: '#222',
							textTransform: 'uppercase',
							letterSpacing: '1px',
							position: 'relative',
							':after': {
								content: '""',
								display: 'block',
								width: '60px',
								height: '3px',
								backgroundColor: '#222',
								marginTop: '8px',
							},
						}}
					>
						Профиль пользователя
					</Title>

					{isEditing ? (
						<Form
							form={form}
							layout='vertical'
							onFinish={handleSubmit}
							style={{
								fontSize: '18px',
								backgroundColor: '#fff',
								padding: '24px',
								borderRadius: '4px',
								boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
							}}
							initialValues={{
								username: profile?.username || '',
								first_name: profile?.first_name || '',
								last_name: profile?.last_name || '',
								email: profile?.email || '',
								phone: profile?.phone || '',
								subscription: profile?.subscription || false,
							}}
						>
							<div
								style={{
									display: 'grid',
									gridTemplateColumns: '1fr 1fr',
									gap: '16px',
								}}
							>
								<Form.Item
									label={
										<Text strong style={{ fontSize: '16px', color: '#222' }}>
											Имя пользователя
										</Text>
									}
									name='username'
								>
									<Input
										prefix={<UserOutlined style={{ color: '#222' }} />}
										style={{
											fontSize: '16px',
											padding: '8px',
											borderColor: '#222',
											transition: 'all 0.3s ease',
											':hover': {
												borderColor: '#444',
												boxShadow: '0 0 0 2px rgba(34,34,34,0.2)',
											},
											':focus': {
												borderColor: '#444',
												boxShadow: '0 0 0 2px rgba(34,34,34,0.2)',
											},
										}}
									/>
								</Form.Item>

								<Form.Item
									label={
										<Text strong style={{ fontSize: '16px', color: '#222' }}>
											Email
										</Text>
									}
									name='email'
									rules={[
										{ type: 'email', message: 'Введите корректный email!' },
									]}
								>
									<Input
										prefix={<MailOutlined style={{ color: '#222' }} />}
										disabled
										style={{
											fontSize: '16px',
											padding: '8px',
											borderColor: '#222',
											backgroundColor: '#f5f5f5',
										}}
									/>
								</Form.Item>
							</div>

							<Divider style={{ borderColor: '#ddd', margin: '16px 0' }} />

							<div
								style={{
									display: 'grid',
									gridTemplateColumns: '1fr 1fr',
									gap: '16px',
								}}
							>
								<Form.Item
									label={
										<Text strong style={{ fontSize: '16px', color: '#222' }}>
											Имя
										</Text>
									}
									name='first_name'
									rules={[{ required: true, message: 'Введите ваше имя!' }]}
								>
									<Input
										prefix={<UserOutlined style={{ color: '#222' }} />}
										style={{
											fontSize: '16px',
											padding: '8px',
											borderColor: '#222',
											transition: 'all 0.3s ease',
											':hover': {
												borderColor: '#444',
												boxShadow: '0 0 0 2px rgba(34,34,34,0.2)',
											},
											':focus': {
												borderColor: '#444',
												boxShadow: '0 0 0 2px rgba(34,34,34,0.2)',
											},
										}}
									/>
								</Form.Item>

								<Form.Item
									label={
										<Text strong style={{ fontSize: '16px', color: '#222' }}>
											Фамилия
										</Text>
									}
									name='last_name'
									rules={[{ required: true, message: 'Введите вашу фамилию!' }]}
								>
									<Input
										prefix={<UserOutlined style={{ color: '#222' }} />}
										style={{
											fontSize: '16px',
											padding: '8px',
											borderColor: '#222',
											transition: 'all 0.3s ease',
											':hover': {
												borderColor: '#444',
												boxShadow: '0 0 0 2px rgba(34,34,34,0.2)',
											},
											':focus': {
												borderColor: '#444',
												boxShadow: '0 0 0 2px rgba(34,34,34,0.2)',
											},
										}}
									/>
								</Form.Item>
							</div>

							<Divider style={{ borderColor: '#ddd', margin: '16px 0' }} />

							<Form.Item
								label={
									<Text strong style={{ fontSize: '16px', color: '#222' }}>
										Телефон
									</Text>
								}
								name='phone'
								rules={[
									{
										pattern:
											/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
										message: 'Введите корректный номер телефона!',
									},
								]}
							>
								<Input
									prefix={<PhoneOutlined style={{ color: '#222' }} />}
									style={{
										fontSize: '16px',
										padding: '8px',
										borderColor: '#222',
										transition: 'all 0.3s ease',
										':hover': {
											borderColor: '#444',
											boxShadow: '0 0 0 2px rgba(34,34,34,0.2)',
										},
										':focus': {
											borderColor: '#444',
											boxShadow: '0 0 0 2px rgba(34,34,34,0.2)',
										},
									}}
								/>
							</Form.Item>

							<Divider style={{ borderColor: '#ddd', margin: '16px 0' }} />

							<Form.Item
								name='subscription'
								valuePropName='checked'
								label={
									<Text strong style={{ fontSize: '16px', color: '#222' }}>
										Подписка на рассылку
									</Text>
								}
							>
								<Switch
									checkedChildren={<BellOutlined />}
									unCheckedChildren={<CloseOutlined />}
									style={{
										backgroundColor: '#222',
										':hover': {
											backgroundColor: '#444',
										},
									}}
								/>
							</Form.Item>

							<div
								style={{
									display: 'flex',
									justifyContent: 'flex-end',
									gap: '12px',
									marginTop: '24px',
								}}
							>
								<Button
									onClick={cancelEdit}
									style={{
										fontSize: '16px',
										height: 'auto',
										padding: '8px 16px',
										color: '#222',
										borderColor: '#222',
										transition: 'all 0.3s ease',
										':hover': {
											backgroundColor: '#f0f0f0',
											borderColor: '#444',
											color: '#444',
										},
									}}
									icon={<CloseOutlined />}
								>
									Отмена
								</Button>
								<Button
									type='primary'
									htmlType='submit'
									loading={isSubmitting}
									style={{
										fontSize: '16px',
										height: 'auto',
										padding: '8px 16px',
										backgroundColor: '#222',
										borderColor: '#222',
										transition: 'all 0.3s ease',
										':hover': {
											backgroundColor: '#444',
											borderColor: '#444',
										},
									}}
									icon={<CheckOutlined />}
								>
									Сохранить
								</Button>
							</div>
						</Form>
					) : (
						<>
							<Descriptions
								column={2}
								bordered
								style={{
									borderColor: '#222',
									backgroundColor: '#fff',
									boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
									transition: 'all 0.3s ease',
									':hover': {
										boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
									},
								}}
								labelStyle={{
									color: '#222',
									fontWeight: 'bold',
									backgroundColor: '#f0f0f0',
								}}
								contentStyle={{
									color: '#222',
									backgroundColor: '#fff',
								}}
							>
								<Descriptions.Item label='Имя пользователя'>
									<Text>{profile?.username || 'Не указано'}</Text>
								</Descriptions.Item>
								<Descriptions.Item label='Email'>
									<Text>{profile?.email || 'Не указано'}</Text>
								</Descriptions.Item>
								<Descriptions.Item label='Имя'>
									<Text>{profile?.first_name || 'Не указано'}</Text>
								</Descriptions.Item>
								<Descriptions.Item label='Фамилия'>
									<Text>{profile?.last_name || 'Не указано'}</Text>
								</Descriptions.Item>
								<Descriptions.Item label='Телефон'>
									<Text>{profile?.phone || 'Не указано'}</Text>
								</Descriptions.Item>
								<Descriptions.Item label='Подписка'>
									<Text>{profile?.subscription ? 'Активна' : 'Неактивна'}</Text>
								</Descriptions.Item>
							</Descriptions>

							<Divider style={{ borderColor: '#ddd', margin: '16px 0' }} />

							<Descriptions
								column={1}
								style={{
									backgroundColor: '#fff',
									padding: '16px',
									borderRadius: '4px',
									boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
								}}
							>
								<Descriptions.Item
									label='Дата регистрации'
									labelStyle={{ color: '#222', fontWeight: 'bold' }}
								>
									<Space>
										<CalendarOutlined style={{ color: '#222' }} />
										<Text style={{ color: '#222' }}>
											{dayjs(profile?.created_at).format('D MMMM YYYY')}
										</Text>
									</Space>
								</Descriptions.Item>
							</Descriptions>

							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									marginTop: '24px',
									borderTop: '1px solid #ddd',
									paddingTop: '16px',
								}}
							>
								<Button
									type='text'
									style={{
										color: '#222',
										transition: 'all 0.3s ease',
										':hover': {
											color: '#444',
											backgroundColor: 'transparent',
											textDecoration: 'underline',
										},
									}}
									icon={<DownloadOutlined />}
									onClick={exportData}
								>
									Экспорт данных
								</Button>
								<Button
									type='primary'
									icon={<EditOutlined />}
									onClick={() => setIsEditing(true)}
									style={{
										fontSize: '16px',
										height: 'auto',
										padding: '8px 16px',
										backgroundColor: '#222',
										borderColor: '#222',
										transition: 'all 0.3s ease',
										':hover': {
											backgroundColor: '#444',
											borderColor: '#444',
										},
									}}
								>
									Редактировать профиль
								</Button>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	)
}

export default UserProfile
