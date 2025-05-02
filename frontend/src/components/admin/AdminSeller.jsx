import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Table, Spin, message, Button, Space, Tag, Modal } from 'antd'

const AdminSeller = () => {
	const [sellers, setSellers] = useState([])
	const [loading, setLoading] = useState(true)
	const [approvingId, setApprovingId] = useState(null)

	useEffect(() => {
		fetchSellers()
	}, [])

	const fetchSellers = async () => {
		try {
			const response = await axios.get(
				'http://localhost:8080/api/v1/admin/seller'
			)
			setSellers(response.data)
		} catch (error) {
			console.error('Ошибка загрузки продавцов:', error)
			message.error('Ошибка загрузки списка продавцов')
		} finally {
			setLoading(false)
		}
	}

	const approveSeller = async sellerId => {
		setApprovingId(sellerId)
		try {
			await axios.put(
				`http://localhost:8080/api/v1/admin/seller/${sellerId}/approve`
			)
			message.success('Продавец успешно подтвержден!')

			// Оптимизированное обновление списка
			setSellers(prevSellers =>
				prevSellers.map(seller =>
					seller.id === sellerId
						? { ...seller, seller_status: 'approved' }
						: seller
				)
			)
		} catch (error) {
			console.error('Ошибка подтверждения:', error)
			message.error(
				error.response?.data?.message || 'Ошибка при подтверждении продавца'
			)
		} finally {
			setApprovingId(null)
		}
	}

	const handleApprove = sellerId => {
		Modal.confirm({
			title: 'Подтверждение продавца',
			content: 'Вы уверены, что хотите подтвердить этого продавца?',
			okText: 'Подтвердить',
			cancelText: 'Отмена',
			onOk: () => approveSeller(sellerId),
		})
	}

	const columns = [
		{ title: 'ID', dataIndex: 'id', key: 'id' },
		{ title: 'Имя', dataIndex: 'first_name', key: 'first_name' },
		{ title: 'Фамилия', dataIndex: 'last_name', key: 'last_name' },
		{ title: 'Email', dataIndex: 'email', key: 'email' },
		{ title: 'Телефон', dataIndex: 'phone', key: 'phone' },
		{
			title: 'Статус',
			key: 'status',
			render: (_, record) => (
				<Tag color={record.seller_status === 'approved' ? 'green' : 'orange'}>
					{record.seller_status === 'approved' ? 'Подтвержден' : 'Ожидает'}
				</Tag>
			),
		},
		{
			title: 'Логотип',
			key: 'logo',
			render: (_, record) =>
				record.logo_path ? (
					<img
						src={`http://localhost:8080/static/seller/${record.logo_path
							.split('/')
							.pop()}`}
						alt='Логотип магазина'
						style={{
							width: 50,
							height: 50,
							objectFit: 'cover',
							borderRadius: '50%',
						}}
						onError={e => {
							e.target.onerror = null
							e.target.src = 'https://placehold.co/600x400'
						}}
					/>
				) : (
					<div
						style={{
							width: 50,
							height: 50,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: '#f0f0f0',
							borderRadius: '50%',
						}}
					>
						<span>Нет фото</span>
					</div>
				),
		},
		{ title: 'Дата регистрации', dataIndex: 'created_at', key: 'created_at' },
		{
			title: 'Действия',
			key: 'actions',
			render: (_, record) => (
				<Space size='middle'>
					{record.seller_status === 'pending' && (
						<Button
							type='primary'
							onClick={() => handleApprove(record.id)}
							loading={approvingId === record.id}
							disabled={approvingId !== null}
						>
							Подтвердить
						</Button>
					)}
				</Space>
			),
		},
	]

	return (
		<div className='max-w-6xl mx-auto p-6 bg-white rounded-lg shadow'>
			<h2 className='text-2xl font-bold mb-6'>Список продавцов</h2>
			<Table
				dataSource={sellers}
				columns={columns}
				rowKey='id'
				loading={loading}
				pagination={{ pageSize: 10 }}
				scroll={{ x: true }}
			/>
		</div>
	)
}

export default AdminSeller
