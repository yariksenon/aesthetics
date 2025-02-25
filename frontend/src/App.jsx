import { useState } from 'react';
import Home from './components/home/Home';
import Cart from './components/cart/Cart';
import AdminPanel from './components/admin/AdminPanel';
import AdminPanelUser from './components/admin/AdminUser';
import WhyUs from './components/home/WhyUs';
import NotFound from './components/notFound/NotFound'; // Импортируем компонент для страницы 404

import Category from './components/category/category';
import SubCategory from './components/subCategory/subCategory';
import Product from './components/product/product';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';

// Компонент для проверки допустимых значений gender
function GenderRoute() {
  const { gender } = useParams(); // Получаем gender из URL

  // Допустимые значения gender
  const validGenders = ['man', 'woman', 'children'];

  // Если gender недопустим, перенаправляем на страницу 404
  if (!validGenders.includes(gender)) {
    return <Navigate to="/404" />;
  }

  // Если gender допустим, рендерим Home
  return <Home />;
}

export default function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/woman" />} /> {/* Перенаправление на /woman по умолчанию */}

          <Route path="/about" element={<WhyUs />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/users" element={<AdminPanelUser />} />

          {/* Маршруты для товаров */}
          <Route path="/:gender" element={<GenderRoute />}>
            <Route path=":category" element={<Category />}>
              <Route path=":subcategory" element={<SubCategory />}>
                <Route path=":productid" element={<Product />} />
              </Route>
            </Route>
          </Route>

          {/* Маршрут для страницы 404 */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" />} /> {/* Перенаправление на 404 для любых других маршрутов */}
        </Routes>
      </Router>
    </>
  );
}