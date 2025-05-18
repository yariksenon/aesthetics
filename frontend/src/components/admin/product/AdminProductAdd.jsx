import React, { useState } from 'react'
import { Form, Button, notification, Space, Spin } from 'antd'
import axios from 'axios'
import ProductNameInput from './form/Name'
import ProductDescriptionInput from './form/Description'
import ProductSummaryInput from './form/Summary'
import ProductCategorySelect from './form/Category'
import ProductSubCategorySelect from './form/SubCategory'
import Color from './form/Color'
import SKU from './form/SKU'
import Price from './form/Price'
import Gender from './form/Gender'
import ImageUploader from './form/ImageUploader'
import SizeQuantity from './form/SizeQuantity'

const AdminProductAdd = () => {
	const [form] = Form.useForm()
	const [api, contextHolder] = notification.useNotification()
	const [submitting, setSubmitting] = useState(false)
	const [categoryId, setCategoryId] = useState(null)
	const [productImages, setProductImages] = useState([])

	const showNotification = (type, message, description) => {
		api[type]({
			message,
			description,
			placement: 'topRight',
			duration: 4.5,
		})
	}

	const handleCategoryChange = selectedCategoryId => {
		setCategoryId(selectedCategoryId)
		form.setFieldsValue({
			sub_category_id: undefined,
			sku: generateSKU(selectedCategoryId),
		})
	}

	const generateSKU = categoryId => {
		if (!categoryId) return ''
		const prefix = `CAT-${categoryId}-`
		const randomPart = Math.floor(1000 + Math.random() * 9000)
		return `${prefix}${randomPart}`
	}

	const handleImageUpload = files => {
		const newImages = Array.from(files).map((file, index) => ({
			id: Math.random().toString(36).substr(2, 9),
			file,
			image_path: URL.createObjectURL(file),
			alt_text: '',
			is_primary: productImages.length === 0,
			display_order: productImages.length + index,
		}))
		setProductImages([...productImages, ...newImages])
	}

	const handleImageDelete = id => {
		setProductImages(productImages.filter(img => img.id !== id))
	}

	const handlePrimaryImageChange = id => {
		setProductImages(
			productImages.map(img => ({
				...img,
				is_primary: img.id === id,
			}))
		)
	}

	const handleAltTextChange = (id, value) => {
		setProductImages(
			productImages.map(img =>
				img.id === id ? { ...img, alt_text: value } : img
			)
		)
	}

	const handleSubmit = async values => {
		try {
			setSubmitting(true)

			// Получение userId из localStorage
			const userId = localStorage.getItem('userId')
			if (!userId) {
				throw new Error('User ID не найден в localStorage')
			}

			// 1. Подготовка данных о размерах
			const sizeQuantities = {}
			Object.keys(values).forEach(key => {
				if (key.startsWith('size_')) {
					sizeQuantities[key.replace('size_', '')] = values[key]
				}
			})

			// 2. Создаем FormData
			const formData = new FormData()

			// 3. Добавляем основные данные
			const productData = {
				name: values.name,
				description: values.description,
				summary: values.summary,
				category_id: values.category_id,
				sub_category_id: values.sub_category_id,
				color: values.color,
				sku: values.sku,
				price: values.price,
				gender: values.gender,
				size_type_id: values.size_type_id,
				size_quantities: JSON.stringify(sizeQuantities),
			}

			Object.entries(productData).forEach(([key, value]) => {
				if (value !== undefined) {
					formData.append(key, value)
				}
			})

			// 4. Добавляем изображения
			productImages.forEach(img => {
				formData.append('images', img.file)
				formData.append('alt_texts', img.alt_text)
				formData.append('is_primary', img.is_primary.toString())
			})

			// 5. Отправка данных
			const response = await axios.post(
				`http://localhost:8080/api/v1/create-product/${userId}`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			)

			// 6. Успешное завершение
			showNotification(
				'success',
				'Успех',
				`Товар создан с ID: ${response.data.id}`
			)
			form.resetFields()
			setProductImages([])
		} catch (error) {
			console.error('Ошибка создания товара:', error)

			let errorMessage = error.message || 'Ошибка сервера'
			if (error.response) {
				errorMessage =
					error.response.data?.message ||
					error.response.data?.error ||
					'Неизвестная ошибка сервера'
			}

			showNotification('error', 'Ошибка', errorMessage)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div
			className='product-form-container'
			style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}
		>
			{contextHolder}
			<Spin spinning={submitting}>
				<Form
					form={form}
					layout='vertical'
					onFinish={handleSubmit}
					size='large'
				>
					<Space direction='vertical' size='middle' style={{ display: 'flex' }}>
						<ProductNameInput />
						<ProductDescriptionInput />
						<ProductSummaryInput />

						<ProductCategorySelect onCategoryChange={handleCategoryChange} />

						<ProductSubCategorySelect
							categoryId={categoryId}
							onError={message => showNotification('error', 'Ошибка', message)}
						/>

						<Color />
						<SKU />
						<Price />
						<Gender />

						<ImageUploader
							productImages={productImages}
							handleImageUpload={handleImageUpload}
							handleImageDelete={handleImageDelete}
							handlePrimaryImageChange={handlePrimaryImageChange}
							handleAltTextChange={handleAltTextChange}
						/>

						<SizeQuantity form={form} />

						<Form.Item>
							<Button
								type='primary'
								htmlType='submit'
								loading={submitting}
								size='large'
								block
							>
								Сохранить товар
							</Button>
						</Form.Item>
					</Space>
				</Form>
			</Spin>
		</div>
	)
}

export default AdminProductAdd
