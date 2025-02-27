import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
    hover:placeholder-gray-500
    focus:ring-black
    text-black bg-white
    flex-grow 
`;
const buttonStyles = 'bg-black rounded-tr-lg rounded-br-lg flex items-center justify-center w-[60px]';

const SearchInput = () => (
    <input
        type="text"
        className={`${inputStyles} ${textStyles.small} w-full lg:w-auto`}
        placeholder="Поиск"
    />
);

const SearchButton = () => (
    <button className={buttonStyles}>
        <img src={sectionGlass} alt="glass" className="h-7 w-7" />
    </button>
);

const MenuItem = ({ label, onClick }) => (
    <li 
        className={`${textStyles.small} custom-underline cursor-pointer whitespace-nowrap ${
            label === 'Скидки %' ? 'text-red-500' : ''
        }`}
        onClick={onClick}
    >
        {label}
    </li>
);

function Section() {
    const [activeItemId, setActiveItemId] = useState(null);

    const menuItems = useMemo(() => [
        { id: 1, label: 'Новинки', category: 'new'},
        { id: 2, label: 'Обувь', category: 'shoes' },
        { id: 3, label: 'Одежда', category: 'clothes' },
        { id: 4, label: 'Тренировка', category: 'training' },
        { id: 5, label: 'Красота', category: 'beauty' },
        { id: 6, label: 'Скидки %', category: 'discounts' },
    ], []);

    const navigate = useNavigate();
    const { gender } = useParams();

    const handleClick = useCallback((category, id) => {
        setActiveItemId(id);
        navigate(`/${gender}/${category.toLowerCase()}`);
    }, [navigate, gender]);

    return (
        <>
            <nav className="mx-[15%] mt-[1%] flex flex-col lg:flex-row justify-between items-start lg:items-center">
                <ul className="hidden lg:flex lg:space-x-4 justify-between lg:justify-normal w-full lg:w-auto">
                    {menuItems.map((item) => (
                        <MenuItem
                            key={item.id}
                            label={item.label}
                            isActive={item.id}
                            onClick={() => handleClick(item.category, item.id)}
                        />
                    ))}
                </ul>

                <div className="flex w-full lg:w-[35%]">
                    <SearchInput />
                    <SearchButton />
                </div>
            </nav>
        </>
    );
}

export default Section;