import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Tag, Image, Spin, message, Space } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import axios from 'axios'

const API_BASE_URL = 'http://45.12.74.28:8080/api/v1/admin'

const AdminProductView = () => {
	const [loading, setLoading] = useState(true)
	const [products, setProducts] = useState([])
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0,
	})
	const navigate = useNavigate()

	const fetchProducts = async (params = {}) => {
		try {
			setLoading(true)
			const response = await axios.get(`${API_BASE_URL}/products`, {
				params: {
					page: params.pagination?.current || 1,
					pageSize: params.pagination?.pageSize || 10,
				},
			})

			setProducts(response.data.products || [])
			setPagination({
				...params.pagination,
				total: response.data.total || 0,
			})
		} catch (error) {
			console.error('Ошибка при загрузке товаров:', error)
			message.error('Ошибка при загрузке товаров')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchProducts({ pagination })
	}, [])

	const handleDelete = async id => {
		try {
			await axios.delete(`${API_BASE_URL}/products/${id}`)
			message.success('Товар удален')
			fetchProducts({ pagination })
		} catch (error) {
			message.error('Ошибка при удалении')
			console.error(error)
		}
	}

	const handleTableChange = newPagination => {
		fetchProducts({
			pagination: newPagination,
		})
	}

	const columns = [
		{
			title: 'ID',
			dataIndex: 'id',
			key: 'id',
			width: 80,
		},
		{
			title: 'Название',
			dataIndex: 'name',
			key: 'name',
			render: (text, record) => (
				<Space>
					{record.image_path && (
						<Image
							src={`http://45.12.74.28:8080/static/products/${record.image_path
								.split('/')
								.pop()}`}
							width={50}
							height={50}
							style={{ objectFit: 'cover' }}
							preview={false}
						/>
					)}
					{text}
				</Space>
			),
		},
		{
			title: 'Цена',
			dataIndex: 'price',
			key: 'price',
			render: price => `${price}`,
			align: 'right',
			width: 100,
		},
		{
			title: 'Категория',
			key: 'category',
			render: (_, record) => (
				<div>
					<div>{record.category_name}</div>
					{record.sub_category_name && (
						<div style={{ fontSize: 12, color: '#888' }}>
							{record.sub_category_name}
						</div>
					)}
				</div>
			),
		},
		{
			title: 'Пол',
			dataIndex: 'gender',
			key: 'gender',
			render: gender => {
				switch (gender) {
					case 'male':
						return <Tag color='blue'>Мужской</Tag>
					case 'female':
						return <Tag color='pink'>Женский</Tag>
					case 'unisex':
						return <Tag color='purple'>Унисекс</Tag>
					default:
						return <Tag>{gender || 'Не указан'}</Tag>
				}
			},
			width: 120,
		},
		{
			title: 'Действия',
			key: 'actions',
			width: 120,
			render: (_, record) => (
				<Space>
					<Button
						icon={<EditOutlined />}
						onClick={() => navigate(`/admin/products/edit/${record.id}`)}
					/>
					<Button
						danger
						icon={<DeleteOutlined />}
						onClick={() => handleDelete(record.id)}
					/>
				</Space>
			),
		},
	]

	return (
		<div style={{ padding: 24 }}>
			<div style={{ marginBottom: 16 }}>
				<Button
					type='primary'
					icon={<PlusOutlined />}
					onClick={() => navigate('/admin/products/add')}
				>
					Добавить товар
				</Button>
			</div>

			<Table
				columns={columns}
				dataSource={products}
				rowKey='id'
				loading={loading}
				pagination={pagination}
				onChange={handleTableChange}
				scroll={{ x: 800 }}
				locale={{
					emptyText: 'Товаров не найдено',
				}}
			/>
		</div>
	)
}

export default AdminProductView
