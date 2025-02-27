import React, { useCallback, useMemo } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import BannerSeasonsWinter from "../../assets/home/Seasons/Winter.svg";
import BannerSeasonsSummer from "../../assets/home/Seasons/Summer.svg";
import BannerSeasonsSpring from "../../assets/home/Seasons/Spring.svg";
import BannerSeasonsAutumn from "../../assets/home/Seasons/Autumn.svg";
import "./custom.css";

const seasonsData = [
  {
    image: BannerSeasonsWinter,
    alt: "Winter",
    text: "WINTER",
    hoverColor: "#9CA3AF",
    category: "winter",
  },
  {
    image: BannerSeasonsSummer,
    alt: "Summer",
    text: "SUMMER",
    hoverColor: "#4ADE80",
    category: "summer",
  },
  {
    image: BannerSeasonsSpring,
    alt: "Spring",
    text: "SPRING",
    hoverColor: "#F472B6",
    category: "spring",
  },
  {
    image: BannerSeasonsAutumn,
    alt: "Autumn",
    text: "AUTUMN",
    hoverColor: "#FB923C",
    category: "autumn",
  },
];

function BannerSixth() {
  const navigate = useNavigate();
  const { gender } = useParams();

  const handleClick = useCallback((category) => {
    navigate(`/${gender}/${category}`);
  }, [navigate, gender]);

  const seasons = useMemo(() => seasonsData, []);

  const handleMouseEnter = useCallback((e, hoverColor) => {
    e.target.style.color = hoverColor;
  }, []);

  const handleMouseLeave = useCallback((e) => {
    e.target.style.color = "transparent";
  }, []);

  return (
    <div className="flex mt-[10%] gap-x-2 justify-between">
      {seasons.map((season) => (
        <figure
          key={season.category}
          className="relative h-auto transform transition duration-500 hover:scale-105 cursor-pointer"
          onClick={() => handleClick(season.category)}
        >
          <img src={season.image} alt={season.alt} className="w-full" />

          <figcaption
            className="font-bebas-neue absolute inset-0 flex items-center justify-center text-xl lg:text-5xl animate-fade-in transition duration-500"
            style={{
              background: "linear-gradient(to bottom, white 80%, black 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
            onMouseEnter={(e) => handleMouseEnter(e, season.hoverColor)}
            onMouseLeave={handleMouseLeave}
          >
            {season.text}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export default BannerSixth;