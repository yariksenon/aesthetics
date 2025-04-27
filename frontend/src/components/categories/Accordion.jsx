import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Arrow from '../../assets/category/accordion/DownArrow.svg';

const Accordion = () => {
  const [openIndexes, setOpenIndexes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const contentRefs = useRef([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, subCategoriesRes] = await Promise.all([
          axios.get('http://localhost:8080/api/v1/gender/category/'),
          axios.get('http://localhost:8080/api/v1/gender/category/subCategory/')
        ]);

        const validCategories = (categoriesRes.data?.category || [])
          .filter(cat => cat?.id && cat?.name?.trim());

        const subCategoriesMap = (subCategoriesRes.data || [])
          .filter(subCat => subCat?.id && subCat?.name?.trim() && subCat?.parent_id)
          .reduce((acc, subCat) => {
            acc[subCat.parent_id] = [...(acc[subCat.parent_id] || []), subCat];
            return acc;
          }, {});

        setCategories(validCategories);
        setSubCategories(subCategoriesMap);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleAccordion = (index) => {
    setOpenIndexes(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  if (loading) return <div className="py-4 text-center">Загрузка категорий...</div>;
  if (!categories.length) return <div className="py-4 text-center">Нет доступных категорий</div>;

  return (
    <div className='mr-5'>
    
      <ul>
        {categories.slice(0, 8).map((category, index) => (
          <li key={category.id} className="py-1">
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full text-left focus:outline-none flex justify-between items-center"
            >
              <span className="text-lg py-1 font-semibold">
                {category.name || 'Без названия'}
              </span>
              {subCategories[category.id]?.length > 0 && (
                <img
                  src={Arrow}
                  alt="arrow"
                  className={`h-6 w-6 transition-transform duration-300 ${
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
                subCategories[category.id].map(subCategory => (
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
    </div>
  );
};

export default Accordion;