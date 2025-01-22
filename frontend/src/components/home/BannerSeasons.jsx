import React from "react";
import BannerSeasonsWinter from "../../assets/home/BannerSeasons-winter.svg";
import BannerSeasonsSummer from "../../assets/home/BannerSeasons-summer.svg";
import BannerSeasonsSpring from "../../assets/home/BannerSeasons-spring.svg";
import BannerSeasonsAutumn from "../../assets/home/BannerSeasons-autumn.svg";
import "./custom.css";

function BannerSixth() {
  // Массив данных для каждого сезона
  const seasons = [
    {
      image: BannerSeasonsWinter,
      alt: "WINTER",
      text: "WINTER",
      hoverColor: "#9CA3AF", // gray-400
    },
    {
      image: BannerSeasonsSummer,
      alt: "SUMMER",
      text: "SUMMER",
      hoverColor: "#4ADE80", // green-400
    },
    {
      image: BannerSeasonsSpring,
      alt: "SPRING",
      text: "SPRING",
      hoverColor: "#F472B6", // pink-400
    },
    {
      image: BannerSeasonsAutumn,
      alt: "AUTUMN",
      text: "AUTUMN",
      hoverColor: "#FB923C", // orange-400
    },
  ];

  return (
    <div className="flex mt-[10%] gap-x-2 justify-between">
      {seasons.map((season, index) => (
        <div
          key={index}
          className="relative h-auto transform transition duration-500 hover:scale-105"
        >
          {/* Изображение */}
          <img src={season.image} alt={season.alt} />

          {/* Текст с градиентом */}
          <span
            className="font-bebas-neue absolute inset-0 flex items-center justify-center text-xl lg:text-5xl animate-fade-in transition duration-500"
            style={{
              background: "linear-gradient(to bottom, white 80%, black 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
            onMouseEnter={(e) => {
              e.target.style.color = season.hoverColor; // Меняем цвет текста при наведении
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "transparent"; // Возвращаем градиент при уходе курсора
            }}
          >
            {season.text}
          </span>
        </div>
      ))}
    </div>
  );
}

export default BannerSixth;