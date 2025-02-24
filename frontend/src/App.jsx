// App.jsx
import { useState } from 'react'
import Home from './components/home/Home'
import Cart from './components/cart/Cart'
import AdminPanel from './components/admin/AdminPanel';
import AdminPanelUser from './components/admin/AdminUser';
import WhyUs from './components/home/WhyUs'
import NotFound from './components/notFound/NotFound'; // Импортируем компонент для страницы 404

import Category from './components/category/category';
import SubCategory from './components/subCategory/subCategory';
import Product from './components/product/product';
import './App.css'
import { BrowserRouter as Router, Routes, Route,  Navigate } from 'react-router-dom';

export default function App() {
  return (
    <>
      <Router> 
        <Routes> 
        <Route path="/" element={<Navigate to="/woman" />} /> {/* Перенаправление на /woman по умолчанию */}

          <Route path="/about" element={<WhyUs />} />
          <Route path="/cart" element={<Cart />}/> 
          <Route path="/admin" element={<AdminPanel />}/>
          <Route path="/admin/users" element={<AdminPanelUser />}/>
          <Route path="/admin/users/:id" element={<AdminPanelUser />}/>

          {/* Маршруты для товаров */}
          <Route path="/:gender" element={<Home />}>
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
  )
}