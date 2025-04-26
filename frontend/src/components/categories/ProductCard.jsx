import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductCard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/admin/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        setError(error.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`Товар "${product.name}" добавлен в корзину!`, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });    
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Товары</h1>
      {products.length === 0 ? (
        <p className="text-gray-500">Нет товаров</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                <img
                  src={`http://localhost:8080/static/${product.image_path}`}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300';
                  }}
                />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h2>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold text-gray-900">Br {product.price.toFixed(2)}</span>
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      product.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.quantity > 0 ? 'В наличии' : 'Нет в наличии'}
                  </span>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.quantity <= 0}
                  className={`w-full py-2 px-4 rounded transition-colors duration-300 ${
                    product.quantity > 0
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {product.quantity > 0 ? 'Добавить в корзину' : 'Нет в наличии'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductCard;
