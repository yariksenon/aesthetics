import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames';

import './custom.css';
import sectionGlass from '../../assets/home/Section/Glass.svg';

const textStyles = {
    small: 'text-[10px] sm:text-xs md:text-sm lg:text-base',
};

const inputStyles = `
    w-full lg:w-auto p-1 lg:p-2 
    border-2 border-black
    focus:outline-none focus:border-black
    transition-all duration-300
    placeholder-gray-500
    text-black bg-white
    flex-grow 
`;
const buttonStyles = 'bg-black rounded-tr-lg rounded-br-lg flex items-center justify-center w-[60px]';

const SearchInput = ({ value, onChange }) => (
    <input
        type="text"
        className={`${inputStyles} ${textStyles.small}`}
        placeholder="Поиск"
        value={value}
        onChange={onChange}
    />
);

const SearchButton = ({ onClick }) => (
    <button className={buttonStyles} onClick={onClick}>
        <img src={sectionGlass} alt="glass" className="h-7 w-7" />
    </button>
);

const MenuItem = ({ label, isActive, onClick }) => (
    <li 
        className={classNames(
            textStyles.small,
            'custom-underline cursor-pointer whitespace-nowrap',
            { 'text-red-500': label === 'Скидки %' },
            { 'font-bold': isActive }
        )}
        onClick={onClick}
    >
        {label}
    </li>
);

function Section() {
    const [activeItemId, setActiveItemId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { gender } = useParams();

    const menuItems = useMemo(() => [
        { id: 1, label: 'Новинки', category: 'new' },
        { id: 2, label: 'Обувь', category: 'shoes' },
        { id: 3, label: 'Одежда', category: 'clothes' },
        { id: 4, label: 'Тренировка', category: 'training' },
        { id: 5, label: 'Красота', category: 'beauty' },
        { id: 6, label: 'Скидки %', category: 'discounts' },
    ], []);

    const handleClick = useCallback((category, id) => {
        setActiveItemId(id);
        navigate(`/${gender}/${category.toLowerCase()}`);
    }, [navigate, gender]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = () => {
        if (searchQuery.trim()) {
          navigate(`/${gender}/search?q=${encodeURIComponent(searchQuery)}`);
          setSearchQuery(''); // Очищаем поле поиска после отправки
        }
      };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchSubmit();
        }
    };

    return (
        <nav className="mx-[15%] mt-[1%] flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="hidden lg:flex lg:space-x-4 w-full lg:w-auto">
                {menuItems.map((item) => (
                    <a
                        key={item.id}
                        href={`/${gender}/${item.category.toLowerCase()}`}
                        className={classNames(
                            textStyles.small,
                            'custom-underline cursor-pointer whitespace-nowrap',
                            { 'text-red-500': item.label === 'Скидки %' },
                            { 'font-bold': activeItemId === item.id }
                        )}
                        onClick={(e) => {
                            e.preventDefault();
                            handleClick(item.category, item.id);
                        }}
                    >
                        {item.label}
                    </a>
                ))}
            </div>
            <div className="flex w-full lg:w-[35%]">
                <SearchInput 
                    value={searchQuery} 
                    onChange={handleSearchChange}
                    onKeyPress={handleKeyPress}
                />
                <SearchButton onClick={handleSearchSubmit} />
            </div>
        </nav>
    );
}

export default Section;