import React, { useState, useEffect } from 'react'
import {
	Table,
	Button,
	Modal,
	Form,
	Input,
	message,
	Popconfirm,
	Space,
} from 'antd'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

const UserAddress = () => {
	const [addresses, setAddresses] = useState([])
	const [loading, setLoading] = useState(false)
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [editingAddress, setEditingAddress] = useState(null)
	const [form] = Form.useForm()
	const navigate = useNavigate()

	const API_URL = 'http://localhost:8080/api/v1/admin/user_addresses'

	const columns = [
		{
			title: 'ID',
			dataIndex: 'id',
			key: 'id',
		},
		{
			title: 'ID пользователя',
			dataIndex: 'user_id',
			key: 'user_id',
		},
		{
			title: 'Адрес',
			dataIndex: 'address_line',
			key: 'address_line',
		},
		{
			title: 'Страна',
			dataIndex: 'country',
			key: 'country',
		},
		{
			title: 'Город',
			dataIndex: 'city',
			key: 'city',
		},
		{
			title: 'Почтовый индекс',
			dataIndex: 'postal_code',
			key: 'postal_code',
		},
		{
			title: 'Дата создания',
			dataIndex: 'created_at',
			key: 'created_at',
			render: text => new Date(text).toLocaleString(),
		},
		{
			title: 'Действия',
			key: 'action',
			render: (_, record) => (
				<Space size='middle'>
					<Button type='link' onClick={() => handleEdit(record)}>
						Редактировать
					</Button>
					<Popconfirm
						title='Вы уверены, что хотите удалить этот адрес?'
						onConfirm={() => handleDelete(record.id)}
						okText='Да'
						cancelText='Нет'
					>
						<Button type='link' danger>
							Удалить
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	]

	useEffect(() => {
		fetchAddresses()
	}, [])

	const fetchAddresses = async () => {
		setLoading(true)
		try {
			const response = await axios.get(API_URL)
			setAddresses(response.data)
		} catch (error) {
			message.error('Ошибка при загрузке адресов')
			console.error('Ошибка при загрузке адресов:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleEdit = record => {
		form.setFieldsValue({
			...record,
			// Запрещаем редактирование user_id
			user_id: undefined,
		})
		setEditingAddress(record)
		setIsModalVisible(true)
	}

	const handleDelete = async id => {
		try {
			await axios.delete(`${API_URL}/${id}`)
			message.success('Адрес успешно удалён')
			fetchAddresses()
		} catch (error) {
			message.error('Ошибка при удалении адреса')
			console.error('Ошибка при удалении адреса:', error)
		}
	}

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()

			// Добавляем user_id из редактируемого адреса
			if (editingAddress) {
				values.user_id = editingAddress.user_id
				await axios.put(`${API_URL}/${editingAddress.id}`, values)
				message.success('Адрес успешно обновлён')
			}

			setIsModalVisible(false)
			fetchAddresses()
		} catch (error) {
			message.error('Ошибка при сохранении')
			console.error('Ошибка при сохранении:', error)
		}
	}

	return (
		<div>
			<button
				onClick={() => navigate(-1)}
				className='bg-black text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center mb-4'
			>
				<FaArrowLeft className='mr-2' /> Назад
			</button>

			<Table
				columns={columns}
				dataSource={addresses}
				rowKey='id'
				loading={loading}
			/>

			<Modal
				title={editingAddress ? 'Редактировать адрес' : 'Создать новый адрес'}
				visible={isModalVisible}
				onOk={handleSubmit}
				onCancel={() => setIsModalVisible(false)}
				okText='Сохранить'
				cancelText='Отмена'
			>
				<Form form={form} layout='vertical'>
					{editingAddress && (
						<Form.Item label='ID пользователя'>
							<Input value={editingAddress.user_id} disabled />
						</Form.Item>
					)}

					<Form.Item
						name='address_line'
						label='Адрес'
						rules={[{ required: true, message: 'Пожалуйста, введите адрес!' }]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						name='country'
						label='Страна'
						rules={[{ required: true, message: 'Пожалуйста, введите страну!' }]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						name='city'
						label='Город'
						rules={[{ required: true, message: 'Пожалуйста, введите город!' }]}
					>
						<Input />
					</Form.Item>

					<Form.Item name='postal_code' label='Почтовый индекс'>
						<Input />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	)
}

export default UserAddress
