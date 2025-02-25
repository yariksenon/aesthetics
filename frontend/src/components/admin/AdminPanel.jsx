import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import headerLogo from "../../assets/home/header-logo.svg";
import { FaUsers, FaBox, FaList, FaShoppingCart, FaCreditCard, FaHeart, FaShoppingBag } from 'react-icons/fa';

const AdminPanel = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Admin Panel";
    }, []);

    const buttons = [
        { path: '/admin/users', label: 'Пользователи', icon: <FaUsers className="mr-2" /> },
        { path: '/admin/product', label: 'Товары', icon: <FaBox className="mr-2" /> },
        { path: '/admin/category', label: 'Категории', icon: <FaList className="mr-2" /> },
        { path: '/admin/order', label: 'Заказы', icon: <FaShoppingBag className="mr-2" /> },
        { path: '/admin/payment', label: 'Платежи', icon: <FaCreditCard className="mr-2" /> },
        { path: '/admin/wishlist', label: 'Список желаний', icon: <FaHeart className="mr-2" /> },
        { path: '/admin/cart', label: 'Корзина', icon: <FaShoppingCart className="mr-2" /> },
    ];

    return (
        <div className="min-h-screen bg-white text-black p-8">
            <img src={headerLogo} alt="Logo" className="mx-auto" />
            <p className="text-center bold text-xl text-gray-700 font-bold mt-5">Управление всеми аспектами приложения</p>
            <div className="grid mt-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {buttons.map((button, index) => (
                    <button
                        key={index}
                        onClick={() => navigate(button.path)}
                        className="flex items-center justify-center bg-black text-white px-6 py-4 rounded-lg shadow-lg hover:bg-gray-800 transition duration-200 transform hover:scale-105 border border-gray-700 w-full"
                    >
                        {button.icon}
                        <span className="text-xl font-semibold">{button.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AdminPanel;