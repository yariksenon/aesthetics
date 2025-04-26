import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import headerLogo from "../../assets/home/Header/Logo.svg";
import headerBasket from "../../assets/home/Header/Basket.svg";
import closeButtonWhite from "../../assets/home/Header/CloseButtonWhite.svg";
import AuthModal from './AuthModal';
import './custom.css';

const MenuItem = ({ label, value, activeMenuItem, onClick }) => (
  <li
    onClick={() => onClick(value)}
    className={`text-[10px] sm:text-xs md:text-sm lg:text-base ${
      activeMenuItem === value ? 'text-red-500' : 'text-black'
    } ${label === 'Скидки' ? 'text-red-500' : ''} custom-underline cursor-pointer whitespace-nowrap`}
  >
    {label}
  </li>
);

const MobileMenu = ({ isMenuOpen, toggleMenu, menuItems, handleGenderChange, handleCategoryChange, activeMenuItem }) => (
  isMenuOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-40 lg:hidden" onClick={toggleMenu}>
      <div className="bg-white w-3/4 h-full p-6 relative">
        <ul className="space-y-4">
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              label={item.label}
              value={item.value}
              activeMenuItem={activeMenuItem}
              onClick={item.isGender ? handleGenderChange : handleCategoryChange}
            />
          ))}
        </ul>
      </div>

      <button
        onClick={toggleMenu}
        className="fixed right-[5%] sm:right-[10%] md:right-[15%] top-4 cursor-pointer z-50"
        aria-label="Закрыть меню"
      >
        <img
          src={closeButtonWhite}
          alt="Close menu"
          className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
        />
      </button>
    </div>
  )
);

function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showSocials, setShowSocials] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState(() => {
    const savedMenuItem = localStorage.getItem('activeMenuItem');
    return savedMenuItem && ['woman', 'man', 'children'].includes(savedMenuItem) ? savedMenuItem : 'woman';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const { gender } = useParams();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('userData'));
    
    if (token && user) {
      setIsAuthenticated(true);
      setUserData(user);
    }
  }, []);

  const handleLoginSuccess = useCallback((token, user) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    setIsAuthenticated(true);
    setUserData(user);
    setIsModalOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setUserData(null);
    navigate('/');
  }, [navigate]);

  
  useEffect(() => {
    if (['woman', 'man', 'children'].includes(activeMenuItem)) {
      localStorage.setItem('activeMenuItem', activeMenuItem);
    }
  }, [activeMenuItem]);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback((e) => {
    e.stopPropagation();
    setIsModalOpen(false);
  }, []);
  const toggleMenu = useCallback(() => setIsMenuOpen(!isMenuOpen), [isMenuOpen]);

  const switchToRegister = useCallback(() => setIsLogin(false), []);
  const switchToLogin = useCallback(() => setIsLogin(true), []);
  const toggleSocials = useCallback(() => setShowSocials(!showSocials), [showSocials]);

  const handleGenderChange = useCallback(
    (newGender) => {
      setActiveMenuItem(newGender);
      navigate(`/${newGender}`);
    },
    [navigate]
  );

  const handleCategoryChange = useCallback(
    (category) => {
      setActiveMenuItem(category);
      navigate(`/${gender}/${category}`);
    },
    [navigate, gender]
  );

  const menuItems = [
    { label: 'Женщинам', value: 'woman', isGender: true },
    { label: 'Мужчинам', value: 'man', isGender: true },
    { label: 'Детям', value: 'children', isGender: true },
    { label: 'Новинки', value: 'new', isGender: false },
    { label: 'Обувь', value: 'shoes', isGender: false },
    { label: 'Одежда', value: 'clothes', isGender: false },
    { label: 'Тренировка', value: 'training', isGender: false },
    { label: 'Красота', value: 'beauty', isGender: false },
    { label: 'Скидки %', value: 'discounts', isGender: false },
  ];

  return (
    <header className="mx-[15%] mt-[1%] flex justify-between items-center">
      <div className="lg:hidden">
        <button onClick={toggleMenu} aria-label="Открыть меню">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>
      </div>
  
      <div className="flex items-center flex-grow">
        <div className="hidden lg:flex md:space-x-5 lg:space-x-6">
          {menuItems.slice(0, 3).map((item, index) => (
            <button
              key={index}
              onClick={() => item.isGender ? handleGenderChange(item.value) : handleCategoryChange(item.value)}
              className={`text-[10px] sm:text-xs md:text-sm lg:text-base ${
                activeMenuItem === item.value ? 'text-red-500' : 'text-black'
              } ${item.label === 'Скидки' ? 'text-red-500' : ''} custom-underline`}
            >
              {item.label}
            </button>
          ))}
        </div>
  
        <div className="flex justify-center flex-grow">
          <Link to="/" target="_top">
            <img
              src={headerLogo}
              alt="Logo"
              className="cursor-pointer h-6 md:h-10 w-auto"
            />
          </Link>
        </div>
      </div>
  
      {/* Блок авторизации и корзины */}
      <div className="flex space-x-2 sm:space-x-3 md:space-x-5 lg:space-x-10 items-center">
        {isAuthenticated ? (
          <div className="relative group">
            <button className="flex items-center space-x-1">
              <span className="text-[10px] sm:text-xs md:text-sm lg:text-base text-black">
                {userData?.firstName || 'Профиль'}
              </span>
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            
            {/* Выпадающее меню профиля */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block border border-gray-200">
              <Link 
                to="/profile" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Мой профиль
              </Link>
              <Link 
                to="/orders" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Мои заказы
              </Link>
              <Link 
                to="/wishlist" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Избранное
              </Link>
              <div className="border-t border-gray-200 my-1"></div>
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        ) : (
          <button
            className="text-[10px] sm:text-xs md:text-sm lg:text-base text-black bg-white py-0.5 sm:py-1.5 md:py-2 px-2 sm:px-4 md:px-6 border-[1px] md:border-2 border-black rounded-lg transition duration-300 ease-in-out transform hover:bg-black hover:text-white hover:border-white hover:shadow-lg"
            onClick={openModal}
            aria-label="Войти"
          >
            Войти
          </button>
        )}
        
        {/* Иконка корзины */}
        <div className="flex items-center transition-transform duration-300 ease-in-out hover:scale-110">
          <img
            src={headerBasket}
            className="h-6 sm:h-8 md:h-10 w-6 sm:w-8 md:w-10 cursor-pointer"
            alt="Basket"
          />
          <Link to="/cart" className="text-[10px] sm:text-xs md:text-sm lg:text-base text-black custom-underline">
            <p>Корзина</p>
          </Link>
        </div>
      </div>
  
      {isModalOpen && (
        <AuthModal
          isLogin={isLogin}
          closeModal={closeModal}
          switchToRegister={switchToRegister}
          switchToLogin={switchToLogin}
          showSocials={showSocials}
          toggleSocials={toggleSocials}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
  
      {/* Мобильное меню (полноэкранное) */}
      <MobileMenu
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        menuItems={menuItems}
        handleGenderChange={handleGenderChange}
        handleCategoryChange={handleCategoryChange}
        activeMenuItem={activeMenuItem}
      />
    </header>
  );
}

export default React.memo(Header);