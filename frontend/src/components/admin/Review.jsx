import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	Table,
	Button,
	message,
	Typography,
	Spin,
	Tag,
	Space,
	Modal,
} from 'antd'
import {
	CheckOutlined,
	DeleteOutlined,
	EyeOutlined,
	ArrowLeftOutlined,
} from '@ant-design/icons'

const { Title } = Typography

const Review = () => {
	const [reviews, setReviews] = useState([])
	const [products, setProducts] = useState([])
	const [loading, setLoading] = useState(false)
	const [approving, setApproving] = useState(null)
	const [deleting, setDeleting] = useState(null)
	const navigate = useNavigate()

	useEffect(() => {
		fetchData()
	}, [])

	const fetchData = async () => {
		setLoading(true)
		try {
			// Получаем продукты
			const productsResponse = await fetch(
				'http://localhost:8080/api/v1/products'
			)
			if (!productsResponse.ok) throw new Error('Не удалось загрузить продукты')
			const productsData = await productsResponse.json()
			setProducts(productsData.products)

			// Собираем отзывы со статусом pending
			let allReviews = []
			for (const product of productsData.products) {
				const reviewsResponse = await fetch(
					`http://localhost:8080/api/v1/reviews/${product.id}`
				)
				if (!reviewsResponse.ok) continue

				const productReviews = await reviewsResponse.json()
				// Проверяем, что productReviews не null и является массивом
				if (productReviews && Array.isArray(productReviews)) {
					allReviews = [
						...allReviews,
						...productReviews
							.filter(review => review.status === 'pending')
							.map(review => ({
								...review,
								product_name: product.name,
							})),
					]
				}
			}

			setReviews(allReviews)
		} catch (error) {
			message.error(error.message || 'Не удалось загрузить данные')
		} finally {
			setLoading(false)
		}
	}

	const handleApproveReview = async reviewId => {
		setApproving(reviewId)
		try {
			const response = await fetch(
				`http://localhost:8080/api/v1/admin/reviews/${reviewId}/approve`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
				}
			)

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(errorText || 'Не удалось одобрить отзыв')
			}

			const data = await response.json()

			setReviews(prev => prev.filter(review => review.id !== reviewId))
			message.success('Отзыв успешно одобрен')
		} catch (error) {
			console.error('Ошибка:', error)
			message.error(error.message || 'Не удалось одобрить отзыв')
		} finally {
			setApproving(null)
		}
	}

	const handleDeleteReview = async reviewId => {
		setDeleting(reviewId)
		try {
			const response = await fetch(
				`http://localhost:8080/api/v1/admin/reviews/${reviewId}`,
				{
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
					},
				}
			)

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Не удалось удалить отзыв')
			}

			setReviews(prev => prev.filter(review => review.id !== reviewId))
			message.success('Отзыв успешно удалён')
		} catch (error) {
			message.error(error.message || 'Не удалось удалить отзыв')
		} finally {
			setDeleting(null)
		}
	}

	const handleViewProduct = productId => {
		navigate(`/product/${productId}`)
	}

	const handleBack = () => {
		navigate(-1) // Navigate to the previous page
	}

	const columns = [
		{
			title: 'ID',
			dataIndex: 'id',
			key: 'id',
			width: 80,
		},
		{
			title: 'Продукт',
			dataIndex: 'product_id',
			key: 'product_id',
			render: (productId, record) => (
				<Button
					type='link'
					icon={<EyeOutlined />}
					onClick={() => handleViewProduct(productId)}
				>
					{record.product_name || `Продукт #${productId}`}
				</Button>
			),
		},
		{
			title: 'Пользователь',
			dataIndex: 'user_id',
			key: 'user_id',
			render: userId => `Пользователь #${userId}`,
		},
		{
			title: 'Содержимое',
			dataIndex: 'content',
			key: 'content',
			render: content => (
				<div
					style={{
						maxWidth: 300,
						whiteSpace: 'pre-wrap',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
					}}
				>
					{content?.length > 100
						? `${content.slice(0, 100)}...`
						: content || '—'}
				</div>
			),
		},
		{
			title: 'Рейтинг',
			dataIndex: 'rating',
			key: 'rating',
			render: rating => `${rating}/5`,
		},
		{
			title: 'Дата создания',
			dataIndex: 'created_at',
			key: 'created_at',
			render: date => new Date(date).toLocaleDateString('ru-RU'),
		},
		{
			title: 'Статус',
			dataIndex: 'status',
			key: 'status',
			render: () => <Tag color='orange'>Ожидает</Tag>,
		},
		{
			title: 'Действия',
			key: 'actions',
			render: (_, record) => (
				<Space>
					<Button
						type='primary'
						icon={<CheckOutlined />}
						loading={approving === record.id}
						onClick={() => {
							Modal.confirm({
								title: 'Одобрить отзыв',
								content: 'Вы уверены, что хотите одобрить этот отзыв?',
								onOk: () => handleApproveReview(record.id),
								okText: 'Одобрить',
								cancelText: 'Отмена',
							})
						}}
					>
						Одобрить
					</Button>
					<Button
						danger
						icon={<DeleteOutlined />}
						loading={deleting === record.id}
						onClick={() => {
							Modal.confirm({
								title: 'Удалить отзыв',
								content: 'Вы уверены, что хотите удалить этот отзыв?',
								onOk: () => handleDeleteReview(record.id),
								okText: 'Удалить',
								cancelText: 'Отмена',
								okButtonProps: { danger: true },
							})
						}}
					>
						Удалить
					</Button>
				</Space>
			),
		},
	]

	return (
		<div className='container mx-auto px-4 py-8'>
			<div className='flex items-center mb-6'>
				<Button
					icon={<ArrowLeftOutlined />}
					onClick={handleBack}
					className='mr-4'
				>
					Назад
				</Button>
				<Title level={2}>Ожидающие отзывы</Title>
			</div>
			{loading ? (
				<div className='flex justify-center'>
					<Spin size='large' />
				</div>
			) : (
				<Table
					columns={columns}
					dataSource={reviews}
					rowKey='id'
					locale={{
						emptyText:
							reviews.length === 0 ? 'Нет ожидающих отзывов' : 'Нет данных',
					}}
					pagination={{ pageSize: 10 }}
					scroll={{ x: true }}
				/>
			)}
		</div>
	)
}

export default Review
