import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useNavigate } from 'react-router-dom';
import heart from '../../assets/home/ProductCards/ProductCard-Heart.svg';
import feelHeart from '../../assets/home/ProductCards/ProductCard-FeelHeart.svg';

const ListProduct = ({ filters = {} }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoverStates, setHoverStates] = useState({
    product: null,
    heart: null
  });
  const { addToCart } = useCart();
  const { favorites, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  // Загрузка продуктов
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/admin/products');
        const data = await response.json();
        const productsArray = Array.isArray(data) ? data : [];
        setProducts(productsArray);
        setFilteredProducts(productsArray);
        setLoading(false);
      } catch (error) {
        console.error('Error loading products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Применение фильтров
  useEffect(() => {
    if (products.length === 0) return;

    let result = [...products];

    // Фильтрация по цвету
    if (filters.colors && filters.colors.length > 0) {
      result = result.filter(product => 
        product.color && filters.colors.includes(product.color.toLowerCase())
      );
    }

    // Фильтрация по размеру
    if (filters.sizes && filters.sizes.length > 0) {
      result = result.filter(product => 
        product.sizes && product.sizes.some(size => filters.sizes.includes(size))
      );
    }

    // Фильтрация по цене
    if (filters.priceRange) {
      result = result.filter(product => 
        product.price >= filters.priceRange.min && 
        product.price <= filters.priceRange.max
      );
    }

    // Фильтрация по наличию
    if (filters.availability) {
      if (filters.availability === 'in-stock') {
        result = result.filter(product => product.inStock > 0);
      } else if (filters.availability === 'out-of-stock') {
        result = result.filter(product => product.inStock <= 0);
      }
    }

    // Сортировка
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        default:
          // Сортировка по умолчанию (можно добавить свою логику)
          break;
      }
    }

    setFilteredProducts(result);
  }, [filters, products]);

  const handleHoverState = (type, id) => {
    setHoverStates(prev => ({ ...prev, [type]: id }));
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    if (product.quantity <= 0) return;
    addToCart(product);
  };

  const handleFavoriteClick = (product, e) => {
    e.stopPropagation();
    toggleFavorite(product);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center py-12">Загрузка...</div>;
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Товары не найдены</p>
        <p className="text-gray-400 mt-2">Попробуйте изменить параметры фильтрации</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
      {filteredProducts.map((product) => {
        const isFavorite = favorites.some(fav => fav.id === product.id);
        const discountedPrice = product.discountPercentage 
          ? product.price * (1 - product.discountPercentage / 100)
          : null;

        return (
          <div
            key={product.id}
            className="relative group bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border border-gray-100"
            onMouseEnter={() => handleHoverState('product', product.id)}
            onMouseLeave={() => handleHoverState('product', null)}
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

              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {hoverStates.product === product.id && (
                <button
                  className="absolute top-3 right-3 p-2 bg-white/80 rounded-full shadow-sm hover:bg-white transition-all"
                  onClick={(e) => handleFavoriteClick(product, e)}
                  aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
                >
                  <img
                    src={isFavorite ? feelHeart : heart}
                    alt="Избранное"
                    className="w-5 h-5"
                  />
                </button>
              )}

              {product.discountPercentage && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  -{product.discountPercentage}%
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 line-clamp-2 h-14">
                {product.name}
              </h3>
              <div className="flex items-center justify-between mt-3">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {discountedPrice ? discountedPrice.toFixed(2) : product.price.toFixed(2)} руб.
                  </p>
                  {discountedPrice && (
                    <p className="text-sm text-gray-500 line-through">
                      {product.price.toFixed(2)} руб.
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  disabled={product.inStock <= 0}
                  className={`px-4 py-2 text-sm font-medium rounded-md bg-black text-white hover:bg-gray-800`}
                >
                  В корзину
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ListProduct;