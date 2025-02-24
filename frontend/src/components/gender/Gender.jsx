// gender.jsx
import React from 'react';
import { Outlet, useParams, Navigate } from 'react-router-dom';

const Gender = () => {
  const { gender } = useParams(); // Извлекаем параметр `gender` из URL

  // Допустимые значения для параметра `gender`
  const validGenders = ['man', 'woman', 'children'];

  // Если значение `gender` недопустимо, перенаправляем на страницу 404
  if (!validGenders.includes(gender)) {
    return <Navigate to="/404" />;
  }

  return (
    <div>
      <h1>Gender: {gender}</h1> {/* Отображаем параметр `gender` */}
      <Outlet /> {/* Отображаем вложенные маршруты */}
    </div>
  );
};

export default Gender;