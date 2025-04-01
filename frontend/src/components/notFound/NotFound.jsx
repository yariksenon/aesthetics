import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      {/* Анимированная надпись 404 */}
      <div className="relative mb-12 group">
        <div className="text-[180px] md:text-[240px] font-bold tracking-tighter leading-none">
          <span className="inline-block transition-all duration-500 group-hover:translate-y-2 group-hover:text-gray-300">4</span>
          <span className="inline-block transition-all duration-700 group-hover:-translate-y-3 group-hover:text-gray-400">0</span>
          <span className="inline-block transition-all duration-900 group-hover:translate-y-4 group-hover:text-gray-500">4</span>
        </div>
        <div className="absolute inset-0 border-4 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
      </div>

      {/* Креативный текст */}
      <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
        <span className="inline-block hover:rotate-6 hover:scale-110 transition-transform">О</span>
        <span className="inline-block hover:-rotate-6 hover:scale-110 transition-transform">й</span>
        <span className="inline-block hover:rotate-12 hover:scale-110 transition-transform">!</span>
        <span className="mx-2"> </span>
        <span className="inline-block hover:-rotate-3 hover:scale-110 transition-transform">Т</span>
        <span className="inline-block hover:rotate-3 hover:scale-110 transition-transform">е</span>
        <span className="inline-block hover:-rotate-12 hover:scale-110 transition-transform">м</span>
        <span className="inline-block hover:rotate-6 hover:scale-110 transition-transform">н</span>
        <span className="inline-block hover:-rotate-6 hover:scale-110 transition-transform">о</span>
        <span className="inline-block hover:rotate-12 hover:scale-110 transition-transform">т</span>
        <span className="inline-block hover:-rotate-3 hover:scale-110 transition-transform">а</span>
      </h2>

      <p className="text-lg md:text-xl mb-10 max-w-md text-center hover:text-gray-300 transition-colors">
        Кажется, вы заблудились в цифровой пустоте. 
        <span className="block mt-2 text-sm opacity-70 hover:opacity-100 transition-opacity">
          (Но не волнуйтесь, мы вас спасём)
        </span>
      </p>

      {/* Интерактивные кнопки */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-white text-black font-bold rounded-full 
                    hover:bg-black hover:text-white hover:border-white border-2 border-transparent
                    transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-white/20"
        >
          На главную
        </button>
      </div>

      {/* Анимированные элементы декора */}
      <div className="absolute top-10 left-10 w-4 h-4 bg-white rounded-full opacity-70 hover:opacity-100 hover:scale-150 transition-all"></div>
      <div className="absolute bottom-20 right-16 w-6 h-6 bg-white rounded-full opacity-50 hover:opacity-100 hover:scale-150 transition-all"></div>
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-white rounded-full opacity-40 hover:opacity-100 hover:scale-200 transition-all"></div>
      
      {/* Микро-взаимодействие в подвале */}
      <div className="absolute bottom-6 text-xs opacity-50 hover:opacity-100 transition-opacity">
        <span className="inline-block hover:animate-spin">⚫</span> 404 Not Found <span className="inline-block hover:animate-spin">⚪</span>
      </div>
    </div>
  );
};

export default NotFound;