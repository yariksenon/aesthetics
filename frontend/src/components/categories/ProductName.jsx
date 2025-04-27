import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const translations = {
  new: "Новинки",
  shoes: "Обувь",
  clothes: "Одежда",
  training: "Тренировки",
  beauty: "Красота",
  discounts: "Скидки",
  hockey: "Хоккей",
  tennis: "Теннис",
  rugby: "Регби",
  basketball: "Баскетбол",
  running: "Бег",
  brand: "Бренд",
  skiing: "Лыжи",
  volleyball: "Волейбол",
  gym: "Зал",
  diving: "Дайвинг",
  football: "Футбол",
  winter: "Зима",
  summer: "Лето",
  spring: "Весна",
  autumn: "Осень",
};

const ProductName = () => {
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { category } = useParams();

  const declineProducts = (count) => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastDigit === 1 && lastTwoDigits !== 11) return 'товар';
    if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) return 'товара';
    return 'товаров';
  };

  useEffect(() => {
    const fetchProductCount = async () => {
      try {
        const endpointMap = {
          new: "new-arrivals",
          discounts: "discounted",
        };

        const endpoint = endpointMap[category] || "products";
        const response = await fetch(`http://localhost:8080/api/v1/${endpoint}`);
        const data = await response.json();
        setProductCount(data.length || 0);
      } catch (error) {
        console.error("Ошибка загрузки:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductCount();
  }, [category]);

  const translatedTitle = translations[category] || "Товары";

  if (loading) {
    return (
      <section className="mt-[3%] flex items-center space-x-[1%]">
        <p className="text-xl font-medium">{translatedTitle}</p>
        <p className="text-sm text-gray-400 mt-2">Загрузка...</p>
      </section>
    );
  }

  return (
    <section className="mt-[3%] flex items-center space-x-[1%]">
      <p className="text-xl font-medium">{translatedTitle}</p>
      {productCount > 0 && (
        <p className="text-sm text-gray-400 mt-2">
          {productCount} {declineProducts(productCount)}
        </p>
      )}
    </section>
  );
};

export default ProductName;