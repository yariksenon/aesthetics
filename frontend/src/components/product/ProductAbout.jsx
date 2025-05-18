import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
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
	Collapse,
	Form,
	Input,
	Rate,
	Avatar,
	Divider,
} from 'antd'
import {
	ShoppingCartOutlined,
	HeartOutlined,
	HeartFilled,
	ShareAltOutlined,
	CheckOutlined,
	InfoCircleOutlined,
	UpOutlined,
	DownOutlined,
} from '@ant-design/icons'

const { Title, Text, Paragraph, Link } = Typography
const { Panel } = Collapse
const { TextArea } = Input

const ProductAbout = () => {
	const { id } = useParams()
	const [product, setProduct] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [selectedSize, setSelectedSize] = useState(null)
	const [favorites, setFavorites] = useState([])
	const [processingFavorite, setProcessingFavorite] = useState(false)
	const [activeTab, setActiveTab] = useState('description')
	const [previewVisible, setPreviewVisible] = useState(false)
	const [previewCurrent, setPreviewCurrent] = useState('')
	const [reviews, setReviews] = useState([])
	const [reviewLoading, setReviewLoading] = useState(false)
	const { addToCart } = useCart()
	const navigate = useNavigate()
	const location = useLocation()
	const [form] = Form.useForm()

	const userId = localStorage.getItem('userId')

	const calculateAverageRating = () => {
		if (!reviews?.length) return 0
		const sum = reviews.reduce((total, review) => total + review.rating, 0)
		return (sum / reviews.length).toFixed(1)
	}

	const calculateTotalQuantity = () => {
		if (!product?.sizes) return 0
		return product.sizes.reduce((sum, size) => sum + size.quantity, 0)
	}

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true)
				setError(null)

				const productResponse = await fetch(
					`http://localhost:8080/api/v1/product/${id}`
				)
				if (!productResponse.ok) throw new Error('Товар не найден')
				const productData = await productResponse.json()
				setProduct(productData)

				if (productData.sizes?.length > 0) {
					const availableSize = productData.sizes.find(
						size => size.quantity > 0
					)
					if (availableSize) {
						setSelectedSize(availableSize)
					}
				}

				if (userId) {
					try {
						const favoritesResponse = await fetch(
							`http://localhost:8080/api/v1/wishlist/${userId}`
						)
						if (favoritesResponse.ok) {
							const favoritesData = await favoritesResponse.json()
							setFavorites(
								Array.isArray(favoritesData?.items)
									? favoritesData.items.map(item => item.id)
									: []
							)
						}
					} catch (favoritesError) {
						console.error('Ошибка загрузки избранного:', favoritesError.message)
					}
				}

				const reviewsResponse = await fetch(
					`http://localhost:8080/api/v1/reviews/${id}`
				)
				if (reviewsResponse.ok) {
					const reviewsData = await reviewsResponse.json()
					setReviews(
						Array.isArray(reviewsData)
							? reviewsData.filter(review => review.status === 'published')
							: []
					)
				}
			} catch (err) {
				setError(err.message)
				message.error(err.message)
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [id, userId, location.search])

	const handleAddToCart = async e => {
		e.stopPropagation()
		if (!product) return

		if (product.sizes?.length > 0 && !selectedSize) {
			message.warning('Пожалуйста, выберите размер')
			return
		}

		if (selectedSize && selectedSize.quantity <= 0) {
			message.error('Выбранный размер отсутствует в наличии')
			return
		}

		try {
			await addToCart({
				product_id: product.id,
				quantity: 1,
				size_id: selectedSize?.id,
			})
			message.success(
				`${product.name} ${
					selectedSize ? `(размер: ${selectedSize.size})` : ''
				} добавлен в корзину!`
			)
			window.location.reload()
		} catch (error) {
			message.error(error.message || 'Не удалось добавить товар в корзину')
		}
	}

	const handleShare = () => {
		if (navigator.share) {
			navigator
				.share({
					title: product.name,
					text: `Посмотрите этот товар: ${product.name}`,
					url: window.location.href,
				})
				.catch(error => console.log('Error sharing:', error))
		} else {
			navigator.clipboard
				.writeText(window.location.href)
				.then(() => {
					message.success('Ссылка скопирована в буфер обмена')
				})
				.catch(err => {
					console.error('Failed to copy: ', err)
					message.error('Не удалось скопировать ссылку')
				})
		}
	}

	const handleWishlistToggle = async e => {
		e.stopPropagation()
		if (!product) return

		if (!userId) {
			message.error('Войдите в систему, чтобы добавлять товары в избранное')
			navigate('/login')
			return
		}

		setProcessingFavorite(true)
		try {
			const isFavorite = favorites.includes(product.id)
			const url = `http://localhost:8080/api/v1/wishlist/${userId}/${product.id}`
			const method = isFavorite ? 'DELETE' : 'POST'

			const response = await fetch(url, { method })
			if (!response.ok) throw new Error('Ошибка при обновлении избранного')

			setFavorites(prev =>
				isFavorite
					? prev.filter(id => id !== product.id)
					: [...prev, product.id]
			)
			message.success(
				isFavorite ? 'Товар удалён из избранного' : 'Товар добавлен в избранное'
			)
		} catch (error) {
			message.error(error.message)
		} finally {
			setProcessingFavorite(false)
		}
	}

	const handleReviewSubmit = async values => {
		if (!userId) {
			message.error('Войдите в систему, чтобы оставить отзыв')
			navigate('/login')
			return
		}

		try {
			setReviewLoading(true)
			const response = await fetch(
				`http://localhost:8080/api/v1/reviews/${userId}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						product_id: parseInt(id),
						content: values.content,
						rating: values.rating,
					}),
				}
			)

			if (!response.ok) throw new Error('Не удалось отправить отзыв')

			form.resetFields()
			message.success('Отзыв отправлен на модерацию')

			const reviewsResponse = await fetch(
				`http://localhost:8080/api/v1/reviews/${id}`
			)
			if (reviewsResponse.ok) {
				const reviewsData = await reviewsResponse.json()
				setReviews(
					Array.isArray(reviewsData)
						? reviewsData.filter(review => review.status === 'published')
						: []
				)
			}
		} catch (error) {
			message.error(error.message || 'Не удалось отправить отзыв')
		} finally {
			setReviewLoading(false)
		}
	}

	const getImageUrl = path => {
		return path ? `http://localhost:8080/static/${path}` : ''
	}

	const tabItems = [
		{
			key: 'description',
			label: 'Описание',
			children: (
				<div className='prose max-w-none'>
					{product?.summary && (
						<>
							<Title level={4}>Краткое описание</Title>
							<Paragraph>{product.summary}</Paragraph>
						</>
					)}

					<Title level={4}>Описание товара</Title>
					<Paragraph>
						{product?.description || 'Описание отсутствует'}
					</Paragraph>

					{product?.features && (
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
					<Paragraph>
						Общее количество: {calculateTotalQuantity()} шт.
					</Paragraph>

					{product?.sizes?.length > 0 ? (
						<List
							dataSource={product.sizes}
							renderItem={size => (
								<List.Item
									extra={
										<Space>
											<Text>{size.quantity} шт.</Text>
											{size.quantity > 0 ? (
												<Badge status='success' text='В наличии' />
											) : (
												<Badge status='error' text='Нет в наличии' />
											)}
										</Space>
									}
								>
									<List.Item.Meta
										title={`Размер ${size.size}`}
										description={size.description}
									/>
								</List.Item>
							)}
						/>
					) : (
						<Paragraph>Информация о размерах отсутствует</Paragraph>
					)}
				</div>
			),
		},
		{
			key: 'reviews',
			label: `Отзывы (${reviews.length})`,
			children: (
				<div className='prose max-w-none'>
					<Title level={4}>Оставить отзыв</Title>
					<Form
						form={form}
						onFinish={handleReviewSubmit}
						layout='vertical'
						disabled={reviewLoading}
					>
						<Form.Item
							name='rating'
							label='Оценка'
							rules={[
								{ required: true, message: 'Пожалуйста, выберите оценку' },
							]}
						>
							<Rate allowHalf />
						</Form.Item>
						<Form.Item
							name='content'
							label='Ваш отзыв'
							rules={[
								{ required: true, message: 'Пожалуйста, напишите отзыв' },
							]}
						>
							<TextArea
								rows={4}
								placeholder='Поделитесь вашим мнением о товаре'
							/>
						</Form.Item>
						<Form.Item>
							<Button type='primary' htmlType='submit' loading={reviewLoading}>
								Отправить отзыв
							</Button>
						</Form.Item>
					</Form>

					<Divider />

					<Title level={4}>Отзывы покупателей</Title>
					{reviews.length === 0 ? (
						<Paragraph>Отзывы отсутствуют</Paragraph>
					) : (
						<List
							loading={reviewLoading}
							dataSource={reviews}
							renderItem={review => (
								<List.Item>
									<List.Item.Meta
										avatar={<Avatar>{review.user_id.toString()[0]}</Avatar>}
										title={
											<Space>
												<Text strong>Пользователь #{review.user_id}</Text>
												<Rate disabled allowHalf value={review.rating} />
											</Space>
										}
										description={
											<>
												<Paragraph>{review.content}</Paragraph>
												<Text type='secondary'>
													{new Date(review.created_at).toLocaleDateString(
														'ru-RU'
													)}
												</Text>
											</>
										}
									/>
								</List.Item>
							)}
						/>
					)}
				</div>
			),
		},
		{
			key: 'brand',
			label: 'О бренде',
			children: (
				<div className='prose max-w-none'>
					<Title level={4}>О бренде {product?.brand?.name || ''}</Title>
					<Paragraph>
						{product?.brand?.description || 'Описание бренда отсутствует'}
					</Paragraph>
					{product?.brand?.website ? (
						<Paragraph>
							<strong>Веб-сайт: </strong>
							<Link
								href={product.brand.website}
								target='_blank'
								rel='noopener noreferrer'
							>
								{product.brand.website}
							</Link>
						</Paragraph>
					) : (
						<Paragraph>Веб-сайт бренда отсутствует</Paragraph>
					)}
				</div>
			),
		},
	]

	if (loading) {
		return (
			<div className='container mx-auto px-4 py-8'>
				<Skeleton active paragraph={{ rows: 10 }} />
			</div>
		)
	}

	if (error || !product) {
		return (
			<div className='container mx-auto px-4 py-8 text-center'>
				<Title level={3}>{error || 'Товар не найден'}</Title>
				<Button type='primary' onClick={() => navigate(-1)}>
					Вернуться назад
				</Button>
			</div>
		)
	}

	return (
		<div className='container pt-[1%]'>
			<Row gutter={[32, 32]}>
				<Col xs={24} md={16} lg={16}>
					<div className='sticky top-4 w-full'>
						{product.images?.length > 0 ? (
							<>
								<div className='grid grid-cols-2 gap-4 mb-4 w-full min-h-[70vh]'>
									{product.images.slice(0, 2).map((img, idx) => (
										<div
											key={idx}
											className='overflow-hidden w-full flex items-center justify-center'
											style={{ height: '100%', minHeight: '500px' }}
										>
											<Image
												src={getImageUrl(img)}
												alt={`${product.name} ${idx + 1}`}
												className='w-auto h-auto max-w-full max-h-full object-scale-down cursor-pointer'
												style={{ maxHeight: '70vh' }}
												onClick={() => {
													setPreviewCurrent(getImageUrl(img))
													setPreviewVisible(true)
												}}
											/>
										</div>
									))}
								</div>

								{product.images.length > 2 && (
									<div className='grid grid-cols-3 gap-4 w-full min-h-[300px]'>
										{product.images.slice(2, 5).map((img, idx) => (
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

								{product.images.length > 5 && (
									<div className='mt-4 text-center w-full'>
										<Text type='secondary'>
											+{product.images.length - 5} фото
										</Text>
									</div>
								)}
							</>
						) : (
							<div className='w-full h-[500px] bg-gray-100 flex items-center justify-center'>
								<Text type='secondary'>Изображения отсутствуют</Text>
							</div>
						)}
					</div>
				</Col>

				<Col xs={24} md={8} lg={8}>
					<div className='space-y-6'>
						<div>
							{reviews.length > 0 && (
								<div className='flex items-center'>
									<Rate
										disabled
										allowHalf
										value={parseFloat(calculateAverageRating())}
										className='text-sm mr-2 text-black'
									/>
									<Text>{reviews.length} отзыва</Text>
								</div>
							)}

							{product.brand?.name && (
								<Title level={4} className='!mb-1 text-gray-600'>
									{product.brand.name}
								</Title>
							)}

							<Title level={2} className='!mb-2'>
								{product.name}
							</Title>

							<div className='flex items-center space-x-4'>
								<Tag color={calculateTotalQuantity() > 0 ? 'green' : 'red'}>
									{calculateTotalQuantity() > 0
										? `В наличии (${calculateTotalQuantity()} шт.)`
										: 'Нет в наличии'}
								</Tag>
							</div>
						</div>

						<div className='bg-gray-50 p-4 rounded-lg'>
							<Title level={3} className='!mb-0 !text-2xl'>
								{product.price?.toLocaleString('ru-RU')} BYN
							</Title>

							{product.old_price && (
								<Text delete type='secondary' className='ml-2'>
									{product.old_price.toLocaleString('ru-RU')} BYN
								</Text>
							)}
						</div>

						{product.sizes?.length > 0 && (
							<Collapse
								bordered={false}
								expandIcon={({ isActive }) =>
									isActive ? <UpOutlined /> : <DownOutlined />
								}
								className='bg-white'
							>
								<Panel
									header={
										<Title level={4} className='!mb-0'>
											Размеры
										</Title>
									}
									key='sizes'
									extra={
										selectedSize && (
											<Text strong>Выбрано: {selectedSize.size}</Text>
										)
									}
								>
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
								</Panel>
							</Collapse>
						)}

						<div className='flex flex-col space-y-3'>
							<Button
								type='primary'
								size='large'
								icon={<ShoppingCartOutlined />}
								onClick={handleAddToCart}
								disabled={
									product.sizes?.length > 0
										? !selectedSize || selectedSize.quantity <= 0
										: calculateTotalQuantity() <= 0
								}
								className='w-full'
							>
								{calculateTotalQuantity() > 0
									? 'Добавить в корзину'
									: 'Нет в наличии'}
							</Button>

							<div className='flex space-x-3'>
								<Button
									icon={
										favorites.includes(product.id) ? (
											<HeartFilled style={{ color: '#ff4d4f' }} />
										) : (
											<HeartOutlined />
										)
									}
									loading={processingFavorite}
									onClick={handleWishlistToggle}
									className='w-1/2'
								>
									{favorites.includes(product.id)
										? 'В избранном'
										: 'В избранное'}
								</Button>

								<Button
									icon={<ShareAltOutlined />}
									onClick={handleShare}
									className='w-1/2'
								>
									Поделиться
								</Button>
							</div>
						</div>
					</div>
				</Col>
			</Row>

			<div className='mt-12'>
				<Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
			</div>

			{product.images?.length > 0 && (
				<Image.PreviewGroup
					preview={{
						visible: previewVisible,
						current: previewCurrent,
						onVisibleChange: visible => setPreviewVisible(visible),
						onClose: () => setPreviewVisible(false),
					}}
				>
					{product.images.map((img, idx) => (
						<Image
							key={idx}
							src={getImageUrl(img)}
							alt={`${product.name} ${idx + 1}`}
							style={{ display: 'none' }}
						/>
					))}
				</Image.PreviewGroup>
			)}
		</div>
	)
}

export default ProductAbout
