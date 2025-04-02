import React, { Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

// API URL для управления товарами
const API = {
    GET_PRODUCTS: 'http://localhost:8080/api/v1/admin/products',
    GET_PRODUCT: 'http://localhost:8080/api/v1/admin/products/:id',
    POST_PRODUCT: 'http://localhost:8080/api/v1/admin/products',
    PUT_PRODUCT: 'http://localhost:8080/api/v1/admin/products/:id',
    DELETE_PRODUCT: 'http://localhost:8080/api/v1/admin/products/:id',
};

import AdminProductAdd from "./product/AdminProductAdd";
import AdminProductDelete from "./product/AdminProductDelete";
import AdminProductEdit from "./product/AdminProductEdit";
import AdminProductView from "./product/AdminProductView";

const Products = () => {
    const [activeComponent, setActiveComponent] = useState("view");
    const navigate = useNavigate();

    // Массив действий
    const actions = [
        { id: "view", label: "Просмотр товаров", component: <AdminProductView /> },
        { id: "add", label: "Добавить товар", component: <AdminProductAdd /> },
        { id: "edit", label: "Редактировать товар", component: <AdminProductEdit /> },
        { id: "delete", label: "Удалить товар", component: <AdminProductDelete /> },
    ];

    return (
        <div className="min-h-screen bg-white text-black flex">
            {/* Боковое меню */}
            <div className="w-64 bg-black text-white p-4 flex flex-col">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition duration-200"
                >
                    <FaArrowLeft className="mr-2" />
                    Назад
                </button>
                
                {/* Генерация списка действий из массива */}
                <ul className="space-y-2">
                    {actions.map((action) => (
                        <li key={action.id}>
                            <button
                                className={`w-full text-left px-4 py-2 rounded ${
                                    activeComponent === action.id
                                        ? "bg-white text-black"
                                        : "hover:bg-gray-800"
                                }`}
                                onClick={() => setActiveComponent(action.id)}
                            >
                                {action.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* Основной контент */}
            <div className="flex-1 p-6">
                <Suspense fallback={<div className="text-lg">Загрузка...</div>}>
                    {/* Рендер активного компонента */}
                    {actions.find((action) => action.id === activeComponent)?.component}
                </Suspense>
            </div>
        </div>
    );
};

export default Products;
