import React, { useState, useEffect } from 'react'
import {
	Form,
	Table,
	Button,
	Input,
	Select,
	Card,
	Spin,
	message,
	Typography,
	Space,
	Popconfirm,
	Image,
	Alert,
	Divider,
	Row,
	Col,
} from 'antd'
import { DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import axios from 'axios'

const { Option } = Select
const { Title, Text } = Typography

const API_BASE_URL = 'http://localhost:8080/api/v1'

const genderMap = {
	male: 'Мужской',
	female: 'Женский',
	women: 'Женский',
	child: 'Детский',
}

const BYNIcon = () => <span style={{ marginLeft: 4 }}>BYN</span>

const BrandProductsForm = () => {
	const [form] = Form.useForm()
	const [products, setProducts] = useState([])
	const [loading, setLoading] = useState(false)
	const [userId, setUserId] = useState(null)
	const [brandId, setBrandId] = useState(null)
	const [error, setError] = useState(null)
	const [searchParams, setSearchParams] = useState({
		name: '',
		sku: '',
		category: '',
	})

	useEffect(() => {
		const fetchBrandAndProducts = async () => {
			try {
				setLoading(true)

				// Получаем userId из localStorage
				const storedUserData = localStorage.getItem('userData')
				if (!storedUserData) {
					throw new Error('Пользователь не авторизован')
				}

				const userData = JSON.parse(storedUserData)
				const userId = userData.id

				if (!userId) {
					throw new Error('ID пользователя не найден')
				}

				setUserId(userId)

				// Получаем информацию о бренде пользователя
				const brandResponse = await axios.get(
					`${API_BASE_URL}/admin/brand/approved`
				)
				const brands = brandResponse.data

				const userBrand = brands.find(brand => brand.user_id === userId)
				if (!userBrand) {
					throw new Error('Бренд не найден или не одобрен')
				}

				setBrandId(userBrand.id)

				// Получаем товары бренда
				const productsResponse = await axios.get(
					`${API_BASE_URL}/my-product/${userBrand.id}`
				)
				setProducts(productsResponse.data.products || [])
			} catch (error) {
				console.error('Ошибка загрузки данных:', error)
				setError(error.message || 'Ошибка загрузки данных')
				message.error('Ошибка загрузки товаров')
			} finally {
				setLoading(false)
			}
		}

		fetchBrandAndProducts()
	}, [])

	const filteredProducts = products.filter(product => {
		return (
			product.name.toLowerCase().includes(searchParams.name.toLowerCase()) &&
			product.sku.toLowerCase().includes(searchParams.sku.toLowerCase()) &&
			(searchParams.category
				? product.sub_category_id == searchParams.category
				: true)
		)
	})

	const handleDelete = async productId => {
		try {
			await axios.delete(`${API_BASE_URL}/products/${productId}`)
			message.success('Товар удален')

			// Обновляем список товаров
			if (brandId) {
				const { data } = await axios.get(
					`${API_BASE_URL}/my-product/${brandId}`
				)
				setProducts(data.products || [])
			}
		} catch (error) {
			message.error('Ошибка удаления товара')
			console.error('Ошибка:', error)
		}
	}

	const columns = [
		{
			title: 'Изображение',
			dataIndex: 'images',
			key: 'image',
			render: images => (
				<Image
					width={50}
					src={`http://localhost:8080/static/${images?.[0]?.image_path}`}
					fallback='https://via.placeholder.com/50'
					alt={images?.[0]?.alt_text || 'Product image'}
				/>
			),
		},
		{
			title: 'Название',
			dataIndex: 'name',
			key: 'name',
			render: (text, record) => (
				<div>
					<Text strong>{text}</Text>
					<div>
						<Text type='secondary'>{record.summary}</Text>
					</div>
				</div>
			),
		},
		{
			title: 'Артикул',
			dataIndex: 'sku',
			key: 'sku',
		},
		{
			title: 'Цена',
			dataIndex: 'price',
			key: 'price',
			render: text => (
				<span>
					{text.toLocaleString()}
					<BYNIcon />
				</span>
			),
		},
		{
			title: 'Пол',
			dataIndex: 'gender',
			key: 'gender',
			render: gender => genderMap[gender] || gender,
		},
		{
			title: 'Действия',
			key: 'actions',
			render: (_, record) => (
				<Space size='middle'>
					<Popconfirm
						title='Удалить товар?'
						onConfirm={() => handleDelete(record.id)}
					>
						<Button icon={<DeleteOutlined />} danger />
					</Popconfirm>
				</Space>
			),
		},
	]

	if (error) {
		return (
			<div style={{ padding: 24 }}>
				<Alert message='Ошибка' description={error} type='error' showIcon />
			</div>
		)
	}

	return (
		<div>
			<div className='py-8'>
				<Form layout='inline' style={{ marginBottom: 16, width: '100%' }}>
					<Row gutter={16} style={{ width: '100%' }}>
						<Col flex='auto'>
							<Form.Item style={{ width: '100%' }}>
								<Input
									prefix={<SearchOutlined />}
									placeholder='Поиск по названию'
									value={searchParams.name}
									onChange={e =>
										setSearchParams({ ...searchParams, name: e.target.value })
									}
								/>
							</Form.Item>
						</Col>
						<Col flex='auto'>
							<Form.Item style={{ width: '100%' }}>
								<Input
									placeholder='Поиск по артикулу'
									value={searchParams.sku}
									onChange={e =>
										setSearchParams({ ...searchParams, sku: e.target.value })
									}
								/>
							</Form.Item>
						</Col>
					</Row>
				</Form>

				<Table
					columns={columns}
					dataSource={filteredProducts}
					rowKey='id'
					loading={loading}
					pagination={{ pageSize: 10 }}
					scroll={{ x: true }}
					expandable={{
						expandedRowRender: record => (
							<div style={{ margin: 0 }}>
								<Text strong>Описание:</Text>
								<p>{record.description}</p>
								<Divider style={{ margin: '8px 0' }} />
								<Text strong>Цвет:</Text>
								<p>{record.color}</p>
								<Divider style={{ margin: '8px 0' }} />
								<Text strong>Тип размеров:</Text>
								<p>{record.size_type?.name}</p>
								<Divider style={{ margin: '8px 0' }} />
								<Text strong>Доступные размеры:</Text>
								<p>
									{record.size_type?.sizes?.map(size => (
										<span key={size.id} style={{ marginRight: 8 }}>
											{size.value} ({size.description})
										</span>
									))}
								</p>
							</div>
						),
						rowExpandable: record => record.description || record.color,
					}}
				/>
			</div>
		</div>
	)
}

export default BrandProductsForm
