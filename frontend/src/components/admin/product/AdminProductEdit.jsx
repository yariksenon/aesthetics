import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

const AdminProductEdit = () => {
	const [form] = Form.useForm()
	const [api, contextHolder] = notification.useNotification()
	const [submitting, setSubmitting] = useState(false)
	const [loading, setLoading] = useState(true)
	const [categoryId, setCategoryId] = useState(null)
	const [productImages, setProductImages] = useState([])
	const [existingImages, setExistingImages] = useState([])
	const { id } = useParams()
	const navigate = useNavigate()

	const showNotification = (type, message, description) => {
		api[type]({
			message,
			description,
			placement: 'topRight',
			duration: 4.5,
		})
	}

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				setLoading(true)
				const response = await axios.get(
					`http://45.12.74.28:8080/api/v1/admin/products/${id}`
				)
				const product = response.data

				// Заполняем форму данными товара
				form.setFieldsValue({
					name: product.name,
					description: product.description,
					summary: product.summary,
					category_id: product.category_id,
					sub_category_id: product.sub_category_id,
					color: product.color,
					sku: product.sku,
					price: product.price,
					gender: product.gender,
					size_type_id: product.size_type_id,
				})

				// Устанавливаем categoryId для подкатегорий
				setCategoryId(product.category_id)

				// Обрабатываем размеры
				if (product.size_quantities) {
					const sizeQuantities = JSON.parse(product.size_quantities)
					Object.keys(sizeQuantities).forEach(size => {
						form.setFieldsValue({
							[`size_${size}`]: sizeQuantities[size],
						})
					})
				}

				// Обрабатываем изображения
				if (product.images && product.images.length > 0) {
					setExistingImages(
						product.images.map(img => ({
							id: img.id.toString(),
							image_path: img.image_path,
							alt_text: img.alt_text || '',
							is_primary: img.is_primary,
							display_order: img.display_order,
							isExisting: true,
						}))
					)
				}
			} catch (error) {
				console.error('Ошибка загрузки товара:', error)
				showNotification(
					'error',
					'Ошибка',
					'Не удалось загрузить данные товара'
				)
				navigate('/admin/products')
			} finally {
				setLoading(false)
			}
		}

		fetchProduct()
	}, [id, form, navigate])

	const handleCategoryChange = selectedCategoryId => {
		setCategoryId(selectedCategoryId)
		form.setFieldsValue({
			sub_category_id: undefined,
		})
	}

	const handleImageUpload = files => {
		const newImages = Array.from(files).map((file, index) => ({
			id: Math.random().toString(36).substr(2, 9),
			file,
			image_path: URL.createObjectURL(file),
			alt_text: '',
			is_primary: productImages.length === 0 && existingImages.length === 0,
			display_order: productImages.length + existingImages.length + index,
			isExisting: false,
		}))
		setProductImages([...productImages, ...newImages])
	}

	const handleImageDelete = id => {
		// Для существующих изображений просто помечаем на удаление
		if (existingImages.some(img => img.id === id)) {
			setExistingImages(existingImages.filter(img => img.id !== id))
		} else {
			setProductImages(productImages.filter(img => img.id !== id))
		}
	}

	const handlePrimaryImageChange = id => {
		// Обновляем основное изображение для всех изображений
		const updateImages = images =>
			images.map(img => ({
				...img,
				is_primary: img.id === id,
			}))

		setExistingImages(updateImages(existingImages))
		setProductImages(updateImages(productImages))
	}

	const handleAltTextChange = (id, value) => {
		// Обновляем alt text для существующих изображений
		const updateExisting = existingImages.map(img =>
			img.id === id ? { ...img, alt_text: value } : img
		)
		setExistingImages(updateExisting)

		// Обновляем alt text для новых изображений
		const updateNew = productImages.map(img =>
			img.id === id ? { ...img, alt_text: value } : img
		)
		setProductImages(updateNew)
	}

	const handleSubmit = async values => {
		try {
			setSubmitting(true)

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

			// 4. Добавляем новые изображения
			productImages.forEach(img => {
				formData.append('new_images', img.file)
				formData.append('new_alt_texts', img.alt_text)
				formData.append('new_is_primary', img.is_primary.toString())
				formData.append('new_display_orders', img.display_order.toString())
			})

			// 5. Добавляем информацию о существующих изображениях
			existingImages.forEach(img => {
				formData.append('existing_images', img.id)
				formData.append('existing_alt_texts', img.alt_text)
				formData.append('existing_is_primary', img.is_primary.toString())
				formData.append('existing_display_orders', img.display_order.toString())
			})

			// 6. Отправка данных
			const response = await axios.put(
				`http://45.12.74.28:8080/api/v1/admin/products/${id}`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			)

			// 7. Успешное завершение
			showNotification('success', 'Успех', `Товар успешно обновлен`)
			navigate('/admin/products')
		} catch (error) {
			console.error('Ошибка обновления товара:', error)

			let errorMessage = 'Ошибка сервера'
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

	const allImages = [...existingImages, ...productImages]

	return (
		<div
			className='product-form-container'
			style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}
		>
			{contextHolder}
			<Spin spinning={loading || submitting}>
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
							productImages={allImages}
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
								Обновить товар
							</Button>
						</Form.Item>
					</Space>
				</Form>
			</Spin>
		</div>
	)
}

export default AdminProductEdit
