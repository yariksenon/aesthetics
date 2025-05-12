import React from 'react'
import { Form, InputNumber, Typography } from 'antd'

const { Text } = Typography

const Price = () => {
	return (
		<Form.Item
			label='Цена'
			name='price'
			rules={[
				{ required: true, message: 'Пожалуйста, укажите цену товара' },
				{
					type: 'number',
					min: 0.01,
					message: 'Цена должна быть больше 0',
				},
				{
					validator: (_, value) =>
						value && value.toString().split('.')[1]?.length > 2
							? Promise.reject(new Error('Максимум 2 знака после запятой'))
							: Promise.resolve(),
				},
			]}
			extra={<Text type='secondary'>Укажите цену в валюте магазина</Text>}
		>
			<InputNumber
				style={{ width: '100%' }}
				min={0.01}
				step={0.01}
				precision={2}
				formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
				parser={value => value.replace(/\$\s?|( *)/g, '')}
				addonAfter='BYN'
				placeholder='0.00'
			/>
		</Form.Item>
	)
}

export default React.memo(Price)
