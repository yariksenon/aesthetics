import React from 'react'
import { Form, Input } from 'antd'

const NameInput = () => (
	<Form.Item
		label='Название товара'
		name='name'
		rules={[
			{ required: true, message: 'Пожалуйста, введите название товара!' },
			{ max: 100, message: 'Название должно быть короче 100 символов' },
		]}
	>
		<Input placeholder='Введите название товара' allowClear />
	</Form.Item>
)

export default React.memo(NameInput)
