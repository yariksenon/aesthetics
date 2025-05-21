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
	ArrowUpOutlined,
	ArrowDownOutlined,
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

	useEffect(() => {
		const storedUserId = localStorage.getItem('userId')
		const parsedUserId = storedUserId ? parseInt(storedUserId, 10) : null

		if (!storedUserId || isNaN(parsedUserId)) {
			setError('Пользователь не авторизован или ID пользователя недействителен')
			setLoading({ stats: false, products: false })
			return
		}

		setUserId(parsedUserId)

		const fetchStatistics = async () => {
			try {
				const { data } = await axios.get(
					`${API_BASE_URL}/statistics/${parsedUserId}`
				)
				setStats(data)
			} catch (error) {
				message.error('Не удалось загрузить статистику')
				console.error('Ошибка загрузки статистики:', error)
			} finally {
				setLoading(prev => ({ ...prev, stats: false }))
			}
		}

		const fetchProducts = async () => {
			try {
				const { data } = await axios.get(
					`${API_BASE_URL}/my-product/${parsedUserId}`
				)
				setProducts(data.products || [])
			} catch (error) {
				message.error('Не удалось загрузить товары')
				console.error('Ошибка загрузки товаров:', error)
			} finally {
				setLoading(prev => ({ ...prev, products: false }))
			}
		}

		fetchStatistics()
		fetchProducts()
	}, [])

	const handleDeleteProduct = async productId => {
		try {
			await axios.delete(`${API_BASE_URL}/products/${productId}`)
			message.success('Товар успешно удален')
			const { data } = await axios.get(`${API_BASE_URL}/my-product/${userId}`)
			setProducts(data.products || [])
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
		<div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
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
