// components/subCategory/SubCategory.jsx
import { useParams } from 'react-router-dom';

function SubCategory() {
  const { gender, category, subcategory } = useParams(); // Получаем подкатегорию из URL

  return (
    <div>
      <h2>Гендер: {gender}</h2>
      <h2>Категория: {category}</h2>
      <h2>Подкатегория: {subcategory}</h2>
    </div>
  );
}

export default SubCategory;