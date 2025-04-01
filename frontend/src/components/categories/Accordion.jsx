import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Arrow from '../../assets/category/accordion/DownArrow.svg';

const Accordion = () => {
  const [openIndexes, setOpenIndexes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const contentRefs = useRef([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
  
        // Загрузка категорий
        const categoriesResponse = await axios.get('http://localhost:8080/api/v1/gender/category/');
        console.log('Ответ категорий:', categoriesResponse.data); // Для отладки
        
        // Проверяем наличие поля category в ответе
        if (!categoriesResponse.data?.category) {
          throw new Error('Не удалось загрузить категории: пустой ответ от сервера');
        }
  
        // Проверяем, что category - массив
        if (!Array.isArray(categoriesResponse.data.category)) {
          throw new Error('Не удалось загрузить категории: неверный формат данных');
        }
  
        const validCategories = categoriesResponse.data.category.filter(
          cat => cat?.id && cat?.name?.trim()
        );
  
        if (validCategories.length === 0) {
          throw new Error('Нет валидных категорий для отображения');
        }
  
        setCategories(validCategories);
  
        // Загрузка подкатегорий
        const subCategoriesResponse = await axios.get('http://localhost:8080/api/v1/gender/category/subCategory/');
        console.log('Ответ подкатегорий:', subCategoriesResponse.data); // Для отладки
        
        // Проверяем, что ответ - массив (как в вашем примере)
        if (!Array.isArray(subCategoriesResponse.data)) {
          throw new Error('Не удалось загрузить подкатегории: неверный формат ответа');
        }
  
        const validSubCategories = subCategoriesResponse.data.filter(
          subCat => subCat?.id && subCat?.name?.trim() && subCat?.parent_id
        );
  
        const subCategoriesMap = validSubCategories.reduce((acc, subCategory) => {
          if (!acc[subCategory.parent_id]) {
            acc[subCategory.parent_id] = [];
          }
          acc[subCategory.parent_id].push(subCategory);
          return acc;
        }, {});
  
        setSubCategories(subCategoriesMap);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setError(error.message || 'Произошла ошибка при загрузке данных');
      } finally {
        setLoading(false);
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

    categories.forEach((_, index) => {
      if (!openIndexes.includes(index) && contentRefs.current[index]) {
        contentRefs.current[index].style.maxHeight = '0';
      }
    });
  }, [openIndexes, categories]);

  if (loading) {
    return <div className="py-4 text-center">Загрузка категорий...</div>;
  }

  if (error) {
    return (
      <div className="py-4 text-center text-red-500">
        {error}
        <button 
          onClick={() => window.location.reload()}
          className="ml-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Обновить
        </button>
      </div>
    );
  }

  if (categories.length === 0) {
    return <div className="py-4 text-center">Нет доступных категорий</div>;
  }

  return (
    <ul>
      {categories.slice(0, 8).map((category, index) => (
        <li key={category.id} className="py-1">
          <button
            onClick={() => toggleAccordion(index)}
            className="w-full text-left focus:outline-none flex justify-between items-center"
            aria-expanded={openIndexes.includes(index)}
          >
            <span className="text-lg py-1 font-semibold">
              {category.name || 'Без названия'}
            </span>
            {subCategories[category.id]?.length > 0 && (
              <img
                src={Arrow}
                alt="arrow"
                className={`h-6 w-6 transform transition-transform duration-300 ${
                  openIndexes.includes(index) ? 'rotate-180' : 'rotate-0'
                }`}
              />
            )}
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
            {subCategories[category.id]?.length > 0 ? (
              subCategories[category.id].map((subCategory) => (
                <div key={subCategory.id} className="py-2">
                  <span className="text-md cursor-pointer text-gray-600 hover:text-stone-900">
                    {subCategory.name || 'Без названия'}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-2 text-gray-400">Нет подкатегорий</div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default Accordion;