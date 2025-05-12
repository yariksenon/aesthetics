import React from 'react'
import { Form, Input } from 'antd'

const Color = ({ color, onChange }) => (
	<Form.Item
		label='Цвет'
		name='color'
		rules={[
			{ required: true, message: 'Пожалуйста, введите цвет!' },
			{ max: 20, message: 'Цвет должен быть короче 20 символов' },
		]}
	>
		<Input
			placeholder='Введите цвет'
			value={color}
			onChange={onChange}
			allowClear
		/>
	</Form.Item>
)

export default React.memo(Color)
