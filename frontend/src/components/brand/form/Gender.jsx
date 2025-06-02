import React from 'react'
import { Form, Select, Radio, Typography } from 'antd'

const { Option } = Select
const { Text } = Typography

const GenderSelect = () => (
	<Form.Item
		name='gender'
		label='Пол'
		rules={[{ required: true, message: 'Пожалуйста, выберите пол' }]}
		extra={<Text type='secondary'>Для кого предназначен товар</Text>}
	>
		<Select placeholder='Выберите пол' allowClear>
			<Option value='men'>Мужской</Option>
			<Option value='women'>Женский</Option>
			<Option value='kids'>Детский</Option>
		</Select>
	</Form.Item>
)

export default React.memo(GenderSelect)
