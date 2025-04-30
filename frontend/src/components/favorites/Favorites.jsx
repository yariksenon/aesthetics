// FavoritesList.jsx
import React, { useEffect, useState } from 'react';
import { useFavorites } from '../../context/FavoritesContext';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import heart from '../../assets/home/ProductCards/ProductCard-Heart.svg';
import feelHeart from '../../assets/home/ProductCards/ProductCard-FeelHeart.svg';

const Favorites = () => {
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    if (product.quantity <= 0) return;
    addToCart(product);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center py-12">Loading...</div>;
  }

  if (!favorites.length) {
    return <div className="text-center py-12 text-gray-500">Нет избранных товаров</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
      {favorites.map((product) => (
        <div
          key={product.id}
          className="relative group bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
          onClick={() => handleProductClick(product.id)}
        >
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

            <button
              className="absolute top-3 right-3 p-2 bg-white/80 rounded-full shadow-sm hover:bg-white transition-all"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(product);
              }}
              aria-label="Удалить из избранного"
            >
              <img src={feelHeart} alt="Избранное" className="w-5 h-5" />
            </button>

            {product.discountPercentage && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{product.discountPercentage}%
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
              {product.name}
            </h3>
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
                onClick={(e) => handleAddToCart(product, e)}
                className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800"
              >
                В корзину
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Favorites;