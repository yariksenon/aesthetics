import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCart } from '../../context/CartContext';

function Product() {
  const { productid } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/v1/product/${productid}`);
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error loading product:', error);
        toast.error('Ошибка загрузки товара');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productid]);

  const handleAddToCart = () => {
    if (product.quantity <= 0) {
      toast.warn('Товар временно отсутствует');
      return;
    }
    
    addToCart(product);
    toast.success(`${product.name} добавлен в корзину!`, {
      icon: '🛒',
    });
  };

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>;
  }

  if (!product) {
    return <div className="text-center py-12">Товар не найден</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Изображение товара */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <img
            src={`http://localhost:8080/static/${product.image_path}`}
            alt={product.name}
            className="w-full h-auto max-h-[500px] object-contain"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/500x500?text=No+Image';
            }}
          />
        </div>

        {/* Информация о товаре */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
          
          <div className="mb-6">
            {product.discountPercentage ? (
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-red-600">
                  {product.price.toFixed(2)} Br
                </span>
                <span className="text-xl text-gray-500 line-through">
                  {(product.price / (1 - product.discountPercentage / 100)).toFixed(2)} Br
                </span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                  -{product.discountPercentage}%
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold">{product.price.toFixed(2)} Br</span>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Описание</h2>
            <p className="text-gray-700">{product.description || 'Описание отсутствует'}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Характеристики</h2>
            <ul className="space-y-2">
              <li><strong>Категория:</strong> {product.category || 'Не указана'}</li>
              <li><strong>Доступность:</strong> {product.quantity > 0 ? 'В наличии' : 'Нет в наличии'}</li>
            </ul>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            disabled={product.quantity <= 0}
          >
            {product.quantity > 0 ? 'Добавить в корзину' : 'Нет в наличии'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Product;