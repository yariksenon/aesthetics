import React, { useEffect, useState } from 'react'
import {
	Form,
	Select,
	InputNumber,
	Row,
	Col,
	Typography,
	Spin,
	message,
} from 'antd'
import axios from 'axios'

const { Option } = Select
const { Title } = Typography

const MAX_QUANTITY = 10000 // Максимальное допустимое количество товара

const SizeQuantity = ({ form }) => {
	const [sizeTypes, setSizeTypes] = useState([])
	const [sizes, setSizes] = useState([])
	const [loading, setLoading] = useState(false)
	const [sizesLoading, setSizesLoading] = useState(false)
	const [selectedSizeTypeId, setSelectedSizeTypeId] = useState(null)

	// Обработчик ввода количества
	const handleQuantityChange = (value, sizeId) => {
		if (value === null || value === undefined) return

		// Заменяем буквы и символы на пустую строку
		const numericValue = String(value).replace(/[^0-9]/g, '')

		// Ограничиваем максимальное значение
		const limitedValue = Math.min(Number(numericValue), MAX_QUANTITY)

		// Обновляем значение в форме
		form.setFieldsValue({ [`size_${sizeId}`]: limitedValue })
	}

	// Загрузка типов размеров при монтировании
	useEffect(() => {
		const fetchSizeTypes = async () => {
			try {
				setLoading(true)
				const response = await axios.get(
					'http://localhost:8080/api/v1/size-types'
				)
				setSizeTypes(
					response.data?.data?.size_types ||
						response.data?.size_types ||
						response.data?.data ||
						response.data ||
						[]
				)
			} catch (error) {
				console.error('Error fetching size types:', error)
				message.error('Не удалось загрузить типы размеров')
				setSizeTypes([])
			} finally {
				setLoading(false)
			}
		}

		fetchSizeTypes()
	}, [])

	// Загрузка размеров при изменении выбранного типа
	useEffect(() => {
		const fetchSizes = async () => {
			if (!selectedSizeTypeId) return

			try {
				setSizesLoading(true)
				const response = await axios.get(
					`http://localhost:8080/api/v1/sizes?size_type_id=${selectedSizeTypeId}`
				)
				setSizes(
					response.data?.data?.sizes ||
						response.data?.sizes ||
						response.data?.data ||
						response.data ||
						[]
				)
			} catch (error) {
				console.error('Error fetching sizes:', error)
				message.error('Не удалось загрузить размеры')
				setSizes([])
			} finally {
				setSizesLoading(false)
			}
		}

		fetchSizes()
	}, [selectedSizeTypeId])

	const handleSizeTypeChange = value => {
		setSelectedSizeTypeId(value)
		const newValues = {}
		sizes.forEach(size => {
			newValues[`size_${size.id}`] = 0
		})
		form.setFieldsValue(newValues)
	}

	return (
		<Spin spinning={loading}>
			<Form.Item
				label='Тип размера'
				name='size_type_id'
				rules={[
					{ required: true, message: 'Пожалуйста, выберите тип размера' },
				]}
			>
				<Select
					placeholder='Выберите тип размера'
					onChange={handleSizeTypeChange}
					allowClear
					loading={loading}
				>
					{sizeTypes.map(sizeType => (
						<Option key={sizeType.id} value={sizeType.id}>
							{sizeType.name}
						</Option>
					))}
				</Select>
			</Form.Item>

			<Spin spinning={sizesLoading}>
				{selectedSizeTypeId && (
					<>
						<Title level={5} style={{ marginBottom: 16 }}>
							Доступные размеры
						</Title>
						<Row gutter={[16, 16]}>
							{sizes.map(size => (
								<Col xs={12} sm={8} md={6} lg={4} key={size.id}>
									<Form.Item
										label={size.value}
										name={`size_${size.id}`}
										initialValue={0}
										rules={[
											{
												validator: (_, value) => {
													if (value < 0) {
														return Promise.reject(
															'Количество не может быть отрицательным'
														)
													}
													if (value > MAX_QUANTITY) {
														return Promise.reject(
															`Максимальное количество: ${MAX_QUANTITY}`
														)
													}
													return Promise.resolve()
												},
											},
										]}
									>
										<InputNumber
											min={0}
											max={MAX_QUANTITY}
											style={{ width: '100%' }}
											placeholder='Кол-во'
											onChange={value => handleQuantityChange(value, size.id)}
											parser={value => value.replace(/[^0-9]/g, '')}
											formatter={value => {
												if (!value) return '0'
												return `${value}`.replace(/[^0-9]/g, '')
											}}
										/>
									</Form.Item>
								</Col>
							))}
						</Row>
					</>
				)}
			</Spin>
		</Spin>
	)
}

export default React.memo(SizeQuantity)
