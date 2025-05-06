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
	Space,
	Modal,
} from 'antd'
import {
	UserOutlined,
	MailOutlined,
	PhoneOutlined,
	EditOutlined,
	LogoutOutlined,
	CheckOutlined,
	CloseOutlined,
	BellOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import 'antd/dist/reset.css'

const { Text } = Typography

const UserProfile = () => {
	const [profile, setProfile] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [isEditing, setIsEditing] = useState(false)
	const [form] = Form.useForm()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [logoutModalOpen, setLogoutModalOpen] = useState(false)
	const navigate = useNavigate()

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const userId = localStorage.getItem('userId')
				if (!userId) throw new Error('Пользователь не авторизован')
				const { data } = await axios.get(
					`http://localhost:8080/api/v1/profile/${userId}`,
					{
						headers: { 'Content-Type': 'application/json' },
						withCredentials: true,
					}
				)
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
					err.response?.data?.message ||
						err.message ||
						'Ошибка загрузки профиля'
				)
			} finally {
				setLoading(false)
			}
		}
		fetchProfile()
	}, [form])

	const handleSubmit = async values => {
		try {
			setIsSubmitting(true)
			const userId = localStorage.getItem('userId')
			if (!userId) throw new Error('Пользователь не авторизован')
			await axios.put(
				`http://localhost:8080/api/v1/profile/${userId}`,
				values,
				{
					headers: { 'Content-Type': 'application/json' },
				}
			)
			setProfile(prev => ({ ...prev, ...values }))
			setIsEditing(false)
		} catch (err) {
			setError(
				err.response?.data?.message ||
					err.message ||
					'Ошибка обновления профиля'
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleLogout = () => {
		localStorage.removeItem('userId')
		localStorage.removeItem('authToken')
		navigate('/login')
	}

	if (loading)
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
					backgroundColor: '#fff',
				}}
			>
				<Spin size='large' style={{ color: '#000' }} />
			</div>
		)

	if (error)
		return (
			<div
				style={{
					padding: '24px',
					height: '100vh',
					backgroundColor: '#fff',
					color: '#000',
				}}
			>
				<Alert
					message='Ошибка'
					description={error}
					type='error'
					showIcon
					style={{ backgroundColor: '#f5f5f5', color: '#000', border: 'none' }}
					action={
						<Button
							type='primary'
							style={{ backgroundColor: '#000', color: '#fff', border: 'none' }}
							onClick={() => navigate('/login')}
						>
							Войти
						</Button>
					}
				/>
			</div>
		)

	return (
		<div
			style={{
				height: '100vh',
				width: '100%',
				backgroundColor: '#fff',
				color: '#000',
				fontFamily: 'Inter, sans-serif',
				padding: '40px',
				boxSizing: 'border-box',
				overflowY: 'auto',
			}}
		>
			{isEditing ? (
				<Form
					form={form}
					layout='vertical'
					onFinish={handleSubmit}
					style={{ fontSize: '18px' }}
				>
					<Form.Item
						label={<span style={{ color: '#000' }}>Имя пользователя</span>}
						name='username'
					>
						<Input
							prefix={<UserOutlined style={{ color: '#000' }} />}
							placeholder='Имя пользователя'
							style={{
								backgroundColor: '#f5f5f5',
								color: '#000',
								border: '1px solid #ccc',
							}}
						/>
					</Form.Item>
					<Form.Item
						label={<span style={{ color: '#000' }}>Имя</span>}
						name='first_name'
						rules={[{ required: true, message: 'Введите ваше имя!' }]}
					>
						<Input
							prefix={<UserOutlined style={{ color: '#000' }} />}
							placeholder='Имя'
							style={{
								backgroundColor: '#f5f5f5',
								color: '#000',
								border: '1px solid #ccc',
							}}
						/>
					</Form.Item>
					<Form.Item
						label={<span style={{ color: '#000' }}>Фамилия</span>}
						name='last_name'
						rules={[{ required: true, message: 'Введите вашу фамилию!' }]}
					>
						<Input
							prefix={<UserOutlined style={{ color: '#000' }} />}
							placeholder='Фамилия'
							style={{
								backgroundColor: '#f5f5f5',
								color: '#000',
								border: '1px solid #ccc',
							}}
						/>
					</Form.Item>
					<Form.Item
						label={<span style={{ color: '#000' }}>Email</span>}
						name='email'
						rules={[
							{ required: true, message: 'Введите ваш email!' },
							{ type: 'email', message: 'Введите корректный email!' },
						]}
					>
						<Input
							prefix={<MailOutlined style={{ color: '#000' }} />}
							placeholder='Email'
							disabled
							style={{
								backgroundColor: '#f5f5f5',
								color: '#000',
								border: '1px solid #ccc',
							}}
						/>
					</Form.Item>
					<Form.Item
						label={<span style={{ color: '#000' }}>Телефон</span>}
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
							prefix={<PhoneOutlined style={{ color: '#000' }} />}
							placeholder='Телефон'
							style={{
								backgroundColor: '#f5f5f5',
								color: '#000',
								border: '1px solid #ccc',
							}}
						/>
					</Form.Item>
					<Form.Item
						name='subscription'
						valuePropName='checked'
						label={<span style={{ color: '#000' }}>Подписка на рассылку</span>}
					>
						<Switch
							checkedChildren={<BellOutlined />}
							unCheckedChildren={<CloseOutlined />}
							style={{
								backgroundColor: profile.subscription ? '#000' : '#ccc',
							}}
						/>
					</Form.Item>
					<div style={{ textAlign: 'right' }}>
						<Space>
							<Button
								onClick={() => setIsEditing(false)}
								icon={<CloseOutlined />}
								style={{
									backgroundColor: '#f5f5f5',
									color: '#000',
									border: '1px solid #ccc',
								}}
							>
								Отмена
							</Button>
							<Button
								type='primary'
								htmlType='submit'
								loading={isSubmitting}
								icon={<CheckOutlined />}
								style={{
									backgroundColor: '#000',
									color: '#fff',
									border: 'none',
								}}
							>
								Сохранить
							</Button>
						</Space>
					</div>
				</Form>
			) : (
				<div style={{ fontSize: '18px', lineHeight: '2.5' }}>
					<Text strong style={{ color: '#000' }}>
						Имя пользователя:{' '}
					</Text>
					<Text style={{ color: '#333' }}>
						{profile.username || 'Не указано'}
					</Text>
					<br />
					<Text strong style={{ color: '#000' }}>
						Имя:{' '}
					</Text>
					<Text style={{ color: '#333' }}>
						{profile.first_name || 'Не указано'}
					</Text>
					<br />
					<Text strong style={{ color: '#000' }}>
						Фамилия:{' '}
					</Text>
					<Text style={{ color: '#333' }}>
						{profile.last_name || 'Не указано'}
					</Text>
					<br />
					<Text strong style={{ color: '#000' }}>
						Email:{' '}
					</Text>
					<Text style={{ color: '#333' }}>{profile.email}</Text>
					<br />
					<Text strong style={{ color: '#000' }}>
						Телефон:{' '}
					</Text>
					<Text style={{ color: '#333' }}>{profile.phone || 'Не указан'}</Text>
					<br />
					<Text strong style={{ color: '#000' }}>
						Подписка на рассылку:{' '}
					</Text>
					<Text style={{ color: profile.subscription ? '#000' : '#666' }}>
						{profile.subscription ? 'Активна' : 'Неактивна'}
					</Text>
					<br />
					{profile.created_at && (
						<>
							<Text strong style={{ color: '#000' }}>
								Дата регистрации:{' '}
							</Text>
							<Text style={{ color: '#333' }}>
								{dayjs(profile.created_at).format('D MMMM YYYY')}
							</Text>
						</>
					)}
					<div style={{ marginTop: '40px', textAlign: 'right' }}>
						<Space>
							<Button
								type='primary'
								icon={<EditOutlined />}
								onClick={() => setIsEditing(true)}
								style={{
									backgroundColor: '#000',
									color: '#fff',
									border: 'none',
								}}
							>
								Редактировать
							</Button>
							<Button
								danger
								icon={<LogoutOutlined />}
								onClick={() => setLogoutModalOpen(true)}
								style={{
									backgroundColor: '#f5f5f5',
									color: '#000',
									border: '1px solid #ccc',
								}}
							>
								Выйти
							</Button>
						</Space>
					</div>
				</div>
			)}
			<Modal
				title={<span style={{ color: '#000' }}>Подтверждение выхода</span>}
				open={logoutModalOpen}
				onOk={handleLogout}
				onCancel={() => setLogoutModalOpen(false)}
				okText='Выйти'
				cancelText='Отмена'
				okButtonProps={{
					danger: true,
					style: { backgroundColor: '#000', color: '#fff', border: 'none' },
				}}
				cancelButtonProps={{
					style: {
						backgroundColor: '#f5f5f5',
						color: '#000',
						border: '1px solid #ccc',
					},
				}}
				style={{ backgroundColor: '#fff' }}
				bodyStyle={{ backgroundColor: '#fff', color: '#000' }}
			>
				<p>Вы уверены, что хотите выйти?</p>
			</Modal>
		</div>
	)
}

export default UserProfile
