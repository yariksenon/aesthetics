import React, { useState, useEffect, useMemo } from 'react'
import {
	Table,
	Button,
	Modal,
	Form,
	Input,
	message,
	Popconfirm,
	Space,
	Card,
	Typography,
	Tooltip,
	Row,
	Col,
	Badge,
	Alert,
	Tag,
	Spin,
	Select,
	ConfigProvider,
} from 'antd'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	SearchOutlined,
	ArrowLeftOutlined,
	ExclamationCircleFilled,
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import ruRU from 'antd/lib/locale/ru_RU'

const { Title, Text } = Typography
const { confirm } = Modal
const { Option } = Select

const SubCategories = () => {
	const [state, setState] = useState({
		subcategories: [],
		categories: [],
		filteredSubcategories: [],
		loading: false,
		categoriesLoading: false,
		selectedKeys: [],
		searchQuery: '',
		modalVisible: false,
		currentSubcategory: null,
		apiErrors: null,
		pagination: {
			current: 1,
			pageSize: 10,
			total: 0,
		},
	})

	const [form] = Form.useForm()
	const navigate = useNavigate()
	const SUBCATEGORIES_API =
		'http://45.12.74.28:8080/api/v1/admin/sub_categories'
	const CATEGORIES_API = 'http://45.12.74.28:8080/api/v1/admin/categories'

	const columns = [
		{
			title: 'Название подкатегории',
			dataIndex: 'name',
			key: 'name',
			render: text => <Text strong>{text}</Text>,
			sorter: (a, b) => a.name.localeCompare(b.name),
		},
		{
			title: 'Родительская категория',
			key: 'category',
			render: (_, record) => {
				const category = state.categories.find(
					cat => cat.id === record.category_id
				)
				return category ? (
					<Tag
						color='default'
						style={{ color: '#666', borderColor: '#d9d9d9' }}
					>
						{category.name}
					</Tag>
				) : (
					<Tag
						color='default'
						style={{ color: '#666', borderColor: '#d9d9d9' }}
					>
						Не указана
					</Tag>
				)
			},
		},
		{
			title: 'Действия',
			key: 'actions',
			align: 'right',
			render: (_, record) => (
				<Space size='middle'>
					<Tooltip title='Редактировать'>
						<Button
							shape='circle'
							icon={<EditOutlined />}
							onClick={() => showEditModal(record)}
							style={{ color: '#333', borderColor: '#d9d9d9' }}
						/>
					</Tooltip>
					<Tooltip title='Удалить'>
						<Popconfirm
							title='Подтверждение удаления'
							description={`Удалить подкатегорию "${record.name}"?`}
							onConfirm={() => deleteSubcategory(record.id)}
							okText='Да'
							cancelText='Нет'
						>
							<Button
								shape='circle'
								icon={<DeleteOutlined />}
								danger
								style={{ borderColor: '#d9d9d9' }}
							/>
						</Popconfirm>
					</Tooltip>
				</Space>
			),
		},
	]

	useEffect(() => {
		fetchInitialData()
	}, [])

	useEffect(() => {
		filterSubcategories()
	}, [state.searchQuery, state.subcategories])

	const fetchInitialData = async () => {
		try {
			setState(prev => ({
				...prev,
				loading: true,
				categoriesLoading: true,
				apiErrors: null,
			}))

			const [subcategoriesRes, categoriesRes] = await Promise.all([
				axios.get(SUBCATEGORIES_API),
				axios.get(CATEGORIES_API),
			])

			setState(prev => ({
				...prev,
				subcategories: subcategoriesRes.data,
				categories: categoriesRes.data,
				loading: false,
				categoriesLoading: false,
				pagination: {
					...prev.pagination,
					total: subcategoriesRes.data.length,
				},
			}))
		} catch (error) {
			setState(prev => ({
				...prev,
				loading: false,
				categoriesLoading: false,
				apiErrors: error.response?.data?.message || 'Ошибка загрузки данных',
			}))
		}
	}

	const filterSubcategories = () => {
		const filtered = state.subcategories.filter(subcategory =>
			subcategory.name.toLowerCase().includes(state.searchQuery.toLowerCase())
		)
		setState(prev => ({
			...prev,
			filteredSubcategories: filtered,
			pagination: {
				...prev.pagination,
				total: filtered.length,
			},
		}))
	}

	const handleTableChange = pagination => {
		setState(prev => ({
			...prev,
			pagination: {
				...prev.pagination,
				current: pagination.current,
				pageSize: pagination.pageSize,
			},
		}))
	}

	const showCreateModal = () => {
		form.resetFields()
		setState(prev => ({
			...prev,
			modalVisible: true,
			currentSubcategory: null,
		}))
	}

	const showEditModal = record => {
		form.setFieldsValue({
			name: record.name,
			category_id: record.category_id.toString(),
		})
		setState(prev => ({
			...prev,
			modalVisible: true,
			currentSubcategory: record,
		}))
	}

	const handleModalSubmit = async () => {
		try {
			const values = await form.validateFields()
			const method = state.currentSubcategory ? 'put' : 'post'
			const url = state.currentSubcategory
				? `${SUBCATEGORIES_API}/${state.currentSubcategory.id}`
				: SUBCATEGORIES_API

			const requestData = {
				name: values.name,
				category_id: Number(values.category_id),
			}

			await axios[method](url, requestData)
			message.success(
				`Подкатегория успешно ${
					state.currentSubcategory ? 'обновлена' : 'создана'
				}`
			)
			setState(prev => ({ ...prev, modalVisible: false }))
			fetchInitialData()
		} catch (error) {
			let errorMessage = 'Ошибка при сохранении данных'
			if (error.response?.data?.error) {
				if (error.response.data.error.includes('already exists')) {
					errorMessage = 'Подкатегория с таким названием уже существует'
				} else {
					errorMessage = error.response.data.error
				}
			}
			message.error(errorMessage)
		}
	}

	const deleteSubcategory = async id => {
		try {
			await axios.delete(`${SUBCATEGORIES_API}/${id}`)
			message.success('Подкатегория удалена')
			fetchInitialData()
		} catch (error) {
			message.error('Ошибка при удалении подкатегории')
		}
	}

	const handleBulkDelete = () => {
		confirm({
			title: 'Массовое удаление подкатегорий',
			icon: <ExclamationCircleFilled />,
			content: (
				<div>
					<p>
						Вы уверены, что хотите удалить {state.selectedKeys.length}{' '}
						подкатегорий?
					</p>
					<Alert
						type='warning'
						message='Все связанные товары могут стать недоступны'
						showIcon
					/>
				</div>
			),
			okText: 'Удалить',
			cancelText: 'Отмена',
			async onOk() {
				try {
					const results = await Promise.allSettled(
						state.selectedKeys.map(id =>
							axios.delete(`${SUBCATEGORIES_API}/${id}`)
						)
					)

					const successCount = results.filter(
						r => r.status === 'fulfilled'
					).length

					if (successCount > 0) {
						message.success(`Удалено ${successCount} подкатегорий`)
						setState(prev => ({ ...prev, selectedKeys: [] }))
						fetchInitialData()
					}
				} catch (error) {
					message.error('Ошибка при массовом удалении')
				}
			},
		})
	}

	const rowSelection = {
		selectedRowKeys: state.selectedKeys,
		onChange: selectedKeys => setState(prev => ({ ...prev, selectedKeys })),
	}

	const hasSelected = state.selectedKeys.length > 0

	return (
		<ConfigProvider locale={ruRU}>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.3 }}
				className='p-4'
			>
				<Card
					title={
						<div className='flex items-center'>
							<Title level={4} className='mb-0' style={{ color: '#333' }}>
								Управление подкатегориями
							</Title>
						</div>
					}
					bordered={false}
					style={{ background: '#fff', borderColor: '#d9d9d9' }}
					extra={
						<Space>
							<Button
								icon={<ArrowLeftOutlined />}
								onClick={() => navigate(-1)}
								style={{ color: '#333', borderColor: '#d9d9d9' }}
							>
								Назад
							</Button>
							<Button
								type='primary'
								icon={<PlusOutlined />}
								onClick={showCreateModal}
								style={{ background: '#333', borderColor: '#333' }}
							>
								Добавить
							</Button>
						</Space>
					}
				>
					{state.apiErrors && (
						<Alert
							message='Ошибка'
							description={state.apiErrors}
							type='error'
							showIcon
							closable
							className='mb-4'
						/>
					)}

					<Row gutter={16} className='mb-4'>
						<Col span={16}>
							<Input
								placeholder='Поиск по названию...'
								prefix={<SearchOutlined />}
								value={state.searchQuery}
								onChange={e =>
									setState(prev => ({
										...prev,
										searchQuery: e.target.value,
									}))
								}
								allowClear
								style={{ borderColor: '#d9d9d9' }}
							/>
						</Col>
						<Col span={8} className='text-right'>
							<Space>
								<Button
									danger
									icon={<DeleteOutlined />}
									onClick={handleBulkDelete}
									disabled={!hasSelected}
									style={{ borderColor: '#d9d9d9' }}
								>
									Удалить выбранные
								</Button>
								{hasSelected && (
									<Badge
										count={state.selectedKeys.length}
										showZero
										className='mr-1'
										style={{ backgroundColor: '#666' }}
									/>
								)}
							</Space>
						</Col>
					</Row>

					<Spin spinning={state.loading}>
						<Table
							columns={columns}
							dataSource={state.filteredSubcategories}
							rowKey='id'
							loading={state.loading}
							bordered
							style={{ borderColor: '#d9d9d9' }}
							pagination={{
								...state.pagination,
								showSizeChanger: true,
								pageSizeOptions: ['10', '20', '50'],
								showTotal: (total, range) =>
									`Показано ${range[0]}-${range[1]} из ${total} подкатегорий`,
								position: ['bottomCenter'],
								locale: {
									items_per_page: 'записей на странице',
									jump_to: 'Перейти',
									jump_to_confirm: 'подтвердить',
									page: 'Страница',
									prev_page: 'Предыдущая',
									next_page: 'Следующая',
									prev_5: 'Предыдущие 5',
									next_5: 'Следующие 5',
									prev_3: 'Предыдущие 3',
									next_3: 'Следующие 3',
								},
							}}
							onChange={handleTableChange}
							rowSelection={{
								type: 'checkbox',
								...rowSelection,
							}}
							scroll={{ x: true }}
						/>
					</Spin>
				</Card>

				<Modal
					title={
						<span style={{ color: '#333' }}>
							{state.currentSubcategory ? (
								<>
									<EditOutlined className='mr-2' />
									Редактирование подкатегории
								</>
							) : (
								<>
									<PlusOutlined className='mr-2' />
									Новая подкатегория
								</>
							)}
						</span>
					}
					open={state.modalVisible}
					onOk={handleModalSubmit}
					onCancel={() => setState(prev => ({ ...prev, modalVisible: false }))}
					okText={state.currentSubcategory ? 'Обновить' : 'Создать'}
					cancelText='Отмена'
					destroyOnClose
					okButtonProps={{ style: { background: '#333', borderColor: '#333' } }}
				>
					<Form form={form} layout='vertical'>
						<Form.Item
							name='name'
							label='Название подкатегории'
							rules={[
								{ required: true, message: 'Введите название подкатегории' },
								{ min: 2, message: 'Минимум 2 символа' },
								{ max: 100, message: 'Максимум 100 символов' },
							]}
						>
							<Input
								placeholder='Например: Футболки, Кроссовки и т.д.'
								style={{ borderColor: '#d9d9d9' }}
							/>
						</Form.Item>
						<Form.Item
							name='category_id'
							label='Родительская категория'
							rules={[{ required: true, message: 'Выберите категорию' }]}
						>
							<Select
								placeholder='Выберите категорию'
								loading={state.categoriesLoading}
								style={{ borderColor: '#d9d9d9' }}
							>
								{state.categories.map(category => (
									<Option key={category.id} value={category.id.toString()}>
										{category.name}
									</Option>
								))}
							</Select>
						</Form.Item>
					</Form>
				</Modal>
			</motion.div>
		</ConfigProvider>
	)
}

export default SubCategories
