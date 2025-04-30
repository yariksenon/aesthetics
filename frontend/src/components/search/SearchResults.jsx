import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import ProductList from '../categories/ListProduct'; // Ваш компонент для отображения товаров
// import { fetchSearchResults } from '../../api/products'; // API функция для поиска

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { gender } = useParams();

  useEffect(() => {
    const searchProducts = async () => {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams(location.search);
        const query = searchParams.get('q');
        
        if (query) {
          const data = await fetchSearchResults(query, gender);
          setResults(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [location.search, gender]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Результаты поиска: {new URLSearchParams(location.search).get('q')}
      </h1>
      {results.length > 0 ? (
        <ProductList products={results} />
      ) : (
        <p>Товары не найдены</p>
      )}
    </div>
  );
};

export default SearchResults;