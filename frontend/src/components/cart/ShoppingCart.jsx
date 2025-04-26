import React from 'react';
import { useCart } from '../../context/CartContext';

const ShoppingCart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, notification } = useCart();

  return (
    <div className="container mx-auto px-4 py-8 bg-white text-black min-h-screen relative">
      {notification && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          {notification}
        </div>
      )}
      <h1 className="text-3xl font-bold mb-8 border-b border-gray-300 pb-2">Корзина</h1>

      {cart.length === 0 ? (
        <p className="text-gray-500 text-center">Ваша корзина пуста</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Список товаров */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-300">
              {cart.map((item) => (
                <div key={item.id} className="p-4 border-b border-gray-300 flex flex-col sm:flex-row">
                  <div className="w-full sm:w-32 h-32 flex-shrink-0 mb-4 sm:mb-0">
                    <img
                      src={`http://localhost:8080/static/${item.image_path}`}
                      alt={item.name}
                      className="w-full h-full object-cover rounded border border-gray-300"
                    />
                  </div>
                  <div className="flex-1 sm:ml-4">
                    <h2 className="text-lg font-semibold">{item.name}</h2>
                    <p className="text-gray-600">Br {item.price.toFixed(2)}</p>

                    <div className="mt-3 flex items-center">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="bg-gray-200 text-black px-3 py-1 rounded-l hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="bg-gray-100 px-4 py-1">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="bg-gray-200 text-black px-3 py-1 rounded-r hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="mt-3 text-red-500 hover:text-red-700 text-sm"
                    >
                      Удалить
                    </button>
                  </div>
                  <div className="mt-2 sm:mt-0 sm:ml-4 text-right">
                    <p className="text-lg font-semibold">Br {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Блок итогов */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-300">
              <h2 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">Итого</h2>
              <div className="space-y-3 text-gray-600">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name} × {item.quantity}</span>
                    <span>Br {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
                <span>Всего:</span>
                <span>Br {cartTotal.toFixed(2)}</span>
              </div>
              <button className="w-full mt-6 bg-gray-200 hover:bg-gray-100 text-black py-3 px-4 rounded">
                Оформить заказ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
