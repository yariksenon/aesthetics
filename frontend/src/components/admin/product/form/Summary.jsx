import React from 'react'
import { Form, Input } from 'antd'

const { TextArea } = Input

const SummaryInput = ({ value, onChange }) => {
	return (
		<Form.Item
			label='Краткое описание'
			name='summary'
			tooltip='Краткая информация о товаре, которая будет отображаться в карточке товара'
			rules={[
				{
					max: 500,
					message: 'Краткое описание должно быть короче 500 символов',
				},
			]}
		>
			<TextArea
				placeholder='Введите краткое описание товара (необязательно)'
				value={value}
				onChange={onChange}
				rows={3}
				showCount
				maxLength={500}
				allowClear
			/>
		</Form.Item>
	)
}

export default SummaryInput
