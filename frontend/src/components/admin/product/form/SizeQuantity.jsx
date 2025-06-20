import React, { useEffect, useState } from 'react'
import {
	Form,
	Select,
	InputNumber,
	Card,
	Row,
	Col,
	Typography,
	Spin,
	message,
} from 'antd'
import axios from 'axios'

const { Option } = Select
const { Title } = Typography

const SizeQuantity = ({ form }) => {
	const [sizeTypes, setSizeTypes] = useState([])
	const [sizes, setSizes] = useState([])
	const [loading, setLoading] = useState(false)
	const [sizesLoading, setSizesLoading] = useState(false)
	const [selectedSizeTypeId, setSelectedSizeTypeId] = useState(null)

	// Загрузка типов размеров при монтировании
	useEffect(() => {
		const fetchSizeTypes = async () => {
			try {
				setLoading(true)
				const response = await axios.get(
					'http://45.12.74.28:8080/api/v1/size-types'
				)
				// Обрабатываем оба варианта структуры ответа
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
					`http://45.12.74.28:8080/api/v1/sizes?size_type_id=${selectedSizeTypeId}`
				)
				// Обрабатываем оба варианта структуры ответа
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
		// Сбрасываем значения количеств для размеров
		const newValues = {}
		sizes.forEach(size => {
			newValues[`size_${size.id}`] = undefined
		})
		form.setFieldsValue(newValues)
	}

	return (
		<Card
			title='Размеры и количество'
			variant='outlined'
			style={{ marginBottom: 24 }}
		>
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
										>
											<InputNumber
												min={0}
												style={{ width: '100%' }}
												placeholder='Кол-во'
											/>
										</Form.Item>
									</Col>
								))}
							</Row>
						</>
					)}
				</Spin>
			</Spin>
		</Card>
	)
}

export default React.memo(SizeQuantity)
