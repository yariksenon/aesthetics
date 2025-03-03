import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Arrow from '../../assets/category/accordion/DownArrow.svg';

const Accordion = () => {
  const [openIndexes, setOpenIndexes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState({});
  const contentRefs = useRef([]);

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

  useEffect(() => {
    openIndexes.forEach(index => {
      if (contentRefs.current[index]) {
        contentRefs.current[index].style.maxHeight = `${contentRefs.current[index].scrollHeight}px`;
      }
    });

    openIndexes.forEach(index => {
      if (!openIndexes.includes(index) && contentRefs.current[index]) {
        contentRefs.current[index].style.maxHeight = '0';
      }
    });
  }, [openIndexes]);

  return (
    <ul>
      {categories.slice(0, 8).map((category, index) => (
        <li key={category.id} className="py-1">
          <button
            onClick={() => toggleAccordion(index)}
            className="w-full text-left focus:outline-none flex justify-between items-center"
          >
            <span className="text-lg py-1 font-semibold">{category.name}</span>
            <img
              src={Arrow}
              alt="arrow"
              className={`h-6 w-6 transform transition-transform duration-300 ${
                openIndexes.includes(index) ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </button>
          <div
            ref={el => contentRefs.current[index] = el}
            style={{
              maxHeight: openIndexes.includes(index) ? `${contentRefs.current[index]?.scrollHeight}px` : '0',
              overflow: 'hidden',
              transition: 'max-height 0.3s ease-out'
            }}
            className="mt-2"
          >
            {subCategories[category.id]?.map((subCategory) => (
              <div key={subCategory.id} className="py-2">
                <span className="text-md cursor-pointer text-gray-600 hover:text-stone-900">{subCategory.name}</span>
              </div>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default Accordion;
