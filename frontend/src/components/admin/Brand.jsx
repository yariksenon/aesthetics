import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, message, Space, Input } from 'antd'
import {
	EyeOutlined,
	CheckOutlined,
	CloseOutlined,
	DeleteOutlined,
	RollbackOutlined,
	ArrowLeftOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Brand = () => {
	const [pendingBrands, setPendingBrands] = useState([])
	const [approvedBrands, setApprovedBrands] = useState([])
	const [loading, setLoading] = useState({ pending: true, approved: true })
	const [selectedBrand, setSelectedBrand] = useState(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [pendingSearch, setPendingSearch] = useState('')
	const [approvedSearch, setApprovedSearch] = useState('')
	const navigate = useNavigate()

	const fetchBrands = async (endpoint, setter, loadingKey) => {
		setLoading(prev => ({ ...prev, [loadingKey]: true }))
		try {
			const response = await axios.get(
				`http://45.12.74.28:8080/api/v1/admin/brand/${endpoint}`
			)
			setter(response.data || [])
		} catch (error) {
			message.error(
				`Ошибка загрузки ${
					loadingKey === 'pending' ? 'ожидающих' : 'одобренных'
				} брендов`
			)
			setter([])
		} finally {
			setLoading(prev => ({ ...prev, [loadingKey]: false }))
		}
	}

	useEffect(() => {
		fetchBrands('pending', setPendingBrands, 'pending')
		fetchBrands('approved', setApprovedBrands, 'approved')
	}, [])

	const fetchBrandById = async id => {
		try {
			const response = await axios.get(
				`http://45.12.74.28:8080/api/v1/admin/brand/${id}`
			)
			setSelectedBrand(response.data)
			setIsModalOpen(true)
		} catch (error) {
			message.error('Ошибка загрузки данных бренда')
		}
	}

	const handleApprove = async id => {
		try {
			await axios.put(
				`http://45.12.74.28:8080/api/v1/admin/brand/${id}/approve`
			)
			message.success('Бренд успешно принят')
			fetchBrands('pending', setPendingBrands, 'pending')
			fetchBrands('approved', setApprovedBrands, 'approved')
		} catch (error) {
			message.error('Ошибка принятия бренда')
		}
	}

	const handleReject = async id => {
		try {
			await axios.put(`http://45.12.74.28:8080/api/v1/admin/brand/${id}/reject`)
			message.success('Бренд успешно отклонён')
			fetchBrands('pending', setPendingBrands, 'pending')
			fetchBrands('approved', setApprovedBrands, 'approved')
		} catch (error) {
			message.error('Ошибка отклонения бренда')
		}
	}

	const handleDelete = async id => {
		try {
			await axios.delete(`http://45.12.74.28:8080/api/v1/admin/brand/${id}`)
			message.success('Бренд успешно удалён')
			fetchBrands('pending', setPendingBrands, 'pending')
			fetchBrands('approved', setApprovedBrands, 'approved')
		} catch (error) {
			message.error('Ошибка удаления бренда')
		}
	}

	const columns = [
		{
			title: 'Название',
			dataIndex: 'name',
			key: 'name',
			render: (text, record) => (
				<span
					className={`font-medium ${
						record.status === 'approved'
							? 'text-gray-800'
							: record.status === 'rejected'
							? 'text-gray-500 line-through'
							: 'text-gray-600'
					}`}
				>
					{text}
				</span>
			),
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
			render: email => <span className='text-gray-600'>{email}</span>,
		},
		{
			title: 'Статус',
			dataIndex: 'status',
			key: 'status',
			render: status => {
				let displayStatus = ''
				let className = ''
				switch (status) {
					case 'approved':
						displayStatus = 'Принят'
						className = 'bg-green-100 text-green-800 px-2 py-1 rounded'
						break
					case 'rejected':
						displayStatus = 'Отклонён'
						className = 'bg-gray-200 text-gray-600 px-2 py-1 rounded'
						break
					case 'pending':
						displayStatus = 'Ожидает'
						className = 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded'
						break
					default:
						displayStatus = status
						className = 'text-gray-800'
				}
				return <span className={className}>{displayStatus}</span>
			},
		},
		{
			title: 'Действия',
			key: 'actions',
			render: (_, record) => (
				<Space size='middle'>
					<Button
						icon={<EyeOutlined />}
						onClick={() => fetchBrandById(record.id)}
						type='text'
						className='text-gray-700 hover:text-black'
					/>
					{record.status === 'pending' && (
						<>
							<Button
								icon={<CheckOutlined />}
								onClick={() => handleApprove(record.id)}
								type='text'
								className='text-gray-700 hover:text-green-600'
							/>
							<Button
								icon={<CloseOutlined />}
								onClick={() => handleReject(record.id)}
								type='text'
								className='text-gray-700 hover:text-red-600'
							/>
						</>
					)}
					{record.status === 'approved' && (
						<>
							<Button
								icon={<RollbackOutlined />}
								onClick={() => handleReject(record.id)}
								type='text'
								className='text-gray-700 hover:text-yellow-600'
							/>
							<Button
								icon={<DeleteOutlined />}
								onClick={() => handleDelete(record.id)}
								type='text'
								className='text-gray-700 hover:text-red-600'
							/>
						</>
					)}
				</Space>
			),
		},
	]

	const handleModalClose = () => {
		setIsModalOpen(false)
		setSelectedBrand(null)
	}

	const filteredPendingBrands = pendingBrands.filter(brand =>
		brand.name.toLowerCase().includes(pendingSearch.toLowerCase())
	)

	const filteredApprovedBrands = approvedBrands.filter(brand =>
		brand.name.toLowerCase().includes(approvedSearch.toLowerCase())
	)

	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='bg-white border-b border-gray-200 p-4 shadow-sm'>
				<div className='flex flex-col space-y-2'>
					<Button
						icon={<ArrowLeftOutlined />}
						onClick={() => navigate(-1)}
						className='flex items-center text-gray-700 hover:text-black border-none shadow-none self-start'
					>
						Назад
					</Button>
					<h1 className='text-xl font-semibold text-gray-800 self-start'>
						Управление брендами
					</h1>
				</div>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 p-6'>
				{/* Pending Brands */}
				<div className='bg-white border border-gray-200 rounded-lg shadow-sm'>
					<div className='flex justify-between items-center border-b border-gray-200 p-4'>
						<h2 className='text-lg font-medium text-gray-800'>
							Ожидающие бренды
						</h2>
						<Input
							value={pendingSearch}
							onChange={e => setPendingSearch(e.target.value)}
							placeholder='Поиск по названию'
							className='w-64 border-gray-300 focus:border-gray-400'
							allowClear
						/>
					</div>
					<Table
						columns={columns}
						dataSource={filteredPendingBrands}
						loading={loading.pending}
						rowKey='id'
						pagination={{ pageSize: 5 }}
						className='border-none'
						rowClassName='hover:bg-gray-50'
					/>
				</div>

				{/* Approved Brands */}
				<div className='bg-white border border-gray-200 rounded-lg shadow-sm'>
					<div className='flex justify-between items-center border-b border-gray-200 p-4'>
						<h2 className='text-lg font-medium text-gray-800'>
							Одобренные бренды
						</h2>
						<Input
							value={approvedSearch}
							onChange={e => setApprovedSearch(e.target.value)}
							placeholder='Поиск по названию'
							className='w-64 border-gray-300 focus:border-gray-400'
							allowClear
						/>
					</div>
					<Table
						columns={columns}
						dataSource={filteredApprovedBrands}
						loading={loading.approved}
						rowKey='id'
						pagination={{ pageSize: 5 }}
						className='border-none'
						rowClassName='hover:bg-gray-50'
					/>
				</div>
			</div>

			{/* Brand Details Modal */}
			<Modal
				title={<span className='text-gray-800'>Детали бренда</span>}
				open={isModalOpen}
				onCancel={handleModalClose}
				footer={null}
				centered
				className='[&_.ant-modal-content]:bg-white [&_.ant-modal-header]:bg-white'
			>
				{selectedBrand && (
					<div className='space-y-4'>
						<div className='space-y-2'>
							<h3 className='text-lg font-medium text-gray-800'>
								{selectedBrand.name}
							</h3>
							<p className='text-gray-600'>
								{selectedBrand.description || 'Нет описания'}
							</p>
						</div>

						<div className='grid grid-cols-2 gap-4'>
							<div>
								<p className='text-sm text-gray-500'>ID</p>
								<p className='text-gray-800'>{selectedBrand.id}</p>
							</div>
							<div>
								<p className='text-sm text-gray-500'>Пользователь ID</p>
								<p className='text-gray-800'>{selectedBrand.user_id}</p>
							</div>
							<div>
								<p className='text-sm text-gray-500'>Email</p>
								<p className='text-gray-800'>{selectedBrand.email}</p>
							</div>
							<div>
								<p className='text-sm text-gray-500'>Статус</p>
								<p
									className={`${
										selectedBrand.status === 'approved'
											? 'text-green-600'
											: selectedBrand.status === 'rejected'
											? 'text-gray-500'
											: 'text-yellow-600'
									}`}
								>
									{selectedBrand.status === 'approved'
										? 'Принят'
										: selectedBrand.status === 'rejected'
										? 'Отклонён'
										: 'Ожидает'}
								</p>
							</div>
						</div>

						{selectedBrand.website && (
							<div>
								<p className='text-sm text-gray-500'>Вебсайт</p>
								<a
									href={selectedBrand.website}
									target='_blank'
									rel='noopener noreferrer'
									className='text-gray-800 hover:text-gray-600 underline'
								>
									{selectedBrand.website}
								</a>
							</div>
						)}

						<div className='pt-4 border-t border-gray-200'>
							<p className='text-sm text-gray-500'>Дата создания</p>
							<p className='text-gray-800'>{selectedBrand.created_at}</p>
						</div>
					</div>
				)}
			</Modal>
		</div>
	)
}

export default Brand
