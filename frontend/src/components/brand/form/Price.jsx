import React from 'react'
import { Form, InputNumber, Typography } from 'antd'

const { Text } = Typography

const MAX_PRICE = 1000000 // Максимальная цена - 1 миллион

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
					max: MAX_PRICE,
					message: `Цена должна быть от 0.01 до ${MAX_PRICE}`,
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
				max={MAX_PRICE}
				step={0.01}
				precision={2}
				formatter={value => {
					// Форматирование с пробелами между тысячами
					if (value) {
						return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
					}
					return ''
				}}
				parser={value => {
					// Парсинг введенного значения (удаление всех нецифровых символов кроме точки)
					if (value) {
						return value.replace(/[^\d.]/g, '')
					}
					return ''
				}}
				addonAfter='BYN'
				placeholder='0.00'
			/>
		</Form.Item>
	)
}

export default React.memo(Price)
