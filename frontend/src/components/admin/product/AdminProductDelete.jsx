import React, { useState, useEffect } from 'react'
import {
	Table,
	Button,
	Modal,
	message,
	Popconfirm,
	Input,
	Spin,
	Tag,
	Space,
	Image,
	Typography,
} from 'antd'
import {
	DeleteOutlined,
	ExclamationCircleOutlined,
	SearchOutlined,
	InfoCircleOutlined,
} from '@ant-design/icons'
import axios from 'axios'

const { Search } = Input
const { confirm } = Modal
const { Text } = Typography

const AdminProductDelete = () => {
	const [products, setProducts] = useState([])
	const [filteredProducts, setFilteredProducts] = useState([])
	const [loading, setLoading] = useState(false)
	const [searchText, setSearchText] = useState('')
	const [selectedRowKeys, setSelectedRowKeys] = useState([])
	const [deleteManyLoading, setDeleteManyLoading] = useState(false)

	// Загрузка товаров
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
		if (!value) {
			setFilteredProducts(products)
		} else {
			const filtered = products.filter(
				product =>
					product.name.toLowerCase().includes(value.toLowerCase()) ||
					product.sku.toLowerCase().includes(value.toLowerCase()) ||
					product.id.toString().includes(value)
			)
			setFilteredProducts(filtered)
		}
	}

	// Удаление одного товара
	const handleDelete = async productId => {
		confirm({
			title: 'Подтверждение удаления',
			icon: <ExclamationCircleOutlined style={{ color: 'red' }} />,
			content: (
				<div>
					<p>Вы уверены, что хотите удалить этот товар?</p>
					<Text type='warning'>
						<InfoCircleOutlined /> Это действие нельзя отменить.
					</Text>
				</div>
			),
			okText: 'Удалить',
			okType: 'danger',
			cancelText: 'Отмена',
			onOk: async () => {
				try {
					await axios.delete(
						`http://localhost:8080/api/v1/admin/products/${productId}`
					)
					message.success('Товар успешно удален')
					fetchProducts()
				} catch (error) {
					const errorMsg =
						error.response?.data?.error || 'Ошибка при удалении товара'
					if (errorMsg.includes('order items')) {
						message.error('Нельзя удалить товар, который есть в заказах')
					} else {
						message.error(errorMsg)
					}
					console.error('Error deleting product:', error)
				}
			},
		})
	}

	// Массовое удаление
	const handleDeleteMany = () => {
		if (selectedRowKeys.length === 0) {
			message.warning('Выберите товары для удаления')
			return
		}

		confirm({
			title: `Удалить ${selectedRowKeys.length} товаров?`,
			icon: <ExclamationCircleOutlined style={{ color: 'red' }} />,
			content: (
				<div>
					<p>Вы уверены, что хотите удалить выбранные товары?</p>
					<Text type='warning'>
						<InfoCircleOutlined /> Это действие нельзя отменить.
					</Text>
				</div>
			),
			okText: 'Удалить',
			okType: 'danger',
			cancelText: 'Отмена',
			onOk: async () => {
				setDeleteManyLoading(true)
				try {
					await Promise.all(
						selectedRowKeys.map(id =>
							axios.delete(`http://localhost:8080/api/v1/admin/products/${id}`)
						)
					)
					message.success(`Удалено ${selectedRowKeys.length} товаров`)
					setSelectedRowKeys([])
					fetchProducts()
				} catch (error) {
					message.error('Ошибка при массовом удалении')
					console.error('Error deleting products:', error)
				} finally {
					setDeleteManyLoading(false)
				}
			},
		})
	}

	// Выбор строк
	const rowSelection = {
		selectedRowKeys,
		onChange: keys => setSelectedRowKeys(keys),
		getCheckboxProps: record => ({
			disabled: record.quantity > 0, // Можно добавить другие условия блокировки
		}),
	}

	// Колонки таблицы
	const columns = [
		{
			title: 'ID',
			dataIndex: 'id',
			key: 'id',
			width: 80,
			sorter: (a, b) => a.id - b.id,
		},
		{
			title: 'Изображение',
			key: 'image',
			width: 100,
			render: (_, record) => (
				<Image
					width={64}
					height={64}
					style={{ objectFit: 'cover' }}
					src={
						record.image_path
							? `http://localhost:8080/static/${record.image_path}`
							: null
					}
					fallback='https://via.placeholder.com/64?text=No+Image'
					alt={record.name}
					preview={false}
				/>
			),
		},
		{
			title: 'Название',
			dataIndex: 'name',
			key: 'name',
			sorter: (a, b) => a.name.localeCompare(b.name),
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
			render: (price, record) =>
				`${price.toFixed(2)} ${record.currency || 'USD'}`,
			width: 120,
			sorter: (a, b) => a.price - b.price,
		},
		{
			title: 'Количество',
			dataIndex: 'quantity',
			key: 'quantity',
			width: 120,
			render: quantity => (
				<Tag color={quantity > 0 ? 'green' : 'red'}>
					{quantity > 0 ? `В наличии: ${quantity}` : 'Нет в наличии'}
				</Tag>
			),
			sorter: (a, b) => a.quantity - b.quantity,
		},
		{
			title: 'Категория',
			key: 'category',
			render: (_, record) => (
				<Space direction='vertical' size={0}>
					<Text strong>{record.category_name || '-'}</Text>
					<Text type='secondary'>{record.sub_category_name || ''}</Text>
				</Space>
			),
		},
		{
			title: 'Действия',
			key: 'actions',
			width: 100,
			render: (_, record) => (
				<Popconfirm
					title='Удалить товар?'
					description='Это действие нельзя отменить'
					onConfirm={() => handleDelete(record.id)}
					okText='Удалить'
					cancelText='Отмена'
					okButtonProps={{ danger: true }}
					disabled={record.quantity > 0}
				>
					<Button
						danger
						icon={<DeleteOutlined />}
						disabled={record.quantity > 0}
						title={record.quantity > 0 ? 'Нельзя удалить товар в наличии' : ''}
					/>
				</Popconfirm>
			),
		},
	]

	return (
		<div className='p-4 bg-white rounded-lg shadow'>
			<div className='flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4'>
				<div>
					<h1 className='text-2xl font-bold'>Управление товарами</h1>
					<Text type='secondary'>Всего товаров: {products.length}</Text>
				</div>

				<Space>
					{selectedRowKeys.length > 0 && (
						<Button
							danger
							icon={<DeleteOutlined />}
							loading={deleteManyLoading}
							onClick={handleDeleteMany}
						>
							Удалить выбранные ({selectedRowKeys.length})
						</Button>
					)}

					<Search
						placeholder='Поиск по ID, названию или артикулу'
						allowClear
						enterButton={<SearchOutlined />}
						size='large'
						style={{ width: 300 }}
						onSearch={handleSearch}
						onChange={e => handleSearch(e.target.value)}
						value={searchText}
					/>
				</Space>
			</div>

			<Spin spinning={loading}>
				<Table
					columns={columns}
					dataSource={filteredProducts}
					rowKey='id'
					rowSelection={{
						type: 'checkbox',
						...rowSelection,
					}}
					pagination={{
						pageSize: 10,
						showSizeChanger: true,
						showTotal: total => `Всего ${total} товаров`,
					}}
					scroll={{ x: true }}
					bordered
					locale={{
						emptyText: searchText
							? 'Товары не найдены'
							: 'Нет товаров для отображения',
					}}
				/>
			</Spin>

			<div className='mt-4 p-4 bg-gray-50 rounded'>
				<Space>
					<ExclamationCircleOutlined style={{ color: '#faad14' }} />
					<Text type='warning'>
						Товары с количеством больше 0 нельзя удалить. Сначала обнулите
						остатки.
					</Text>
				</Space>
			</div>
		</div>
	)
}

export default AdminProductDelete
