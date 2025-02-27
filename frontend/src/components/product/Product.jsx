import { useParams } from 'react-router-dom';

function Product() {
  const { gender, category, subcategory, productid } = useParams(); // Получаем ID товара из URL

  return (
    <div>
      <h2>Гендер: {gender}</h2>
      <h2>Категория: {category}</h2>
      <h2>Подкатегория: {subcategory}</h2>
      <h2>Товар: {productid}</h2>
      {/* Здесь можно отображать детали товара */}
    </div>
  );
}

export default Product;