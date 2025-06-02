import React from 'react'
import { Form, Input } from 'antd'

const NameInput = () => {
	const handleInputChange = e => {
		// Удаляем все цифры из введенного значения
		const value = e.target.value.replace(/[0-9]/g, '')
		// Обрезаем до 100 символов
		if (value.length > 100) {
			e.target.value = value.slice(0, 100)
		} else {
			e.target.value = value
		}
		// Возвращаем событие с обновленным значением
		return e
	}

	return (
		<Form.Item
			label='Название товара'
			name='name'
			rules={[
				{ required: true, message: 'Пожалуйста, введите название товара!' },
				{
					max: 100,
					message: 'Название должно быть короче 100 символов',
				},
				{
					validator: (_, value) => {
						if (/[0-9]/.test(value)) {
							return Promise.reject(
								new Error('Название не должно содержать цифры')
							)
						}
						return Promise.resolve()
					},
				},
			]}
		>
			<Input
				placeholder='Введите название товара (макс. 100 символов, без цифр)'
				allowClear
				maxLength={100}
				showCount={{
					formatter: ({ count, maxLength }) => `${count}/${maxLength}`,
				}}
				onChange={handleInputChange}
			/>
		</Form.Item>
	)
}

export default React.memo(NameInput)
