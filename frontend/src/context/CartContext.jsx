import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
	const [cartItems, setCartItems] = useState([])

	const addToCart = async product => {
		try {
			// 1. Проверка данных товара
			const productId = product?.id || product?.product_id
			if (!productId || productId <= 0) {
				throw new Error('Некорректный ID товара')
			}

			// Проверка size_id, если передан
			const sizeId = product?.size_id
			if (sizeId && (isNaN(sizeId) || sizeId <= 0)) {
				throw new Error('Некорректный ID размера')
			}

			// 2. Подготовка данных для сервера
			const userId = localStorage.getItem('userId')
			if (!userId) throw new Error('Требуется авторизация')

			const requestData = {
				product_id: Number(productId),
				quantity: product?.quantity || 1,
				...(sizeId && { size_id: Number(sizeId) }), // Добавляем size_id, если он есть
			}

			// 3. Отправка запроса
			const response = await fetch(
				`http://45.12.74.28:8080/api/v1/cart/${userId}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
					body: JSON.stringify(requestData),
				}
			)

			// 4. Обработка ответа
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				throw new Error(errorData.message || 'Ошибка сервера')
			}

			// 5. Обновление состояния
			const newItem = await response.json()
			setCartItems(prev => [...prev, newItem])
		} catch (error) {
			console.error('Ошибка при добавлении в корзину:', {
				error: error.message,
				productId: product?.id || product?.product_id,
				sizeId: productHedgedgeId || product?.size_id,
				userId: localStorage.getItem('userId'),
			})
			throw error
		}
	}

	return (
		<CartContext.Provider value={{ cartItems, addToCart }}>
			{children}
		</CartContext.Provider>
	)
}

export const useCart = () => useContext(CartContext)
