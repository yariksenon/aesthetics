import React, { useState, useEffect } from 'react'
import { Form, Select, Spin } from 'antd'
import axios from 'axios'

const Category = ({ selectedCategoryId, onCategoryChange }) => {
	const [state, setState] = useState({
		categories: [],
		loading: false,
		error: null,
	})

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				setState(prev => ({ ...prev, loading: true }))
				const { data } = await axios.get(
					'http://localhost:8080/api/v1/categories'
				)
				setState(prev => ({
					...prev,
					categories: data?.categories || [],
					loading: false,
				}))
			} catch (err) {
				setState(prev => ({
					...prev,
					error: err.message,
					loading: false,
				}))
				console.error('Ошибка загрузки категорий:', err)
			}
		}

		fetchCategories()
	}, [])

	return (
		<Form.Item
			label='Категория'
			name='category_id'
			rules={[{ required: true, message: 'Пожалуйста, выберите категорию!' }]}
			validateStatus={state.error ? 'error' : ''}
			help={state.error}
		>
			<Select
				placeholder='Выберите категорию'
				value={selectedCategoryId}
				onChange={onCategoryChange}
				showSearch
				optionFilterProp='children'
				filterOption={(input, option) =>
					option.children.toLowerCase().includes(input.toLowerCase())
				}
				allowClear
				notFoundContent={
					state.loading ? <Spin size='small' /> : 'Категории не найдены'
				}
				disabled={state.loading}
			>
				{state.categories.map(({ id, name }) => (
					<Select.Option key={id} value={id}>
						{name}
					</Select.Option>
				))}
			</Select>
		</Form.Item>
	)
}

export default Category
