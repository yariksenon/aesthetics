// SubCategory.jsx
import React from 'react';
import { Outlet, useParams } from 'react-router-dom';

const SubCategory = () => {
    const { subcategory } = useParams(); // Используйте правильное название параметра

    return (
        <div>
            <h1>SubCategory: {subcategory}</h1>
            <Outlet /> {/* Отображаем вложенные маршруты */}
        </div>
    );
};

export default SubCategory;
