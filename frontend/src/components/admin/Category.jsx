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

const Categories = () => {
	const [state, setState] = useState({
		categories: [],
		subcategories: [],
		filteredCategories: [],
		loading: false,
		subcategoriesLoading: false,
		selectedKeys: [],
		searchQuery: '',
		modalVisible: false,
		currentCategory: null,
		apiErrors: null,
		pagination: {
			current: 1,
			pageSize: 10,
			total: 0,
		},
	})

	const [form] = Form.useForm()
	const navigate = useNavigate()
	const CATEGORIES_API = 'http://localhost:8080/api/v1/admin/categories'
	const SUBCATEGORIES_API = 'http://localhost:8080/api/v1/subcategory'

	const columns = [
		{
			title: 'Название категории',
			dataIndex: 'name',
			key: 'name',
			render: text => <Text strong>{text}</Text>,
			sorter: (a, b) => a.name.localeCompare(b.name),
		},
		{
			title: 'Подкатегории',
			key: 'subcategories',
			render: (_, record) => {
				const count = state.subcategories.filter(
					sub => sub.category_id === record.id
				).length

				return count > 0 ? (
					<Tag
						color='default'
						style={{ color: '#666', borderColor: '#d9d9d9' }}
					>
						{count} подкатегорий
					</Tag>
				) : (
					<Tag
						color='default'
						style={{ color: '#666', borderColor: '#d9d9d9' }}
					>
						Нет подкатегорий
					</Tag>
				)
			},
		},
		{
			title: 'Действия',
			key: 'actions',
			align: 'right',
			render: (_, record) => {
				const hasSubcategories = state.subcategories.some(
					sub => sub.category_id === record.id
				)

				return (
					<Space size='middle'>
						<Tooltip title='Редактировать'>
							<Button
								shape='circle'
								icon={<EditOutlined />}
								onClick={() => showEditModal(record)}
								style={{ color: '#333', borderColor: '#d9d9d9' }}
							/>
						</Tooltip>
						<Tooltip
							title={
								hasSubcategories
									? 'Нельзя удалить (есть подкатегории)'
									: 'Удалить'
							}
						>
							<Popconfirm
								title='Подтверждение удаления'
								description={`Удалить категорию "${record.name}"?`}
								onConfirm={() => deleteCategory(record.id)}
								okText='Да'
								cancelText='Нет'
								disabled={hasSubcategories}
							>
								<Button
									shape='circle'
									icon={<DeleteOutlined />}
									danger
									disabled={hasSubcategories}
									style={{ borderColor: '#d9d9d9' }}
								/>
							</Popconfirm>
						</Tooltip>
					</Space>
				)
			},
		},
	]

	useEffect(() => {
		fetchInitialData()
	}, [])

	useEffect(() => {
		filterCategories()
	}, [state.searchQuery, state.categories])

	const fetchInitialData = async () => {
		try {
			setState(prev => ({ ...prev, loading: true, apiErrors: null }))

			const [categoriesRes, subcategoriesRes] = await Promise.all([
				axios.get(CATEGORIES_API),
				axios.get(SUBCATEGORIES_API),
			])

			setState(prev => ({
				...prev,
				categories: categoriesRes.data,
				subcategories: subcategoriesRes.data,
				loading: false,
				pagination: {
					...prev.pagination,
					total: categoriesRes.data.length,
				},
			}))
		} catch (error) {
			setState(prev => ({
				...prev,
				loading: false,
				apiErrors: error.response?.data?.message || 'Ошибка загрузки данных',
			}))
		}
	}

	const filterCategories = () => {
		const filtered = state.categories.filter(category =>
			category.name.toLowerCase().includes(state.searchQuery.toLowerCase())
		)
		setState(prev => ({
			...prev,
			filteredCategories: filtered,
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
			currentCategory: null,
		}))
	}

	const showEditModal = record => {
		form.setFieldsValue(record)
		setState(prev => ({
			...prev,
			modalVisible: true,
			currentCategory: record,
		}))
	}

	const handleModalSubmit = async () => {
		try {
			const values = await form.validateFields()
			const method = state.currentCategory ? 'put' : 'post'
			const url = state.currentCategory
				? `${CATEGORIES_API}/${state.currentCategory.id}`
				: CATEGORIES_API

			await axios[method](url, values)
			message.success(
				`Категория успешно ${state.currentCategory ? 'обновлена' : 'создана'}`
			)
			setState(prev => ({ ...prev, modalVisible: false }))
			fetchInitialData()
		} catch (error) {
			const errorMessage = error.response?.data?.error?.includes(
				'already exists'
			)
				? 'Категория с таким названием уже существует'
				: 'Ошибка при сохранении данных'
			message.error(errorMessage)
		}
	}

	const deleteCategory = async id => {
		try {
			const hasSubcategories = state.subcategories.some(
				sub => sub.category_id === id
			)

			if (hasSubcategories) {
				message.error('Нельзя удалить категорию с подкатегориями')
				return
			}

			await axios.delete(`${CATEGORIES_API}/${id}`)
			message.success('Категория удалена')
			fetchInitialData()
		} catch (error) {
			message.error('Ошибка при удалении категории')
		}
	}

	const handleBulkDelete = () => {
		confirm({
			title: 'Массовое удаление категорий',
			icon: <ExclamationCircleFilled />,
			content: (
				<div>
					<p>
						Вы уверены, что хотите удалить {state.selectedKeys.length}{' '}
						категорий?
					</p>
					<Alert
						type='warning'
						message='Категории с подкатегориями удалены не будут'
						showIcon
					/>
				</div>
			),
			okText: 'Удалить',
			cancelText: 'Отмена',
			async onOk() {
				try {
					const results = await Promise.allSettled(
						state.selectedKeys.map(id => {
							const hasSubcategories = state.subcategories.some(
								sub => sub.category_id === id
							)

							if (hasSubcategories) {
								return Promise.reject({ reason: 'has_subcategories' })
							}

							return axios.delete(`${CATEGORIES_API}/${id}`)
						})
					)

					const successCount = results.filter(
						r => r.status === 'fulfilled'
					).length
					const blockedCount = results.filter(
						r => r.status === 'rejected' && r.reason === 'has_subcategories'
					).length

					if (successCount > 0) {
						message.success(`Удалено ${successCount} категорий`)
					}
					if (blockedCount > 0) {
						message.warning(
							`${blockedCount} категорий не удалены (содержат подкатегории)`
						)
					}

					if (successCount > 0) {
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
		getCheckboxProps: record => ({
			disabled: state.subcategories.some(sub => sub.category_id === record.id),
		}),
	}

	const hasSelected = state.selectedKeys.length > 0
	const selectedInfo = useMemo(() => {
		const selected = state.categories.filter(cat =>
			state.selectedKeys.includes(cat.id)
		)
		const withSubcategories = selected.filter(cat =>
			state.subcategories.some(sub => sub.category_id === cat.id)
		).length

		return {
			total: selected.length,
			withSubcategories,
		}
	}, [state.selectedKeys, state.categories, state.subcategories])

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
								Управление категориями
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
									<span>
										<Badge
											count={selectedInfo.total}
											showZero
											className='mr-1'
											style={{ backgroundColor: '#666' }}
										/>
										{selectedInfo.withSubcategories > 0 && (
											<Tag
												color='default'
												style={{ color: '#666', borderColor: '#d9d9d9' }}
											>
												{selectedInfo.withSubcategories} с подкатегориями
											</Tag>
										)}
									</span>
								)}
							</Space>
						</Col>
					</Row>

					<Spin spinning={state.loading}>
						<Table
							columns={columns}
							dataSource={state.filteredCategories}
							rowKey='id'
							loading={state.loading}
							bordered
							style={{ borderColor: '#d9d9d9' }}
							pagination={{
								...state.pagination,
								showSizeChanger: true,
								pageSizeOptions: ['10', '20', '50'],
								showTotal: (total, range) =>
									`Показано ${range[0]}-${range[1]} из ${total} категорий`,
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
							{state.currentCategory ? (
								<>
									<EditOutlined className='mr-2' />
									Редактирование категории
								</>
							) : (
								<>
									<PlusOutlined className='mr-2' />
									Новая категория
								</>
							)}
						</span>
					}
					open={state.modalVisible}
					onOk={handleModalSubmit}
					onCancel={() => setState(prev => ({ ...prev, modalVisible: false }))}
					okText={state.currentCategory ? 'Обновить' : 'Создать'}
					cancelText='Отмена'
					destroyOnClose
					okButtonProps={{ style: { background: '#333', borderColor: '#333' } }}
				>
					<Form form={form} layout='vertical'>
						<Form.Item
							name='name'
							label='Название категории'
							rules={[
								{ required: true, message: 'Введите название категории' },
								{ min: 2, message: 'Минимум 2 символа' },
								{ max: 100, message: 'Максимум 100 символов' },
							]}
						>
							<Input
								placeholder='Например: Одежда, Обувь и т.д.'
								style={{ borderColor: '#d9d9d9' }}
							/>
						</Form.Item>
					</Form>
				</Modal>
			</motion.div>
		</ConfigProvider>
	)
}

export default Categories
