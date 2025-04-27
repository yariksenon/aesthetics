import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import heart from '../../assets/home/ProductCards/ProductCard-Heart.svg';
import feelHeart from '../../assets/home/ProductCards/ProductCard-FeelHeart.svg';

const ListProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoverStates, setHoverStates] = useState({
    product: null,
    heart: null
  });
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/admin/products');
        const data = await response.json();
        setProducts(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Ошибка загрузки товаров');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleHoverState = (type, id) => {
    setHoverStates(prev => ({ ...prev, [type]: id }));
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation(); // Останавливаем всплытие события
    if (product.quantity <= 0) {
      toast.warn('Товар временно отсутствует');
      return;
    }
    
    addToCart(product);
    toast.success(`${product.name} добавлен в корзину!`, {
      icon: '🛒',
    });
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`); // Переход на страницу товара
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        Товары не найдены
      </div>
    );
  }

  return (
    <div>
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="relative group bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            onMouseEnter={() => handleHoverState('product', product.id)}
            onMouseLeave={() => handleHoverState('product', null)}
            onClick={() => handleProductClick(product.id)} // Обработчик клика по карточке
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden">
              <img
                src={`http://localhost:8080/static/${product.image_path}`}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                  e.target.className = 'w-full h-full object-contain bg-gray-100 p-4';
                }}
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Favorite button */}
              {hoverStates.product === product.id && (
                <button
                  className="absolute top-3 right-3 p-2 bg-white/80 rounded-full shadow-sm hover:bg-white transition-all"
                  onMouseEnter={() => handleHoverState('heart', product.id)}
                  onMouseLeave={() => handleHoverState('heart', null)}
                  aria-label="Добавить в избранное"
                  onClick={(e) => e.stopPropagation()} // Предотвращаем переход при клике на кнопку
                >
                  <img
                    src={hoverStates.heart === product.id ? feelHeart : heart}
                    alt="Избранное"
                    className="w-5 h-5"
                  />
                </button>
              )}

              {/* Discount badge */}
              {product.discountPercentage && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  -{product.discountPercentage}%
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                  {product.name}
                </h3>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {product.price.toFixed(2)} Br
                  </p>
                  {product.discountPercentage && (
                    <p className="text-sm text-gray-500 line-through">
                      {(product.price / (1 - product.discountPercentage / 100)).toFixed(2)} Br
                    </p>
                  )}
                </div>

                <button
                  onClick={(e) => handleAddToCart(product, e)} // Передаем событие
                  className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 active:bg-gray-900 transition-colors duration-200 transform hover:scale-105 active:scale-95"
                >
                  В корзину
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListProduct;