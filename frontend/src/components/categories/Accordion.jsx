import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Arrow from '../../assets/category/accordion/DownArrow.svg';

const Accordion = () => {
  const [openIndexes, setOpenIndexes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await axios.get('http://localhost:8080/api/v1/gender/category/');
        setCategories(categoriesResponse.data.categories);

        const subCategoriesResponse = await axios.get('http://localhost:8080/api/v1/gender/category/subCategory/');
        
        const subCategoriesMap = subCategoriesResponse.data.subCategories.reduce((acc, subCategory) => {
          if (!acc[subCategory.parent_id]) {
            acc[subCategory.parent_id] = [];
          }
          acc[subCategory.parent_id].push(subCategory);
          return acc;
        }, {});

        setSubCategories(subCategoriesMap);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };

    fetchData();
  }, []);

  const toggleAccordion = (index) => {
    setOpenIndexes((prevIndexes) => 
      prevIndexes.includes(index)
        ? prevIndexes.filter((i) => i !== index)
        : [...prevIndexes, index]
    );
  };

  return (
    <ul className="mt-2">
      {categories.slice(0, 8).map((category, index) => (
        <li key={category.id} className="py-1">
          <button
            onClick={() => toggleAccordion(index)}
            className="w-full text-left focus:outline-none flex justify-between items-center"
          >
            <span className="text-lg py-2 font-semibold">{category.name}</span>
            <img
              src={Arrow}
              alt="arrow"
              className={`h-6 w-6 transform transition-transform duration-300 ${
                openIndexes.includes(index) ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </button>
          {openIndexes.includes(index) && (
            <div className="mt-2">
              {subCategories[category.id]?.map((subCategory) => (
                <div key={subCategory.id} className="pl-4 py-1">
                  <span className="text-md cursor-pointer">{subCategory.name}</span>
                </div>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default Accordion;