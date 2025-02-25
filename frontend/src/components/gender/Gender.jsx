import React from 'react';
import { useParams, Outlet, Navigate } from 'react-router-dom'; 

function GenderRoute() {
  const { gender } = useParams(); // Получаем gender из URL

  // Допустимые значения gender
  const validGenders = ['man', 'woman', 'children'];

  // Если gender недопустим, перенаправляем на страницу 404
  if (!validGenders.includes(gender)) {
    return <Navigate to="/404" />;
  }

  // Если gender допустим, рендерим Outlet для отображения вложенных маршрутов
  return <Outlet />;
}

export default GenderRoute;
