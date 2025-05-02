import React, { useState, useEffect } from 'react'
import {
	Form,
	Input,
	InputNumber,
	Button,
	Upload,
	message,
	Select,
	Spin,
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import axios from 'axios'

const { Option } = Select
const { TextArea } = Input

const AdminProductAdd = () => {
	const [form] = Form.useForm()
	const [loading, setLoading] = useState(false)
	const [imageFile, setImageFile] = useState(null)
	const [categories, setCategories] = useState([])
	const [subCategories, setSubCategories] = useState([])

	// Загрузка категорий
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const res = await axios.get(
					'http://localhost:8080/api/v1/admin/categories'
				)
				setCategories(res.data)
			} catch (error) {
				message.error('Ошибка загрузки категорий')
			}
		}
		fetchCategories()
	}, [])

	// Загрузка подкатегорий
	const handleCategoryChange = async categoryId => {
		try {
			const res = await axios.get(
				`http://localhost:8080/api/v1/admin/sub_categories/by_category/${categoryId}`
			)
			setSubCategories(res.data)
			form.setFieldsValue({ sub_category_id: undefined })
		} catch (error) {
			message.error('Ошибка загрузки подкатегорий')
		}
	}

	// Загрузка изображения
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

		setImageFile(file)
		return false
	}

	// Отправка формы
	const onFinish = async values => {
		setLoading(true)

		const formData = new FormData()

		// Добавляем данные продукта
		formData.append('Name', values.name)
		formData.append('Description', values.description || '')
		formData.append('Summary', values.summary || '')
		formData.append('CategoryID', values.category_id)
		formData.append('SubCategoryID', values.sub_category_id)
		formData.append('Color', values.color || '')
		formData.append('Size', values.size || '')
		formData.append('SKU', values.sku)
		formData.append('Price', values.price)
		formData.append('Quantity', values.quantity || 0)
		formData.append('Currency', values.currency || 'USD')

		// Добавляем изображение, если оно есть
		if (imageFile) {
			formData.append('Image', imageFile)
		}

		try {
			const response = await axios.post(
				'http://localhost:8080/api/v1/admin/products',
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			)

			message.success('Товар успешно добавлен!')
			form.resetFields()
			setImageFile(null)
		} catch (error) {
			console.error('Ошибка при добавлении товара:', error)
			message.error(
				error.response?.data?.error || 'Ошибка при добавлении товара'
			)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='max-w-4xl mx-auto p-4 bg-white rounded-lg shadow'>
			<h1 className='text-2xl font-bold mb-6'>Добавить новый товар</h1>

			<Form
				form={form}
				layout='vertical'
				onFinish={onFinish}
				initialValues={{
					quantity: 0,
					currency: 'USD',
					price: 0.0,
				}}
			>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					{/* Основная информация */}
					<div className='space-y-4'>
						<Form.Item
							label='Название товара'
							name='name'
							rules={[{ required: true, message: 'Введите название товара' }]}
						>
							<Input placeholder='Название товара' />
						</Form.Item>

						<Form.Item
							label='Артикул (SKU)'
							name='sku'
							rules={[
								{
									required: true,
									message: 'Введите артикул',
								},
							]}
						>
							<Input placeholder='Уникальный артикул' />
						</Form.Item>

						<Form.Item
							label='Категория'
							name='category_id'
							rules={[{ required: true, message: 'Выберите категорию' }]}
						>
							<Select
								placeholder='Выберите категорию'
								onChange={handleCategoryChange}
								loading={categories.length === 0}
							>
								{categories.map(category => (
									<Option key={category.id} value={category.id}>
										{category.name}
									</Option>
								))}
							</Select>
						</Form.Item>

						<Form.Item
							label='Подкатегория'
							name='sub_category_id'
							rules={[{ required: true, message: 'Выберите подкатегорию' }]}
						>
							<Select
								placeholder='Выберите подкатегорию'
								loading={subCategories.length === 0}
								disabled={subCategories.length === 0}
							>
								{subCategories.map(subCat => (
									<Option key={subCat.id} value={subCat.id}>
										{subCat.name}
									</Option>
								))}
							</Select>
						</Form.Item>

						<Form.Item
							label='Цена'
							name='price'
							rules={[
								{
									required: true,
									message: 'Введите цену',
									type: 'number',
									min: 0.01,
								},
							]}
						>
							<InputNumber min={0.01} step={0.01} style={{ width: '100%' }} />
						</Form.Item>

						<Form.Item label='Валюта' name='currency'>
							<Select>
								<Option value='USD'>USD ($)</Option>
								<Option value='EUR'>EUR (€)</Option>
								<Option value='RUB'>RUB (₽)</Option>
							</Select>
						</Form.Item>
					</div>

					{/* Дополнительная информация */}
					<div className='space-y-4'>
						<Form.Item label='Краткое описание' name='summary'>
							<TextArea
								rows={3}
								placeholder='Краткое описание для карточки товара'
								maxLength={255}
							/>
						</Form.Item>

						<Form.Item label='Полное описание' name='description'>
							<TextArea rows={5} placeholder='Подробное описание товара' />
						</Form.Item>

						<Form.Item label='Цвет' name='color'>
							<Input placeholder='Цвет товара' />
						</Form.Item>

						<Form.Item label='Размер' name='size'>
							<Input placeholder='Размер товара' />
						</Form.Item>

						<Form.Item label='Количество' name='quantity'>
							<InputNumber min={0} style={{ width: '100%' }} />
						</Form.Item>

						<Form.Item label='Изображение товара'>
							<Upload
								beforeUpload={beforeUpload}
								maxCount={1}
								accept='image/*'
								listType='picture'
								fileList={
									imageFile
										? [
												{
													uid: '-1',
													name: imageFile.name,
													status: 'done',
												},
										  ]
										: []
								}
								onRemove={() => setImageFile(null)}
							>
								<Button icon={<UploadOutlined />}>Выбрать изображение</Button>
							</Upload>
							{imageFile && (
								<div className='mt-2 text-sm text-gray-500'>
									Выбрано: {imageFile.name}
								</div>
							)}
						</Form.Item>
					</div>
				</div>

				<Form.Item className='mt-6'>
					<Button type='primary' htmlType='submit' loading={loading}>
						Добавить товар
					</Button>
				</Form.Item>
			</Form>
		</div>
	)
}

export default AdminProductAdd
