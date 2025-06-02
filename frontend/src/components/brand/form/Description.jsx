import React from 'react'
import { Form, Input } from 'antd'

const { TextArea } = Input

const DescriptionInput = ({ value, onChange }) => {
	return (
		<Form.Item
			label='Описание товара'
			name='description'
			rules={[
				{
					required: true,
					message: 'Пожалуйста, введите описание товара!',
				},
				{
					min: 10,
					message: 'Описание должно содержать минимум 10 символов',
				},
				{
					max: 2000,
					message: 'Описание должно быть короче 2000 символов',
				},
			]}
		>
			<TextArea
				placeholder='Введите подробное описание товара...'
				value={value}
				onChange={onChange}
				rows={4}
				showCount
				maxLength={2000}
				allowClear
			/>
		</Form.Item>
	)
}

export default DescriptionInput
