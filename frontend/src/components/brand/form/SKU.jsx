import React from 'react'
import { Form, Input } from 'antd'

const SKU = () => (
	<Form.Item
		label='Артикул'
		name='sku'
		rules={[
			{ max: 50, message: 'SKU должно быть короче 50 символов' },
			{
				pattern: /^[a-zA-Z0-9-_]+$/,
				message:
					'SKU может содержать только буквы, цифры, дефисы и подчеркивания',
			},
		]}
	>
		<Input placeholder='Например: PROD-12345' allowClear disabled />
	</Form.Item>
)

export default React.memo(SKU)
