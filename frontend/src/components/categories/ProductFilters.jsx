import { useState } from 'react';

const ProductFilter = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    sortBy: 'default',
  });

  // Пример категорий - можно заменить на свои
  const categories = ['Электроника', 'Одежда', 'Книги', 'Для дома'];
  
  const priceRanges = [
    { id: '0-50', label: 'До 50 ₽' },
    { id: '50-100', label: '50-100 ₽' },
    { id: '100-500', label: '100-500 ₽' },
    { id: '500+', label: '500+ ₽' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  return (
    <div className="bg-white text-black py-4 border-b border-gray-200">
      <div className="">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Категория</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleChange}
              className="w-full p-2 border border-black rounded-none bg-white focus:outline-none focus:ring-0 focus:border-black"
            >
              <option value="">Все категории</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Цена</label>
            <select
              name="priceRange"
              value={filters.priceRange}
              onChange={handleChange}
              className="w-full p-2 border border-black rounded-none bg-white focus:outline-none focus:ring-0 focus:border-black"
            >
              <option value="">Любая цена</option>
              {priceRanges.map(range => (
                <option key={range.id} value={range.id}>{range.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Сортировка</label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleChange}
              className="w-full p-2 border border-black rounded-none bg-white focus:outline-none focus:ring-0 focus:border-black"
            >
              <option value="default">По умолчанию</option>
              <option value="price-asc">Цена: по возрастанию</option>
              <option value="price-desc">Цена: по убыванию</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;