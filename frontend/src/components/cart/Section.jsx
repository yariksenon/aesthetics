import React from 'react';
import './custom.css';
import sectionGlass from '../../assets/home/Section/Glass.svg';

const menuItems = [
    { label: 'Новинки', isActive: false },
    { label: 'Обувь', isActive: false },
    { label: 'Одежда', isActive: false },
    { label: 'Аксессуары', isActive: false },
    { label: 'Красота', isActive: false },
    { label: 'Скидки', isActive: true },
];

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

const MenuItem = ({ label, isActive }) => (
    <li className={`${textStyles.small} ${isActive ? 'text-red-500' : ''} custom-underline cursor-pointer whitespace-nowrap`}>
        {label}
    </li>
);

function Section() {
    return (
        <>
            <nav className="mx-[15%] mt-[1%] flex flex-col lg:flex-row justify-between items-start lg:items-center">
                {/* Меню */}
                <ul className="hidden lg:flex lg:space-x-4 justify-between lg:justify-normal w-full lg:w-auto">
                    {menuItems.map((item, index) => (
                        <MenuItem key={index} label={item.label} isActive={item.isActive} />
                    ))}
                </ul>

                {/* Поисковая строка */}
                <div className="flex w-full lg:w-[35%]">
                    <SearchInput />
                    <SearchButton />
                </div>
            </nav>
        </>
    );
}

export default Section;