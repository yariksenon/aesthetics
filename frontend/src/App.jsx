import { useState } from 'react'
import Home from './components/main/Home'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <>
      <Router> 
        <Routes> 
          <Route path="/" element={<Home />} />
          
        </Routes> 
      </Router>
    </>
  )
}

export default App