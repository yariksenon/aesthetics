// Category.jsx
import React from 'react';
import { useParams, Outlet } from 'react-router-dom'; // Добавляем useParams


const Category = () => {
//    const { category } = useParams(); // Извлекаем параметр `gender` из URL

  return (
    <div>
        <h1>Category: </h1>
      <Outlet /> {/* Отображаем вложенные маршруты */}
    </div>
  );
};

export default Category;