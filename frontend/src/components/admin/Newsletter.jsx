import React, { useState } from 'react'
import { Form, Input, Button, message, Card } from 'antd'
import axios from 'axios'
import { ArrowLeftOutlined, MailOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { TextArea } = Input

const Newsletter = () => {
	const [form] = Form.useForm()
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()

	const onFinish = async values => {
		setLoading(true)
		try {
			const response = await axios.post(
				'http://localhost:8080/api/v1/admin/newsletter',
				{
					subject: values.subject,
					body: values.body,
				}
			)
			message.success(response.data.message || 'Письма успешно отправлены')
			form.resetFields()
		} catch (error) {
			message.error(error.response?.data?.error || 'Ошибка при отправке писем')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='bg-white min-h-screen p-6'>
			<div className='max-w-2xl mx-auto'>
				<div className='flex items-center mb-6'>
					<Button
						type='text'
						icon={<ArrowLeftOutlined />}
						onClick={() => navigate(-1)}
						className='mr-4'
					>
						Назад
					</Button>
					<h1 className='text-2xl font-bold text-black flex items-center'>
						<MailOutlined className='mr-2' />
						Отправить письмо
					</h1>
				</div>

				<Card
					bordered={false}
					className='shadow-md'
					headStyle={{ border: 'none' }}
					bodyStyle={{ padding: '24px' }}
				>
					<Form
						form={form}
						layout='vertical'
						onFinish={onFinish}
						initialValues={{ subject: '', body: '' }}
					>
						<Form.Item
							label={
								<span className='font-medium text-gray-800'>Тема письма</span>
							}
							name='subject'
							rules={[{ required: true, message: 'Введите тему письма' }]}
						>
							<Input
								placeholder='Введите тему рассылки'
								className='py-2 border-gray-300 hover:border-gray-400 focus:border-black'
							/>
						</Form.Item>

						<Form.Item
							label={
								<span className='font-medium text-gray-800'>Текст письма</span>
							}
							name='body'
							rules={[{ required: true, message: 'Введите текст письма' }]}
						>
							<TextArea
								rows={8}
								placeholder='Введите содержание письма...'
								className='border-gray-300 hover:border-gray-400 focus:border-black'
							/>
						</Form.Item>

						<Form.Item>
							<Button
								type='primary'
								htmlType='submit'
								loading={loading}
								block
								className='h-10 font-medium bg-black hover:bg-gray-800 border-none'
								icon={<MailOutlined />}
							>
								Отправить рассылку
							</Button>
						</Form.Item>
					</Form>
				</Card>

				<div className='mt-6 text-gray-500 text-sm'>
					<p>
						Письма будут отправлены всем пользователям системы. Проверьте текст
						перед отправкой.
					</p>
				</div>
			</div>
		</div>
	)
}

export default Newsletter
