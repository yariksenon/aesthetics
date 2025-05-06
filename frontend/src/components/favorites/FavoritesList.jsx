import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	Card,
	Button,
	Spin,
	Empty,
	message,
	Modal,
	Typography,
	Space,
} from 'antd'
import {
	HeartFilled,
	ShoppingCartOutlined,
	DeleteOutlined,
} from '@ant-design/icons'
import { useCart } from '../../context/CartContext'

const { Title, Text } = Typography

const WishlistPage = () => {
	const [userId, setUserId] = useState(null)
	const [wishlistItems, setWishlistItems] = useState([])
	const [loading, setLoading] = useState(true)
	const [deletingId, setDeletingId] = useState(null)
	const { addToCart } = useCart()
	const navigate = useNavigate()

	// Стили
	const styles = {
		container: {
			padding: '24px',
			maxWidth: '1200px',
			margin: '0',
			minHeight: '100vh',
		},
		header: {
			marginBottom: '32px',
			textAlign: 'center',
		},
		grid: {
			display: 'grid',
			gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
			gap: '24px',
			padding: '16px 0',
		},
		card: {
			borderRadius: '8px',
			overflow: 'hidden',
			boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
			border: '1px solid #e8e8e8',
			transition: 'all 0.3s ease',
			background: '#fff',
			'&:hover': {
				boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
				transform: 'translateY(-4px)',
			},
		},
		imageContainer: {
			position: 'relative',
			paddingTop: '100%',
			overflow: 'hidden',
			background: '#f0f0f0',
		},
		image: {
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			objectFit: 'cover',
			filter: 'grayscale(20%)',
			transition: 'filter 0.3s ease',
			'&:hover': {
				filter: 'grayscale(0%)',
			},
		},
		actionButton: {
			border: 'none',
			background: 'rgba(255, 255, 255, 0.9)',
			boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
		},
		priceText: {
			fontWeight: 600,
			fontSize: '16px',
			color: '#000',
		},
		emptyContainer: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			height: '60vh',
		},
	}

	useEffect(() => {
		const storedUserId = localStorage.getItem('userId')
		if (!storedUserId) {
			message.error('Пожалуйста, войдите в систему')
			navigate('/login')
			return
		}
		setUserId(storedUserId)
	}, [navigate])

	const fetchWishlist = async () => {
		if (!userId) return

		setLoading(true)
		try {
			const response = await fetch(
				`http://localhost:8080/api/v1/wishlist/${userId}`
			)
			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Ошибка загрузки списка желаний')
			}
			const data = await response.json()
			setWishlistItems(data.items || [])
		} catch (error) {
			message.error(error.message)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (userId) {
			fetchWishlist()
		}
	}, [userId])

	const handleRemoveFromWishlist = async productId => {
		setDeletingId(productId)
		try {
			const response = await fetch(
				`http://localhost:8080/api/v1/wishlist/${userId}/${productId}`,
				{ method: 'DELETE' }
			)

			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.error || 'Не удалось удалить товар')
			}

			message.success(result.message)
			setWishlistItems(prev => prev.filter(item => item.id !== productId))
		} catch (error) {
			message.error(error.message)
		} finally {
			setDeletingId(null)
		}
	}

	const confirmRemove = (productId, productName) => {
		Modal.confirm({
			title: 'Подтверждение удаления',
			content: `Вы уверены, что хотите удалить "${productName}" из списка желаний?`,
			okText: 'Удалить',
			cancelText: 'Отмена',
			okButtonProps: { danger: true },
			onOk: () => handleRemoveFromWishlist(productId),
		})
	}

	const handleAddToCart = async (product, e) => {
		e.stopPropagation()
		try {
			await addToCart({ product_id: product.id, quantity: 1 })
			message.success(`${product.name} добавлен в корзину!`)
		} catch (error) {
			message.error(error.message || 'Не удалось добавить товар в корзину')
		}
	}

	if (!userId || loading) {
		return (
			<div style={{ ...styles.emptyContainer, height: '100vh' }}>
				<Spin size='large' />
			</div>
		)
	}

	if (!wishlistItems.length) {
		return (
			<div style={styles.emptyContainer}>
				<Empty
					description={
						<Space direction='vertical' size='middle'>
							<Text style={{ fontSize: '18px', color: '#666' }}>
								Ваш список желаний пуст
							</Text>
							<Button
								type='primary'
								size='large'
								style={{ background: '#000', borderColor: '#000' }}
								onClick={() => navigate('/products')}
							>
								Перейти к товарам
							</Button>
						</Space>
					}
					imageStyle={{ height: 120 }}
				/>
			</div>
		)
	}

	return (
		<div style={styles.container}>
			<div style={styles.grid}>
				{wishlistItems.map(product => (
					<Card
						key={product.id}
						hoverable
						style={styles.card}
						onClick={() => navigate(`/product/${product.id}`)}
						cover={
							<div style={styles.imageContainer}>
								<img
									alt={product.name}
									src={`http://localhost:8080/static/${product.image_path}`}
									style={styles.image}
									onError={e =>
										(e.target.src =
											'https://placehold.co/600x400?text=No+Image')
									}
								/>
							</div>
						}
						actions={[
							<Button
								icon={<DeleteOutlined />}
								shape='circle'
								size='large'
								style={styles.actionButton}
								loading={deletingId === product.id}
								onClick={e => {
									e.stopPropagation()
									confirmRemove(product.id, product.name)
								}}
							/>,
							<Button
								icon={<ShoppingCartOutlined />}
								shape='circle'
								size='large'
								style={styles.actionButton}
								onClick={e => handleAddToCart(product, e)}
							/>,
						]}
					>
						<Card.Meta
							title={
								<Text ellipsis={{ tooltip: product.name }}>{product.name}</Text>
							}
							description={
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
									}}
								>
									<Text style={styles.priceText}>
										{product.price.toFixed(2)} руб.
									</Text>
								</div>
							}
						/>
					</Card>
				))}
			</div>
		</div>
	)
}

export default WishlistPage
