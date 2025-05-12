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
	Card,
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
} from '@ant-design/icons'
import dayjs from 'dayjs'
import 'antd/dist/reset.css'

const { Text, Title } = Typography
const API_BASE_URL = 'http://localhost:8080/api/v1/profile'

const UserAvatar = ({ email }) => {
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
				width: '150px',
				height: '150px',
				borderRadius: '50%',
				backgroundColor: '#BCB7B7',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontSize: '64px',
				fontWeight: 'bold',
				color: '#4D4747',
				margin: '0 auto 24px',
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

	if (loading) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
				}}
			>
				<Spin size='large' />
			</div>
		)
	}

	if (error) {
		return (
			<div>
				<Alert
					message={<span style={{ fontSize: '18px' }}>Ошибка</span>}
					description={<span style={{ fontSize: '16px' }}>{error}</span>}
					type='error'
					showIcon
					action={
						<Button
							type='default'
							size='large'
							onClick={() => navigate('/login')}
							style={{ borderColor: '#333' }}
						>
							Войти
						</Button>
					}
					style={{ fontSize: '16px' }}
				/>
			</div>
		)
	}

	return (
		<div>
			<Card bordered={false} style={{ boxShadow: 'none' }}>
				<div style={{ textAlign: 'center', marginBottom: '32px' }}>
					<UserAvatar email={profile?.email} />
					<Title
						level={2}
						style={{
							marginBottom: '8px',
							color: '#000',
							fontSize: '32px',
							fontWeight: 600,
						}}
					>
						Профиль пользователя
					</Title>
					<Text style={{ fontSize: '16px', color: '#666' }}>
						{profile?.first_name || 'Имя'} {profile?.last_name || 'Фамилия'}
					</Text>
				</div>

				{isEditing ? (
					<Form
						form={form}
						layout='vertical'
						onFinish={handleSubmit}
						style={{
							borderRadius: '8px',
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
								gap: '24px',
							}}
						>
							<Form.Item
								label={
									<span style={{ fontSize: '16px', color: '#000' }}>
										Имя пользователя
									</span>
								}
								name='username'
							>
								<Input
									prefix={<UserOutlined style={{ color: '#666' }} />}
									size='large'
									style={{ fontSize: '16px' }}
								/>
							</Form.Item>

							<Form.Item
								label={
									<span style={{ fontSize: '16px', color: '#000' }}>Email</span>
								}
								name='email'
								rules={[
									{ type: 'email', message: 'Введите корректный email!' },
								]}
							>
								<Input
									prefix={<MailOutlined style={{ color: '#666' }} />}
									disabled
									size='large'
									style={{ fontSize: '16px' }}
								/>
							</Form.Item>
						</div>

						<Divider style={{ margin: '24px 0', borderColor: '#f0f0f0' }} />

						<div
							style={{
								display: 'grid',
								gridTemplateColumns: '1fr 1fr',
								gap: '24px',
							}}
						>
							<Form.Item
								label={
									<span style={{ fontSize: '16px', color: '#000' }}>Имя</span>
								}
								name='first_name'
								rules={[{ required: true, message: 'Введите ваше имя!' }]}
							>
								<Input
									prefix={<UserOutlined style={{ color: '#666' }} />}
									size='large'
									style={{ fontSize: '16px' }}
								/>
							</Form.Item>

							<Form.Item
								label={
									<span style={{ fontSize: '16px', color: '#000' }}>
										Фамилия
									</span>
								}
								name='last_name'
								rules={[{ required: true, message: 'Введите вашу фамилию!' }]}
							>
								<Input
									prefix={<UserOutlined style={{ color: '#666' }} />}
									size='large'
									style={{ fontSize: '16px' }}
								/>
							</Form.Item>
						</div>

						<Divider style={{ margin: '24px 0', borderColor: '#f0f0f0' }} />

						<Form.Item
							label={
								<span style={{ fontSize: '16px', color: '#000' }}>Телефон</span>
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
								prefix={<PhoneOutlined style={{ color: '#666' }} />}
								size='large'
								style={{ fontSize: '16px' }}
							/>
						</Form.Item>

						<Divider style={{ margin: '24px 0', borderColor: '#f0f0f0' }} />

						<Form.Item
							name='subscription'
							valuePropName='checked'
							label={
								<span style={{ fontSize: '16px', color: '#000' }}>
									Подписка на рассылку
								</span>
							}
						>
							<Switch
								checkedChildren={<BellOutlined />}
								unCheckedChildren={<CloseOutlined />}
								size='default'
							/>
						</Form.Item>

						<div
							style={{
								display: 'flex',
								justifyContent: 'flex-end',
								gap: '16px',
								marginTop: '32px',
							}}
						>
							<Button
								onClick={cancelEdit}
								icon={<CloseOutlined />}
								size='large'
								style={{
									fontSize: '16px',
									padding: '0 24px',
									color: '#000',
									borderColor: '#666',
								}}
							>
								Отмена
							</Button>
							<Button
								type='default'
								htmlType='submit'
								loading={isSubmitting}
								icon={<CheckOutlined />}
								size='large'
								style={{
									fontSize: '16px',
									padding: '0 24px',
									backgroundColor: '#000',
									borderColor: '#000',
									color: '#fff',
								}}
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
							size='default'
							style={{
								borderRadius: '8px',
								fontSize: '16px',
								borderColor: '#f0f0f0',
							}}
							styles={{
								label: {
									fontWeight: 500,
									color: '#000',
									width: '200px',
									fontSize: '16px',
									backgroundColor: '#fafafa',
								},
								content: {
									fontSize: '16px',
									color: '#333',
								},
							}}
						>
							<Descriptions.Item label='Имя пользователя'>
								<Text strong style={{ color: '#000' }}>
									{profile?.username || 'Не указано'}
								</Text>
							</Descriptions.Item>
							<Descriptions.Item label='Email'>
								<Text strong style={{ color: '#000' }}>
									{profile?.email || 'Не указано'}
								</Text>
							</Descriptions.Item>
							<Descriptions.Item label='Имя'>
								<Text strong>{profile?.first_name || 'Не указано'}</Text>
							</Descriptions.Item>
							<Descriptions.Item label='Фамилия'>
								<Text strong>{profile?.last_name || 'Не указано'}</Text>
							</Descriptions.Item>
							<Descriptions.Item label='Телефон'>
								<Text strong>{profile?.phone || 'Не указано'}</Text>
							</Descriptions.Item>
							<Descriptions.Item label='Подписка'>
								<Text
									strong
									style={{
										color: profile?.subscription ? '#000' : '#666',
									}}
								>
									{profile?.subscription ? 'Активна' : 'Неактивна'}
								</Text>
							</Descriptions.Item>
						</Descriptions>

						<Divider style={{ margin: '24px 0', borderColor: '#f0f0f0' }} />

						<Card
							style={{
								borderRadius: '8px',
								borderColor: '#f0f0f0',
							}}
							bordered
						>
							<Descriptions column={1} size='default'>
								<Descriptions.Item
									label={
										<span style={{ fontSize: '16px', color: '#000' }}>
											Дата регистрации
										</span>
									}
								>
									<Space>
										<CalendarOutlined
											style={{ color: '#666', fontSize: '16px' }}
										/>
										<Text strong style={{ fontSize: '16px', color: '#333' }}>
											{dayjs(profile?.created_at).format('D MMMM YYYY')}
										</Text>
									</Space>
								</Descriptions.Item>
							</Descriptions>
						</Card>

						<div
							style={{
								display: 'flex',
								justifyContent: 'flex-end',
								marginTop: '32px',
							}}
						>
							<Button
								type='default'
								icon={<EditOutlined />}
								onClick={() => setIsEditing(true)}
								size='large'
								style={{
									fontSize: '16px',
									padding: '0 24px',
									backgroundColor: '#000',
									borderColor: '#000',
									color: '#fff',
								}}
							>
								Редактировать профиль
							</Button>
						</div>
					</>
				)}
			</Card>
		</div>
	)
}

export default UserProfile
