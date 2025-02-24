import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 text-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl transition-transform duration-500 hover:scale-105 hover:shadow-3xl">
        <h1 className="text-9xl font-bold text-gray-800 mb-8 animate-pulse">404</h1>
        <p className="text-2xl text-gray-600 mb-8 animate-fade-in">Страница не найдена</p>
        <Link 
          to="/" 
          className="inline-block text-xl text-white bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 rounded-full shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:shadow-xl hover:translate-y-1"
        >
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
};

export default NotFound;