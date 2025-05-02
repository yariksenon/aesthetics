import React, { useState, useEffect } from 'react'
import {
	Table,
	Button,
	Modal,
	Form,
	Input,
	Select,
	message,
	Popconfirm,
	Space,
} from 'antd'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

const { Option } = Select

const SubCategories = () => {
	const [subCategories, setSubCategories] = useState([])
	const [categories, setCategories] = useState([])
	const [loading, setLoading] = useState(false)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editingSubCategory, setEditingSubCategory] = useState(null)
	const [form] = Form.useForm()
	const navigate = useNavigate()

	const API_URL = 'http://localhost:8080/api/v1/admin/sub_categories'
	const CATEGORIES_API_URL = 'http://localhost:8080/api/v1/admin/categories'

	const columns = [
		{
			title: 'ID',
			dataIndex: 'id',
			key: 'id',
		},
		{
			title: 'Категория',
			dataIndex: 'category_name',
			key: 'category_name',
		},
		{
			title: 'Подкатегория',
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
						title='Вы уверены, что хотите удалить эту подкатегорию?'
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
		fetchSubCategories()
		fetchCategories()
	}, [])

	const fetchSubCategories = async () => {
		setLoading(true)
		try {
			const response = await axios.get(API_URL)
			setSubCategories(response.data)
		} catch (error) {
			message.error('Ошибка при загрузке подкатегорий')
			console.error('Error fetching subcategories:', error)
		} finally {
			setLoading(false)
		}
	}

	const fetchCategories = async () => {
		try {
			const response = await axios.get(CATEGORIES_API_URL)
			setCategories(response.data)
		} catch (error) {
			message.error('Ошибка при загрузке категорий')
			console.error('Error fetching categories:', error)
		}
	}

	const handleCreate = () => {
		form.resetFields()
		setEditingSubCategory(null)
		setIsModalOpen(true)
	}

	const handleEdit = record => {
		form.setFieldsValue({
			...record,
			category_id: record.category_id.toString(),
		})
		setEditingSubCategory(record)
		setIsModalOpen(true)
	}

	const handleDelete = async id => {
		try {
			await axios.delete(`${API_URL}/${id}`)
			message.success('Подкатегория успешно удалена')
			fetchSubCategories()
		} catch (error) {
			if (error.response?.data?.error?.includes('products')) {
				Modal.error({
					title: 'Нельзя удалить подкатегорию',
					content:
						'Эта подкатегория содержит товары. Сначала удалите или переместите их.',
				})
			} else {
				message.error('Ошибка при удалении подкатегории')
			}
			console.error('Error deleting subcategory:', error)
		}
	}

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()
			const payload = {
				...values,
				category_id: parseInt(values.category_id),
			}

			if (editingSubCategory) {
				await axios.put(`${API_URL}/${editingSubCategory.id}`, payload)
				message.success('Подкатегория успешно обновлена')
			} else {
				await axios.post(API_URL, payload)
				message.success('Подкатегория успешно создана')
			}

			setIsModalOpen(false)
			fetchSubCategories()
		} catch (error) {
			message.error('Ошибка при сохранении')
			console.error('Error submitting form:', error)
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
					Создать подкатегорию
				</Button>
			</div>

			<Table
				columns={columns}
				dataSource={subCategories}
				rowKey='id'
				loading={loading}
				bordered
			/>

			<Modal
				title={
					editingSubCategory
						? 'Редактировать подкатегорию'
						: 'Создать подкатегорию'
				}
				open={isModalOpen}
				onOk={handleSubmit}
				onCancel={() => setIsModalOpen(false)}
				okText='Сохранить'
				cancelText='Отмена'
			>
				<Form form={form} layout='vertical'>
					<Form.Item
						name='category_id'
						label='Категория'
						rules={[
							{ required: true, message: 'Пожалуйста, выберите категорию!' },
						]}
					>
						<Select placeholder='Выберите категорию'>
							{categories.map(category => (
								<Option key={category.id} value={category.id.toString()}>
									{category.name}
								</Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item
						name='name'
						label='Название подкатегории'
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

export default SubCategories
