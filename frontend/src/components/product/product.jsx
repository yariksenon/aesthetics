import React from 'react';
import { Outlet, useParams } from 'react-router-dom';

const Product = () => {
  const { productid } = useParams(); // Используйте productId с заглавной буквой "I"

  return (
    <div>
        <h1>ProductId: {productid}</h1>
        <Outlet /> {/* Отображаем вложенные маршруты */}
    </div>
  );
};

export default Product;
