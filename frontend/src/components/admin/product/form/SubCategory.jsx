import React, { useState, useEffect } from 'react'
import { Form, Select, Spin } from 'antd'
import axios from 'axios'

const { Option } = Select

const ProductSubCategorySelect = ({ categoryId, onError }) => {
	const [subCategories, setSubCategories] = useState([])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		const fetchSubCategories = async () => {
			if (!categoryId) {
				setSubCategories([])
				return
			}

			try {
				setLoading(true)
				const response = await axios.get(
					`http://localhost:8080/api/v1/sub-categories?category_id=${categoryId}`
				)
				setSubCategories(
					Array.isArray(response.data.sub_categories)
						? response.data.sub_categories
						: []
				)
			} catch (error) {
				console.error('Error fetching subcategories:', error)
				onError?.('Не удалось загрузить подкатегории')
				setSubCategories([])
			} finally {
				setLoading(false)
			}
		}

		fetchSubCategories()
	}, [categoryId, onError])

	return (
		<Form.Item
			name='sub_category_id'
			label='Подкатегория'
			rules={[{ required: true, message: 'Пожалуйста, выберите подкатегорию' }]}
		>
			<Select
				placeholder='Выберите подкатегорию'
				disabled={!categoryId}
				loading={loading}
				notFoundContent={loading ? <Spin size='small' /> : null}
			>
				{subCategories.map(subCategory => (
					<Option key={subCategory.id} value={subCategory.id}>
						{subCategory.name}
					</Option>
				))}
			</Select>
		</Form.Item>
	)
}

export default ProductSubCategorySelect
