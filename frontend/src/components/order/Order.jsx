import React, { useState, useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'

const OrderPage = () => {
    const { cart, clearCart } = useCart()
    const navigate = useNavigate()
    const userId = localStorage.getItem('userId') || '1' // Заглушка для демонстрации

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [stockErrors, setStockErrors] = useState<string[]>([])

    // Проверяем, есть ли товары в корзине
    useEffect(() => {
        if (cart.length === 0) {
            navigate('/cart')
        }
    }, [cart, navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setStockErrors([])

        try {
            // Отправляем запрос на создание заказа
            const response = await axios.post(
                `http://45.12.74.28:8080/api/v1/orders/${userId}`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )

            if (response.data && response.data.order_id) {
                toast.success('Заказ успешно создан!')
                clearCart()
                navigate(`/order-success/${response.data.order_id}`)
            }
        } catch (error) {
            console.error('Ошибка при создании заказа:', error)

            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    // Обработка ошибок недостатка товаров
                    const errorData = error.response.data
                    if (errorData.error && typeof errorData.error === 'string') {
                        toast.error(errorData.error)
                    } else if (errorData.errors) {
                        setStockErrors(errorData.errors)
                    }
                } else {
                    toast.error(error.response?.data?.error || 'Произошла ошибка при создании заказа')
                }
            } else {
                toast.error('Произошла неизвестная ошибка')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    // Если есть ошибки по остаткам, показываем их
    if (stockErrors.length > 0) {
        return (
            <div className="container mx-auto px-4 py-12">
                <h2 className="text-2xl font-bold mb-6">Проблема с оформлением заказа</h2>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    {stockErrors.map((error, index) => (
                        <p key={index} className="text-red-700">{error}</p>
                    ))}
                </div>
                <button
                    onClick={() => {
                        setStockErrors([])
                        navigate('/cart')
                    }}
                    className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                    Вернуться в корзину
                </button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8">Подтверждение заказа</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Основная информация о заказе */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Информация о заказе</h2>
                        <p className="mb-4">
                            Нажмите кнопку "Подтвердить заказ" для оформления. Система проверит наличие товаров 
                            и создаст ваш заказ.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-3 px-4 rounded-md text-white font-medium text-lg ${
                                isSubmitting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-black hover:bg-gray-800'
                            } transition-colors`}
                        >
                            {isSubmitting ? 'Создаем заказ...' : 'Подтвердить заказ'}
                        </button>
                    </form>
                </div>

                {/* Блок с товарами */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-4">
                        <h2 className="text-xl font-semibold mb-6">Состав заказа</h2>

                        <div className="divide-y divide-gray-200">
                            {cart.map(item => (
                                <div
                                    key={`${item.product_id}-${item.size_id}`}
                                    className="py-4 flex justify-between"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                            <img
                                                src={`http://45.12.74.28:8080/static/${item.image_path}`}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                                onError={e => {
                                                    e.currentTarget.src =
                                                        'https://via.placeholder.com/80?text=No+Image'
                                                    e.currentTarget.className =
                                                        'w-full h-full object-contain p-2'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{item.name}</h3>
                                            <p className="text-sm text-gray-500">
                                                Размер: {item.size_name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Количество: {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="font-medium whitespace-nowrap">
                                        {item.price * item.quantity} ₽
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <div className="flex justify-between font-bold text-lg">
                                <span>Итого</span>
                                <span>
                                    {cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)} ₽
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderPage