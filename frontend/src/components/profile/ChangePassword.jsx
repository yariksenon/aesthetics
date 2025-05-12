import React, { useState } from 'react'
import {
	Input,
	Button,
	Form,
	Typography,
	message,
	Card,
	Divider,
	Modal,
} from 'antd'
import { LockOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { confirm } = Modal

const ChangePassword = () => {
	const [loading, setLoading] = useState(false)
	const [form] = Form.useForm()

	const showConfirm = values => {
		confirm({
			title: 'Вы уверены, что хотите изменить пароль?',
			icon: <ExclamationCircleOutlined />,
			content:
				'После изменения вам нужно будет использовать новый пароль для входа.',
			okText: 'Да, изменить',
			cancelText: 'Отмена',
			onOk() {
				return handleSubmit(values)
			},
		})
	}

	const handleSubmit = async values => {
		setLoading(true)

		if (values.password !== values.confirmPassword) {
			message.error('Пароли не совпадают')
			setLoading(false)
			return
		}

		const userId = localStorage.getItem('userId')
		if (!userId) {
			message.error(
				'Не удалось найти ID пользователя. Пожалуйста, войдите заново.'
			)
			setLoading(false)
			return
		}

		try {
			const response = await fetch(
				`http://localhost:8080/api/v1/profile/${userId}/password`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ password: values.password }),
				}
			)

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Ошибка при обновлении пароля')
			}

			message.success('Пароль успешно изменен!')
			form.resetFields()
		} catch (err) {
			message.error(err.message || 'Произошла ошибка')
		} finally {
			setLoading(false)
		}
	}

	const onFinish = values => {
		showConfirm(values)
	}

	return (
		<div>
			<Card bordered={false} style={{ boxShadow: 'none' }}>
				<div style={{ textAlign: 'center', marginBottom: '32px' }}>
					<Title
						level={2}
						style={{
							marginBottom: '8px',
							color: '#000',
							fontSize: '32px',
							fontWeight: 600,
						}}
					>
						Изменить пароль
					</Title>
					<Text style={{ fontSize: '16px', color: '#666' }}>
						Для изменения пароля заполните форму ниже
					</Text>
				</div>

				<Form
					form={form}
					layout='vertical'
					onFinish={onFinish}
					style={{
						maxWidth: '600px',
						margin: '0 auto',
					}}
				>
					<Form.Item
						label={
							<span style={{ fontSize: '16px', color: '#000' }}>
								Новый пароль
							</span>
						}
						name='password'
						rules={[
							{ required: true, message: 'Введите новый пароль' },
							{ min: 6, message: 'Пароль должен быть минимум 6 символов' },
						]}
					>
						<Input.Password
							prefix={<LockOutlined style={{ color: '#666' }} />}
							size='large'
							style={{ fontSize: '16px' }}
							placeholder='Введите новый пароль'
						/>
					</Form.Item>

					<Form.Item
						label={
							<span style={{ fontSize: '16px', color: '#000' }}>
								Подтверждение пароля
							</span>
						}
						name='confirmPassword'
						rules={[
							{ required: true, message: 'Подтвердите пароль' },
							{ min: 6, message: 'Пароль должен быть минимум 6 символов' },
						]}
					>
						<Input.Password
							prefix={<LockOutlined style={{ color: '#666' }} />}
							size='large'
							style={{ fontSize: '16px' }}
							placeholder='Повторите новый пароль'
						/>
					</Form.Item>

					<Divider style={{ margin: '24px 0', borderColor: '#f0f0f0' }} />

					<Form.Item>
						<Button
							type='default'
							htmlType='submit'
							loading={loading}
							size='large'
							style={{
								fontSize: '16px',
								padding: '0 24px',
								backgroundColor: '#000',
								borderColor: '#000',
								color: '#fff',
								width: '100%',
								height: '48px',
							}}
						>
							Обновить пароль
						</Button>
					</Form.Item>
				</Form>
			</Card>
		</div>
	)
}

export default ChangePassword
