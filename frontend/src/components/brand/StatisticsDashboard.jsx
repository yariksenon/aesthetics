import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
	Card,
	Row,
	Col,
	Statistic,
	Table,
	Spin,
	message,
	Typography,
	Alert,
} from 'antd'
import {
	ShoppingOutlined,
	DollarOutlined,
	TagOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const API_BASE_URL = 'http://localhost:8080/api/v1'

const StatisticsDashboard = () => {
	const [stats, setStats] = useState(null)
	const [products, setProducts] = useState([])
	const [loading, setLoading] = useState({
		stats: true,
		products: true,
	})
	const [error, setError] = useState(null)
	const [userId, setUserId] = useState(null)
	const [brandId, setBrandId] = useState(null)

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading({ stats: true, products: true })

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

				// Загружаем статистику и товары
				const [statsResponse, productsResponse] = await Promise.all([
					axios.get(`${API_BASE_URL}/statistics/${userBrand.id}`),
					axios.get(`${API_BASE_URL}/my-product/${userBrand.id}`),
				])

				setStats(statsResponse.data)
				setProducts(productsResponse.data.products || [])
			} catch (error) {
				console.error('Ошибка загрузки данных:', error)
				setError(error.message || 'Ошибка загрузки данных')
				message.error('Ошибка загрузки статистики')
			} finally {
				setLoading({ stats: false, products: false })
			}
		}

		fetchData()
	}, [])

	const handleDeleteProduct = async productId => {
		try {
			await axios.delete(`${API_BASE_URL}/products/${productId}`)
			message.success('Товар успешно удален')

			// Обновляем список товаров
			if (brandId) {
				const { data } = await axios.get(
					`${API_BASE_URL}/my-product/${brandId}`
				)
				setProducts(data.products || [])
			}
		} catch (error) {
			message.error('Ошибка при удалении товара')
			console.error('Ошибка удаления:', error)
		}
	}

	const columns = [
		{
			title: 'Товар',
			dataIndex: 'name',
			key: 'name',
			render: (text, record) => (
				<div>
					<Text strong>{text}</Text>
					<br />
					<Text type='secondary'>SKU: {record.sku}</Text>
				</div>
			),
		},
		{
			title: 'Цена',
			dataIndex: 'price',
			key: 'price',
			render: price => `${price.toLocaleString()} BYN`,
			align: 'right',
			sorter: (a, b) => a.price - b.price,
		},
		{
			title: 'Категория',
			dataIndex: 'sub_category_id',
			key: 'category',
			render: () => 'Категория', // Замените на реальные данные
		},
		{
			title: 'Действия',
			key: 'actions',
			render: (_, record) => (
				<a
					onClick={() => handleDeleteProduct(record.id)}
					style={{ color: '#ff4d4f' }}
				>
					Удалить
				</a>
			),
		},
	]

	const topProductsColumns = [
		{
			title: 'Топ товары',
			dataIndex: 'name',
			key: 'name',
			render: (text, record) => (
				<div>
					<Text strong>{text}</Text>
					<br />
					<Text type='secondary'>SKU: {record.sku}</Text>
				</div>
			),
		},
		{
			title: 'Продано',
			dataIndex: 'units_sold',
			key: 'units_sold',
			align: 'center',
		},
		{
			title: 'Выручка',
			dataIndex: 'product_revenue',
			key: 'product_revenue',
			render: value => `${value.toLocaleString()} BYN`,
			align: 'right',
		},
	]

	if (error) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
				<Alert message='Ошибка' description={error} type='error' showIcon />
			</div>
		)
	}

	if (loading.stats || loading.products) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
				<Spin size='large' tip='Загрузка данных...' />
			</div>
		)
	}

	return (
		<div>
			<Title level={2}>Аналитика бренда</Title>

			{/* Статистические карточки */}
			<Row gutter={16} style={{ marginBottom: 24 }}>
				<Col span={8}>
					<Card>
						<Statistic
							title='Выручка'
							value={stats?.completed.total_revenue || 0}
							prefix={<DollarOutlined />}
							valueStyle={{ color: '#3f8600' }}
							suffix='BYN'
						/>
					</Card>
				</Col>
				<Col span={8}>
					<Card>
						<Statistic
							title='Продано товаров'
							value={stats?.completed.total_items || 0}
							prefix={<ShoppingOutlined />}
						/>
					</Card>
				</Col>
				<Col span={8}>
					<Card>
						<Statistic
							title='Завершенные заказы'
							value={stats?.completed.total_orders || 0}
							prefix={<TagOutlined />}
						/>
					</Card>
				</Col>
			</Row>

			{/* Топ товаров */}
			{stats?.top_products?.length > 0 && (
				<Card title='Топ продаж' style={{ marginBottom: 24 }} bordered={false}>
					<Table
						columns={topProductsColumns}
						dataSource={stats.top_products}
						rowKey='product_id'
						pagination={false}
					/>
				</Card>
			)}
		</div>
	)
}

export default StatisticsDashboard
