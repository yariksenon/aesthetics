import React, { useState, useEffect } from 'react'
import {
	Table,
	Button,
	Modal,
	Descriptions,
	Tag,
	Space,
	Card,
	Input,
	Row,
	Col,
	Image,
	Badge,
	Typography,
	Popconfirm,
	Spin,
	message,
} from 'antd'
import { SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import axios from 'axios'
import debounce from 'lodash/debounce'

const { Text } = Typography
const API_BASE_URL = 'http://localhost:8080/api/v1'
const STATIC_URL = 'http://localhost:8080/static'

const Products = ({ history }) => {
	const [products, setProducts] = useState([])
	const [loading, setLoading] = useState(false)
	const [selectedProduct, setSelectedProduct] = useState(null)
	const [isViewModalVisible, setIsViewModalVisible] = useState(false)
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 12,
		total: 0,
		totalPages: 1,
	})
	const [searchParams, setSearchParams] = useState({
		name: '',
		brand: '',
	})
	const [detailLoading, setDetailLoading] = useState(false)

	// Debounced fetchProducts to prevent excessive API calls
	const debouncedFetchProducts = debounce((page, pageSize, search) => {
		fetchProducts(page, pageSize, search)
	}, 300)

	// Fetch all products with search parameters
	const fetchProducts = async (page = 1, pageSize = 12, search = {}) => {
		setLoading(true)
		try {
			const response = await axios.get(`${API_BASE_URL}/products`, {
				params: {
					page,
					limit: pageSize,
					name: search.name?.trim() || undefined,
					brand: search.brand?.trim() || undefined,
				},
			})

			const fetchedProducts = response.data.products || []
			setProducts(fetchedProducts)
			setPagination({
				current: response.data.pagination?.page || 1,
				pageSize: response.data.pagination?.limit || 12,
				total: response.data.pagination?.total || 0,
				totalPages: response.data.pagination?.total_pages || 1,
			})

			if (fetchedProducts.length === 0) {
				message.info('Товары не найдены по заданным критериям')
			}
		} catch (error) {
			console.error('Error fetching products:', error)
			message.error('Не удалось загрузить товары')
		} finally {
			setLoading(false)
		}
	}

	// Fetch product details
	const fetchProductDetails = async productId => {
		setDetailLoading(true)
		try {
			const response = await axios.get(`${API_BASE_URL}/product/${productId}`)
			setSelectedProduct(response.data)
			setIsViewModalVisible(true)
		} catch (error) {
			console.error('Error fetching product details:', error)
			message.error('Не удалось загрузить детали товара')
		} finally {
			setDetailLoading(false)
		}
	}

	// Delete a product
	const deleteProduct = async productId => {
		setLoading(true)
		try {
			await axios.delete(`${API_BASE_URL}/product/${productId}`)
			message.success('Товар успешно удален')
			await fetchProducts(pagination.current, pagination.pageSize, searchParams)
		} catch (error) {
			console.error('Error deleting product:', error)
			message.error(error.response?.data?.error || 'Не удалось удалить товар')
		} finally {
			setLoading(false)
		}
	}

	const handleTableChange = pagination => {
		fetchProducts(pagination.current, pagination.pageSize, searchParams)
	}

	const handleBack = () => {
		// Если компонент используется с react-router
		if (history) {
			history.goBack()
		} else {
			// Или другая логика возврата
			window.history.back()
		}
	}

	useEffect(() => {
		fetchProducts()
	}, [])

	const getGenderTag = gender => {
		switch (gender) {
			case 'women':
				return <Tag color='pink'>Женский</Tag>
			case 'men':
				return <Tag color='blue'>Мужской</Tag>
			default:
				return <Tag color='cyan'>Унисекс</Tag>
		}
	}

	const getAvailabilityTag = quantity => {
		return quantity > 0 ? (
			<Badge status='success' text={`В наличии (${quantity})`} />
		) : (
			<Badge status='error' text='Нет в наличии' />
		)
	}

	const columns = [
		{
			title: 'Изображение',
			dataIndex: 'image_paths',
			key: 'image',
			width: 100,
			render: images =>
				images?.length > 0 ? (
					<Image
						src={`${STATIC_URL}/${images[0]}`}
						alt='Товар'
						width={60}
						height={60}
						style={{ objectFit: 'cover' }}
						preview={false}
					/>
				) : (
					<div style={{ width: 60, height: 60, background: '#f0f0f0' }} />
				),
		},
		{
			title: 'Название и описание',
			key: 'name',
			render: (_, record) => (
				<div>
					<Text strong>{record.name}</Text>
					<br />
					<Text type='secondary'>{record.summary}</Text>
				</div>
			),
		},
		{
			title: 'Бренд',
			dataIndex: 'brand_name',
			key: 'brand',
			render: text => (text ? <Tag color='blue'>{text}</Tag> : '—'),
		},
		{
			title: 'Категории',
			key: 'categories',
			render: (_, record) => (
				<div>
					<div>{record.category}</div>
					<Text type='secondary'>{record.sub_category}</Text>
				</div>
			),
		},
		{
			title: 'Цена и SKU',
			key: 'price_sku',
			render: (_, record) => (
				<div>
					<Text strong style={{ color: '#389e0d' }}>
						{record.price?.toFixed(2)} BYN
					</Text>
					<br />
					<Text code>{record.sku}</Text>
				</div>
			),
		},
		{
			title: 'Характеристики',
			key: 'specs',
			render: (_, record) => (
				<div>
					{getGenderTag(record.gender)}
					<br />
					<Tag color='purple'>{record.color}</Tag>
				</div>
			),
		},
		{
			title: 'Размеры',
			key: 'sizes',
			render: (_, record) => (
				<Space size={[0, 4]} wrap>
					{record.sizes?.map(size => (
						<Tag key={size.id} color={size.quantity > 0 ? 'blue' : 'default'}>
							{size.value}
						</Tag>
					))}
				</Space>
			),
		},
		{
			title: 'Действия',
			key: 'actions',
			width: 150,
			fixed: 'right',
			render: (_, record) => (
				<Space size='small' direction='vertical'>
					<Button
						onClick={() => fetchProductDetails(record.id)}
						type='link'
						size='small'
						block
					>
						Подробнее
					</Button>
					<Popconfirm
						title='Удалить этот товар?'
						onConfirm={() => deleteProduct(record.id)}
						okText='Да'
						cancelText='Нет'
						okButtonProps={{ danger: true }}
					>
						<Button danger type='text' size='small' block>
							Удалить
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	]

	return (
		<div className='p-6'>
			<Card
				title={
					<div className='flex items-center justify-between'>
						<div className='flex items-center'>
							<Button
								type='text'
								icon={<ArrowLeftOutlined />}
								onClick={handleBack}
								className='mr-2'
							/>
							<h1 className='text-xl font-bold text-gray-800 m-0'>
								Управление товарами
							</h1>
						</div>
					</div>
				}
				className='shadow-sm'
				bordered={false}
			>
				<Spin spinning={loading}>
					<Table
						columns={columns}
						dataSource={products}
						rowKey='id'
						scroll={{ x: 1500 }}
						pagination={{
							current: pagination.current,
							pageSize: pagination.pageSize,
							total: pagination.total,
							showSizeChanger: true,
							pageSizeOptions: ['12', '24', '50', '100'],
							showTotal: total => `Всего ${total} товаров`,
						}}
						onChange={handleTableChange}
						bordered
						size='middle'
						locale={{ emptyText: 'Товары не найдены' }}
					/>
				</Spin>
			</Card>

			{/* Product Details Modal */}
			<Modal
				title={<span className='text-lg font-semibold'>Детали товара</span>}
				open={isViewModalVisible}
				onCancel={() => setIsViewModalVisible(false)}
				footer={[
					<Button
						key='close'
						onClick={() => setIsViewModalVisible(false)}
						type='primary'
					>
						Закрыть
					</Button>,
				]}
				width={900}
				centered
			>
				<Spin spinning={detailLoading}>
					{selectedProduct && (
						<div className='mt-6'>
							<Row gutter={24}>
								<Col xs={24} md={12}>
									<Card title='Изображения' className='mb-4' bordered={false}>
										<Image.PreviewGroup>
											<Row gutter={[16, 16]}>
												{selectedProduct.image_paths?.map((image, index) => (
													<Col key={index} xs={12} sm={8} md={12} lg={8}>
														<Image
															src={`${STATIC_URL}/${image}`}
															alt={`Изображение ${index + 1}`}
															style={{ borderRadius: 4 }}
														/>
													</Col>
												))}
											</Row>
										</Image.PreviewGroup>
									</Card>
								</Col>
								<Col xs={24} md={12}>
									<Descriptions
										title='Основная информация'
										column={1}
										className='mb-4'
										bordered
									>
										<Descriptions.Item
											label='Название'
											labelStyle={{ fontWeight: 500 }}
										>
											{selectedProduct.name}
										</Descriptions.Item>
										<Descriptions.Item
											label='Бренд'
											labelStyle={{ fontWeight: 500 }}
										>
											{selectedProduct.brand_name ? (
												<Tag color='blue'>{selectedProduct.brand_name}</Tag>
											) : (
												'—'
											)}
										</Descriptions.Item>
										<Descriptions.Item
											label='Категория'
											labelStyle={{ fontWeight: 500 }}
										>
											{selectedProduct.category || '—'}
										</Descriptions.Item>
										<Descriptions.Item
											label='Подкатегория'
											labelStyle={{ fontWeight: 500 }}
										>
											{selectedProduct.sub_category || '—'}
										</Descriptions.Item>
										<Descriptions.Item
											label='Описание'
											labelStyle={{ fontWeight: 500 }}
										>
											{selectedProduct.description || '—'}
										</Descriptions.Item>
										<Descriptions.Item
											label='Краткое описание'
											labelStyle={{ fontWeight: 500 }}
										>
											{selectedProduct.summary || '—'}
										</Descriptions.Item>
										<Descriptions.Item
											label='Цвет'
											labelStyle={{ fontWeight: 500 }}
										>
											{selectedProduct.color ? (
												<Tag color='purple'>{selectedProduct.color}</Tag>
											) : (
												'—'
											)}
										</Descriptions.Item>
										<Descriptions.Item
											label='SKU'
											labelStyle={{ fontWeight: 500 }}
										>
											<Text code>{selectedProduct.sku}</Text>
										</Descriptions.Item>
										<Descriptions.Item
											label='Цена'
											labelStyle={{ fontWeight: 500 }}
										>
											<Text strong type='success'>
												{selectedProduct.price?.toFixed(2)} BYN
											</Text>
										</Descriptions.Item>
										<Descriptions.Item
											label='Пол'
											labelStyle={{ fontWeight: 500 }}
										>
											{getGenderTag(selectedProduct.gender)}
										</Descriptions.Item>
									</Descriptions>
								</Col>
							</Row>

							<Card title='Доступные размеры' className='mt-4' bordered={false}>
								<Table
									dataSource={selectedProduct.sizes}
									rowKey='id'
									pagination={false}
									columns={[
										{
											title: 'Размер',
											dataIndex: 'value',
											key: 'size',
											width: 100,
										},
										{
											title: 'Описание',
											dataIndex: 'description',
											key: 'description',
										},
										{
											title: 'Наличие',
											dataIndex: 'quantity',
											key: 'quantity',
											width: 150,
											render: quantity => getAvailabilityTag(quantity),
										},
									]}
									size='small'
								/>
							</Card>
						</div>
					)}
				</Spin>
			</Modal>
		</div>
	)
}

export default Products
