import React from "react";
import { Link, useParams } from "react-router-dom";
import slash from "../../assets/category/aside/Slash.svg";

const translations = {
  new: "новинки",
  shoes: "обувь",
  clothes: "одежда",
  training: "тренировки",
  beauty: "красота",
  discounts: "скидки",
  hockey: "хоккей",
  tennis: "теннис",
  rugby: "регби",
  basketball: "баскетбол",
  running: "бег",
  brand: "бренд",
  skiing: "лыжи",
  volleyball: "волейбол",
  gym: "зал",
  diving: "дайвинг",
  football: "футбол",
  winter: "зима",
  summer: "лето",
  spring: "весна",
  autumn: "осень",
};

const Breadcrumbs = () => {
  const { gender, category } = useParams();
  const translatedCategory = translations[category] || category;

  return (
    <section aria-label="Хлебные крошки">
      <div className="flex text-gray-400 items-center text-sm md:text-base">
        <Link to="/" className="hover:text-stone-900">
          Главная
        </Link>
        <img src={slash} alt="Slash" className="mx-1 h-4 md:h-5" />
        <Link to={`/${gender}/${category}`} className="hover:text-stone-900">
          {translatedCategory}
        </Link>
      </div>
    </section>
  );
};

export default Breadcrumbs;