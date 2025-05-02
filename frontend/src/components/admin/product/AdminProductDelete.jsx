import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, message, Popconfirm, Input, Spin } from 'antd'
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import axios from 'axios'

const { Search } = Input
const { confirm } = Modal

const AdminProductDelete = () => {
	const [products, setProducts] = useState([])
	const [filteredProducts, setFilteredProducts] = useState([])
	const [loading, setLoading] = useState(false)
	const [searchText, setSearchText] = useState('')

	// Загрузка товаров при монтировании
	useEffect(() => {
		fetchProducts()
	}, [])

	const fetchProducts = async () => {
		setLoading(true)
		try {
			const response = await axios.get(
				'http://localhost:8080/api/v1/admin/products'
			)
			setProducts(response.data)
			setFilteredProducts(response.data)
		} catch (error) {
			message.error('Ошибка загрузки товаров')
			console.error('Error fetching products:', error)
		} finally {
			setLoading(false)
		}
	}

	// Поиск товаров
	const handleSearch = value => {
		setSearchText(value)
		if (value === '') {
			setFilteredProducts(products)
		} else {
			const filtered = products.filter(
				product =>
					product.name.toLowerCase().includes(value.toLowerCase()) ||
					product.sku.toLowerCase().includes(value.toLowerCase())
			)
			setFilteredProducts(filtered)
		}
	}

	// Удаление товара
	const handleDelete = async productId => {
		confirm({
			title: 'Вы уверены, что хотите удалить этот товар?',
			icon: <ExclamationCircleOutlined style={{ color: 'red' }} />,
			content:
				'Это действие нельзя отменить. Все данные о товаре будут удалены.',
			okText: 'Да, удалить',
			okType: 'danger',
			cancelText: 'Отмена',
			onOk: async () => {
				try {
					await axios.delete(
						`http://localhost:8080/api/v1/admin/products/${productId}`
					)
					message.success('Товар успешно удален')
					fetchProducts() // Обновляем список после удаления
				} catch (error) {
					if (error.response?.data?.error?.includes('order items')) {
						message.error('Нельзя удалить товар, который есть в заказах')
					} else {
						message.error('Ошибка при удалении товара')
					}
					console.error('Error deleting product:', error)
				}
			},
		})
	}

	// Колонки таблицы
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
				<div className='flex items-center'>
					{record.image_path && (
						<img
							src={`http://localhost:8080/uploads/${record.image_path}`}
							alt={text}
							className='w-10 h-10 object-cover mr-3'
						/>
					)}
					<span>{text}</span>
				</div>
			),
		},
		{
			title: 'Артикул',
			dataIndex: 'sku',
			key: 'sku',
			width: 150,
		},
		{
			title: 'Цена',
			dataIndex: 'price',
			key: 'price',
			render: price => `${price} ${products[0]?.currency || 'USD'}`,
			width: 120,
		},
		{
			title: 'Категория',
			key: 'category',
			render: (_, record) => (
				<div>
					<div>{record.category_name}</div>
					{record.sub_category_name && (
						<div className='text-xs text-gray-500'>
							{record.sub_category_name}
						</div>
					)}
				</div>
			),
		},
		{
			title: 'Действие',
			key: 'action',
			width: 100,
			render: (_, record) => (
				<Popconfirm
					title='Удалить товар?'
					description='Вы уверены, что хотите удалить этот товар?'
					onConfirm={() => handleDelete(record.id)}
					okText='Да'
					cancelText='Нет'
					okButtonProps={{ danger: true }}
				>
					<Button
						danger
						icon={<DeleteOutlined />}
						disabled={record.quantity > 0} // Можно добавить проверку на наличие в заказах
					/>
				</Popconfirm>
			),
		},
	]

	return (
		<div className='p-4'>
			<div className='flex justify-between items-center mb-4'>
				<h1 className='text-2xl font-bold'>Управление товарами</h1>
				<Search
					placeholder='Поиск по названию или артикулу'
					allowClear
					enterButton
					style={{ width: 300 }}
					onSearch={handleSearch}
					onChange={e => handleSearch(e.target.value)}
					value={searchText}
				/>
			</div>

			<Spin spinning={loading}>
				<Table
					columns={columns}
					dataSource={filteredProducts}
					rowKey='id'
					pagination={{ pageSize: 10 }}
					scroll={{ x: true }}
					bordered
					locale={{
						emptyText: searchText
							? 'Товары не найдены'
							: 'Нет товаров для отображения',
					}}
				/>
			</Spin>

			<div className='mt-4 text-sm text-gray-500'>
				<ExclamationCircleOutlined className='mr-2' />
				Для удаления товара нажмите на значок корзины в соответствующей строке
			</div>
		</div>
	)
}

export default AdminProductDelete
