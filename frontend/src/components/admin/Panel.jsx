import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import headerLogo from "../../assets/home/Header/Logo.svg";
import { FaUsers, FaBox, FaList, FaShoppingCart, FaStream, FaCreditCard, FaHeart, FaShoppingBag, FaChartBar, FaSignOutAlt, FaBell, FaMapMarkerAlt, FaClipboardList, FaMoneyBillAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Panel = () => {
    const adminPath = '/admin';
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [notifications, setNotifications] = useState(2);

    useEffect(() => {
        document.title = "Admin Panel";
    }, []);


    const buttons = [
        { path: `${adminPath}/users`, label: 'Пользователи', icon: <FaUsers className="mr-2" /> },
        { path: `${adminPath}/user_addresses`, label: 'Адреса пользователей', icon: <FaMapMarkerAlt className="mr-2" /> },
        { path: `${adminPath}/sessions`, label: 'Сессии', icon: <FaClipboardList className="mr-2" /> },
        { path: `${adminPath}/products`, label: 'Товары', icon: <FaBox className="mr-2" /> },
        { path: `${adminPath}/categories`, label: 'Категории', icon: <FaList className="mr-2" /> },
        { path: `${adminPath}/subcategories`, label: 'Подкатегории', icon: <FaStream className="mr-2" /> },
        { path: `${adminPath}/carts`, label: 'Корзина', icon: <FaShoppingCart className="mr-2" /> },
        { path: `${adminPath}/cart_items`, label: 'Элемент корзины', icon: <FaShoppingCart className="mr-2" /> },
        { path: `${adminPath}/wishlists`, label: 'Список желаний', icon: <FaHeart className="mr-2" /> },
        { path: `${adminPath}/orders`, label: 'Заказы', icon: <FaShoppingBag className="mr-2" /> },
        { path: `${adminPath}/order_items`, label: 'Детали заказа', icon: <FaClipboardList className="mr-2" /> },
        { path: `${adminPath}/payment_details`, label: 'Способ оплаты', icon: <FaMoneyBillAlt className="mr-2" /> },
        { path: `${adminPath}/statistics`, label: 'Статистика', icon: <FaChartBar className="mr-2" />, fullWidth: true },
    ];

    const filteredButtons = buttons.filter((button) =>
        button.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = [
        { label: 'Пользователи', value: 1200, icon: <FaUsers className="text-2xl" /> },
        { label: 'Товары', value: 450, icon: <FaBox className="text-2xl" /> },
        { label: 'Заказы', value: 320, icon: <FaShoppingBag className="text-2xl" /> },
    ];

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-white text-black p-8">
            <div className="flex justify-between items-center relative">
                <div className="absolute left-1/2 transform -translate-x-1/2">
                    <Link 
                        to="/" 
                    >
                        <img  src={headerLogo} alt="Logo" />
                    </Link>
                </div>

                <div className="flex items-center space-x-4 ml-auto">
                    <button
                        onClick={() => navigate('/admin/notifications')}
                        className="relative p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition duration-200"
                    >
                        <FaBell className="text-xl" />
                        {notifications > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                                {notifications}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                    >
                        <FaSignOutAlt className="mr-2" />
                        Выйти
                    </button>
                </div>
            </div>
            <p className="text-center bold text-xl text-gray-700 font-bold mt-5">Управление всеми аспектами приложения</p>

            <input
                type="text"
                placeholder="Поиск раздела..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full max-w-lg mx-auto mt-6 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-gray-100 p-6 rounded-lg shadow-md flex items-center space-x-4">
                        {stat.icon}
                        <div>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-gray-600">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid mt-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {filteredButtons.map((button, index) => (
                    <button
                        key={index}
                        onClick={() => navigate(button.path)}
                        className={`flex items-center justify-center bg-gradient-to-r from-black to-gray-800 text-white px-6 py-4 rounded-lg shadow-lg hover:from-gray-800 hover:to-black transition duration-200 transform hover:scale-105 border border-gray-700 ${
                            button.fullWidth ? 'col-span-full' : 'w-full'
                        }`}
                    >
                        {button.icon}
                        <span className="text-xl font-semibold">{button.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Panel;