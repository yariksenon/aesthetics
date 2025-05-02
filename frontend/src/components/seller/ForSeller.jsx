import React, { useState } from 'react'
import { Form, Input, Button, Select, message, Upload, Spin } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import axios from 'axios'
import Header from '../home/Header'
import Section from '../home/Section'
import Footer from '../home/Footer'

const { Option } = Select
const { TextArea } = Input

const ForSeller = () => {
	const [form] = Form.useForm()
	const [loading, setLoading] = useState(false)
	const [logoFile, setLogoFile] = useState(null)
	const [submitted, setSubmitted] = useState(false)

	// Проверка и загрузка логотипа
	const beforeUpload = file => {
		const isImage = file.type.startsWith('image/')
		if (!isImage) {
			message.error('Можно загружать только изображения!')
			return Upload.LIST_IGNORE
		}
		const isLt5M = file.size / 1024 / 1024 < 5
		if (!isLt5M) {
			message.error('Изображение должно быть меньше 5MB!')
			return Upload.LIST_IGNORE
		}
		setLogoFile(file)
		return false
	}

	// Отправка формы
	const onFinish = async values => {
		setLoading(true)
		const formData = new FormData()

		Object.entries(values).forEach(([key, value]) => {
			if (value) formData.append(key, value)
		})

		if (logoFile) formData.append('Logo', logoFile)

		try {
			await axios.post(
				'http://localhost:8080/api/v1/seller/application',
				formData,
				{
					headers: { 'Content-Type': 'multipart/form-data' },
				}
			)
			message.success('Заявка успешно отправлена!')
			setSubmitted(true)
			form.resetFields()
			setLogoFile(null)
		} catch (error) {
			message.error('Ошибка отправки заявки, попробуйте снова.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div>
			<Header />
			<Section />
			<div className='mx-[15%]'>
				<div className='max-w-4xl mx-auto p-6 bg-white rounded-lg shadow'>
					<h1 className='text-2xl font-bold mb-6'>
						Заявка на регистрацию продавца
					</h1>

					{submitted ? (
						<div className='text-center text-green-600 text-lg'>
							✅ Ваша заявка успешно отправлена, ожидайте подтверждения!
						</div>
					) : (
						<Form form={form} layout='vertical' onFinish={onFinish}>
							<Form.Item
								label='Название магазина'
								name='store_name'
								rules={[{ required: true, message: 'Введите название' }]}
							>
								<Input placeholder='Название вашего магазина' />
							</Form.Item>

							<Form.Item label='Описание бизнеса' name='business_description'>
								<TextArea rows={4} placeholder='Опишите ваш бизнес' />
							</Form.Item>

							<Form.Item
								label='Контактный Email'
								name='email'
								rules={[{ required: true, message: 'Введите email' }]}
							>
								<Input placeholder='example@email.com' />
							</Form.Item>

							<Form.Item
								label='Телефон'
								name='phone'
								rules={[{ required: true, message: 'Введите номер телефона' }]}
							>
								<Input placeholder='+7 (999) 123-45-67' />
							</Form.Item>

							<Form.Item
								label='Категория бизнеса'
								name='business_category'
								rules={[{ required: true, message: 'Выберите категорию' }]}
							>
								<Select placeholder='Выберите категорию'>
									<Option value='electronics'>Электроника</Option>
									<Option value='fashion'>Одежда</Option>
									<Option value='home'>Товары для дома</Option>
									<Option value='other'>Другое</Option>
								</Select>
							</Form.Item>

							<Form.Item label='Логотип магазина'>
								<Upload
									beforeUpload={beforeUpload}
									maxCount={1}
									accept='image/*'
									listType='picture'
								>
									<Button icon={<UploadOutlined />}>Загрузить логотип</Button>
								</Upload>
							</Form.Item>

							<Form.Item className='mt-6'>
								<Button
									type='primary'
									htmlType='submit'
									loading={loading}
									disabled={loading}
								>
									{loading ? <Spin /> : 'Отправить заявку'}
								</Button>
							</Form.Item>
						</Form>
					)}
				</div>
			</div>
			<Footer />
		</div>
	)
}

export default ForSeller
