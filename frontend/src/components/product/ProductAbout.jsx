import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
	Image,
	Button,
	Typography,
	Row,
	Col,
	Space,
	message,
	Skeleton,
	Tabs,
	Tag,
	Descriptions,
	Badge,
	List,
} from 'antd'
import {
	ShoppingCartOutlined,
	HeartOutlined,
	ShareAltOutlined,
	CheckOutlined,
	InfoCircleOutlined,
	UpOutlined,
	DownOutlined,
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

const ProductAbout = () => {
	const { id } = useParams()
	const [product, setProduct] = useState(null)
	const [loading, setLoading] = useState(true)
	const [selectedSize, setSelectedSize] = useState(null)
	const [wishlisted, setWishlisted] = useState(false)
	const [activeTab, setActiveTab] = useState('description')
	const [currentImageIndex, setCurrentImageIndex] = useState(0)
	const [previewVisible, setPreviewVisible] = useState(false)
	const [previewCurrent, setPreviewCurrent] = useState('')
	const [sizesExpanded, setSizesExpanded] = useState(false)

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				setLoading(true)
				const response = await fetch(
					`http://localhost:8080/api/v1/product/${id}`
				)

				if (!response.ok) throw new Error('Товар не найден')

				const data = await response.json()
				setProduct(data)
			} catch (error) {
				message.error(error.message)
			} finally {
				setLoading(false)
			}
		}

		fetchProduct()
	}, [id])

	const handleAddToCart = () => {
		if (product.sizes.length > 0 && !selectedSize) {
			message.warning('Пожалуйста, выберите размер')
			return
		}

		const item = {
			id: product.id,
			name: product.name,
			price: product.price,
			image: product.primary_image,
			size: selectedSize?.size,
			quantity: 1,
		}

		message.success(
			`${product.name} ${
				selectedSize ? `(размер: ${selectedSize.size})` : ''
			} добавлен в корзину`
		)
		// Здесь логика добавления в корзину
	}

	const handleWishlistToggle = () => {
		setWishlisted(!wishlisted)
		message.info(wishlisted ? 'Удалено из избранного' : 'Добавлено в избранное')
	}

	const getImageUrl = path => {
		return path ? `http://localhost:8080/static/${path}` : ''
	}

	const handleImageClick = index => {
		setCurrentImageIndex(index)
	}

	if (loading) {
		return (
			<div className='container mx-auto px-4 py-8'>
				<Skeleton active paragraph={{ rows: 10 }} />
			</div>
		)
	}

	if (!product) {
		return (
			<div className='container mx-auto px-4 py-8 text-center'>
				<Title level={3}>Товар не найден</Title>
				<Button type='primary' onClick={() => window.history.back()}>
					Вернуться назад
				</Button>
			</div>
		)
	}

	// Создаем items для Tabs (новый API Ant Design)
	const tabItems = [
		{
			key: 'description',
			label: 'Описание',
			children: (
				<div className='prose max-w-none'>
					<Title level={4}>Описание товара</Title>
					<Paragraph>{product.description || 'Описание отсутствует'}</Paragraph>

					{product.features && (
						<>
							<Title level={4}>Характеристики</Title>
							<Descriptions bordered column={1}>
								{Object.entries(product.features).map(([key, value]) => (
									<Descriptions.Item label={key} key={key}>
										{value}
									</Descriptions.Item>
								))}
							</Descriptions>
						</>
					)}
				</div>
			),
		},
		{
			key: 'sizes',
			label: 'Размеры',
			children: (
				<div className='prose max-w-none'>
					<Title level={4}>Таблица размеров</Title>
					<Paragraph>Вы выбрали: {selectedSize?.size || 'Не выбран'}</Paragraph>

					{product.sizes?.length > 0 && (
						<List
							dataSource={product.sizes}
							renderItem={size => (
								<List.Item
									extra={
										size.quantity > 0 ? (
											<Badge status='success' text='В наличии' />
										) : (
											<Badge status='error' text='Нет в наличии' />
										)
									}
								>
									<List.Item.Meta
										title={`Размер ${size.size}`}
										description={size.description}
									/>
								</List.Item>
							)}
						/>
					)}
				</div>
			),
		},
	]

	return (
		<div className='container pt-[1%]'>
			<Row gutter={[32, 32]}>
				{/* Блок с изображениями - увеличен до максимума */}
				<Col xs={24} md={16} lg={16}>
					<div className='sticky top-4 w-full'>
						{/* Основные большие изображения (2 шт) - теперь занимают всю доступную высоту */}
						<div className='grid grid-cols-2 gap-4 mb-4 w-full min-h-[70vh]'>
							{' '}
							{/* Используем viewport height */}
							{product.images?.slice(0, 2).map((img, idx) => (
								<div
									key={idx}
									className='overflow-hidden w-full flex items-center justify-center'
									style={{ height: '100%', minHeight: '500px' }}
								>
									<Image
										src={getImageUrl(img)}
										alt={`${product.name} ${idx + 1}`}
										className='w-auto h-auto max-w-full max-h-full object-scale-down cursor-pointer'
										style={{ maxHeight: '70vh' }} // Ограничиваем максимальную высоту
										onClick={() => {
											setPreviewCurrent(getImageUrl(img))
											setPreviewVisible(true)
										}}
									/>
								</div>
							))}
						</div>

						{/* Маленькие изображения (3 шт) - тоже увеличены */}
						{product.images?.length > 2 && (
							<div className='grid grid-cols-3 gap-4 w-full min-h-[300px]'>
								{product.images?.slice(2, 5).map((img, idx) => (
									<div
										key={idx + 2}
										className='overflow-hidden bg-gray-50 w-full flex items-center justify-center'
										style={{ height: '100%', minHeight: '300px' }}
									>
										<Image
											src={getImageUrl(img)}
											alt={`${product.name} ${idx + 3}`}
											className='w-auto h-auto max-w-full max-h-full object-scale-down cursor-pointer'
											style={{ maxHeight: '300px' }}
											onClick={() => {
												setPreviewCurrent(getImageUrl(img))
												setPreviewVisible(true)
											}}
										/>
									</div>
								))}
							</div>
						)}

						{/* Если изображений больше 5 */}
						{product.images?.length > 5 && (
							<div className='mt-4 text-center w-full'>
								<Text type='secondary'>+{product.images.length - 5} фото</Text>
							</div>
						)}
					</div>
				</Col>

				{/* Остальной код остаётся без изменений */}
				<Col xs={24} md={8} lg={8}>
					<div className='space-y-6'>
						<div>
							<Title level={2} className='!mb-2'>
								{product.name}
							</Title>

							<div className='flex items-center space-x-4'>
								<Tag color={product.quantity > 0 ? 'green' : 'red'}>
									{product.quantity > 0 ? 'В наличии' : 'Нет в наличии'}
								</Tag>
							</div>
						</div>

						<div className='bg-gray-50 p-4 rounded-lg'>
							<Title level={3} className='!mb-0 !text-2xl'>
								{product.price.toLocaleString('ru-RU')} BYN
							</Title>

							{product.old_price && (
								<Text delete type='secondary' className='ml-2'>
									{product.old_price.toLocaleString('ru-RU')} BYN
								</Text>
							)}
						</div>

						{/* Блок с размерами с выпадающим списком */}
						{product.sizes?.length > 0 && (
							<div className='border rounded-lg p-4'>
								<div
									className='flex justify-between items-center cursor-pointer'
									onClick={() => setSizesExpanded(!sizesExpanded)}
								>
									<Title level={4} className='!mb-0'>
										Размеры
									</Title>
									{sizesExpanded ? <UpOutlined /> : <DownOutlined />}
								</div>

								{sizesExpanded && (
									<>
										<Button
											type='link'
											icon={<InfoCircleOutlined />}
											className='!p-0 !h-auto'
											onClick={() => setActiveTab('sizes')}
										>
											Таблица размеров
										</Button>

										<div className='grid grid-cols-4 gap-2 mt-4'>
											{product.sizes.map(size => (
												<Button
													key={size.id}
													shape='round'
													type={
														selectedSize?.id === size.id ? 'primary' : 'default'
													}
													disabled={size.quantity === 0}
													onClick={e => {
														e.stopPropagation()
														setSelectedSize(size)
													}}
													className={`relative ${
														size.quantity === 0 ? 'opacity-50' : ''
													}`}
												>
													{size.size}
													{selectedSize?.id === size.id && (
														<CheckOutlined className='absolute -top-1 -right-1 text-xs bg-white text-green-500 rounded-full p-1' />
													)}
													{size.quantity === 0 && (
														<span className='absolute -bottom-5 text-xs text-gray-500'>
															Нет в наличии
														</span>
													)}
												</Button>
											))}
										</div>
									</>
								)}
							</div>
						)}

						{/* Кнопки действий */}
						<div className='flex flex-col space-y-3'>
							<Button
								type='primary'
								size='large'
								icon={<ShoppingCartOutlined />}
								onClick={handleAddToCart}
								disabled={product.sizes?.length > 0 ? !selectedSize : false}
								className='w-full'
							>
								Добавить в корзину
							</Button>

							<div className='flex space-x-3'>
								<Button
									icon={<HeartOutlined />}
									onClick={handleWishlistToggle}
									className={`w-1/2 ${wishlisted ? '!text-red-500' : ''}`}
								>
									{wishlisted ? 'В избранном' : 'В избранное'}
								</Button>

								<Button icon={<ShareAltOutlined />} className='w-1/2'>
									Поделиться
								</Button>
							</div>
						</div>
					</div>
				</Col>
			</Row>

			{/* Детальная информация в табах */}
			<div className='mt-12'>
				<Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
			</div>

			{/* Модальное окно для просмотра изображений */}
			<Image.PreviewGroup
				preview={{
					visible: previewVisible,
					current: previewCurrent,
					onVisibleChange: visible => setPreviewVisible(visible),
					onClose: () => setPreviewVisible(false),
				}}
			>
				{product.images?.map((img, idx) => (
					<Image
						key={idx}
						src={getImageUrl(img)}
						alt={`${product.name} ${idx + 1}`}
						style={{ display: 'none' }}
					/>
				))}
			</Image.PreviewGroup>
		</div>
	)
}

export default ProductAbout
