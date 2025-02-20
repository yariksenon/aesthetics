import { useState } from 'react'
import Home from './components/home/Home'
import Cart from './components/cart/Cart'
import AdminPanel from './components/admin/AdminPanel';
import AdminPanelUser from './components/admin/AdminUser';
import WhyUs from './components/home/WhyUs'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

export default function App() {
  return (
    <>
      <Router> 
        <Routes> 
          <Route path="/" element={<Home />} />

          <Route path="/about" element={<WhyUs />} />
          <Route path="/cart" element={<Cart />}/> 
          <Route path="/admin" element={<AdminPanel />}/>
          <Route path="/admin/users" element={<AdminPanelUser />}/>
          <Route path="/admin/users/:id" element={<AdminPanelUser />}/>
        </Routes> 
      </Router>
    </>
  )
}

