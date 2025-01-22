import { useState } from 'react'
import Home from './components/home/Home'
import Cart from './components/cart/Cart'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <>
      <Router> 
        <Routes> 
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />}/> 
        </Routes> 
      </Router>
    </>
  )
}

export default App