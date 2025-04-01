import React, { useState } from 'react';

const ProductFilters = () => {
  const [material, setMaterial] = useState('');
  const [insulation, setInsulation] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [priceRange, setPriceRange] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="material">
            Основной материал
          </label>
          <select
            id="material"
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          >
            <option value="">Выберите материал</option>
            <option value="cotton">Хлопок</option>
            <option value="polyester">Полиэстер</option>
            <option value="wool">Шерсть</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="insulation">
            Утеплитель
          </label>
          <select
            id="insulation"
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={insulation}
            onChange={(e) => setInsulation(e.target.value)}
          >
            <option value="">Выберите утеплитель</option>
            <option value="down">Пух</option>
            <option value="synthetic">Синтетика</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="color">
            Цвет
          </label>
          <select
            id="color"
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          >
            <option value="">Выберите цвет</option>
            <option value="black">Черный</option>
            <option value="white">Белый</option>
            <option value="blue">Синий</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="size">
            Размер
          </label>
          <select
            id="size"
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          >
            <option value="">Выберите размер</option>
            <option value="s">S</option>
            <option value="m">M</option>
            <option value="l">L</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priceRange">
            Цена
          </label>
          <select
            id="priceRange"
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
          >
            <option value="">Выберите ценовой диапазон</option>
            <option value="0-50">0 - 50</option>
            <option value="50-100">50 - 100</option>
            <option value="100-200">100 - 200</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Применить фильтры
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductFilters;