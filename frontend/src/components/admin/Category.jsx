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

const Categories = () => {
	const [categories, setCategories] = useState([])
	const [loading, setLoading] = useState(false)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editingCategory, setEditingCategory] = useState(null)
	const [form] = Form.useForm()
	const navigate = useNavigate()

	const API_URL = 'http://localhost:8080/api/v1/admin/categories'

	const columns = [
		{
			title: 'ID',
			dataIndex: 'id',
			key: 'id',
		},
		{
			title: 'Название',
			dataIndex: 'name',
			key: 'name',
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
						title='Вы уверены, что хотите удалить эту категорию?'
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
		fetchCategories()
	}, [])

	const fetchCategories = async () => {
		setLoading(true)
		try {
			const response = await axios.get(API_URL)
			setCategories(response.data)
		} catch (error) {
			message.error('Ошибка при загрузке категорий')
			console.error('Error fetching categories:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleCreate = () => {
		form.resetFields()
		setEditingCategory(null)
		setIsModalOpen(true)
	}

	const handleEdit = record => {
		form.setFieldsValue(record)
		setEditingCategory(record)
		setIsModalOpen(true)
	}

	const handleDelete = async id => {
		try {
			await axios.delete(`${API_URL}/${id}`)
			message.success('Категория успешно удалена')
			fetchCategories()
		} catch (error) {
			if (error.response?.data?.error?.includes('subcategories')) {
				message.error('Нельзя удалить категорию с подкатегориями')
			} else {
				message.error('Ошибка при удалении категории')
			}
			console.error('Error deleting category:', error)
		}
	}

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()

			if (editingCategory) {
				await axios.put(`${API_URL}/${editingCategory.id}`, values)
				message.success('Категория успешно обновлена')
			} else {
				await axios.post(API_URL, values)
				message.success('Категория успешно создана')
			}

			setIsModalOpen(false)
			fetchCategories()
		} catch (error) {
			message.error('Ошибка при сохранении')
			console.error('Error details:', {
				message: error.message,
				response: error.response?.data,
				request: error.request,
			})
		}
	}

	return (
		<div className='p-4'>
			<div className='flex justify-between items-center mb-4'>
				<button
					onClick={() => navigate(-1)}
					className='bg-black text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center'
				>
					<FaArrowLeft className='mr-2' /> Назад
				</button>

				<Button type='primary' onClick={handleCreate}>
					Создать категорию
				</Button>
			</div>

			<Table
				columns={columns}
				dataSource={categories}
				rowKey='id'
				loading={loading}
				bordered
			/>

			<Modal
				title={
					editingCategory ? 'Редактировать категорию' : 'Создать категорию'
				}
				open={isModalOpen}
				onOk={handleSubmit}
				onCancel={() => setIsModalOpen(false)}
				okText='Сохранить'
				cancelText='Отмена'
			>
				<Form form={form} layout='vertical'>
					<Form.Item
						name='name'
						label='Название категории'
						rules={[
							{ required: true, message: 'Пожалуйста, введите название!' },
						]}
					>
						<Input />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	)
}

export default Categories
