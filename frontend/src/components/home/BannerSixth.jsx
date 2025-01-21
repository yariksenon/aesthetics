import BannerSixthWinter from "../../assets/home/BannerSixth-winter.svg";
import BannerSixthSummer from "../../assets/home/BannerSixth-summer.svg";
import BannerSixthSpring from "../../assets/home/BannerSixth-spring.svg";
import BannerSixthAutumn from "../../assets/home/BannerSixth-autumn.svg";
import './custom.css';

function BannerSixth() {
  // Массив данных для каждого сезона
  const seasons = [
    {
      image: BannerSixthWinter,
      alt: "WINTER",
      text: "WINTER",
      hoverFrom: "from-gray-400",
      hoverTo: "to-white",
    },
    {
      image: BannerSixthSummer,
      alt: "SUMMER",
      text: "SUMMER",
      hoverFrom: "from-green-400",
      hoverTo: "to-white",
    },
    {
      image: BannerSixthSpring,
      alt: "SPRING",
      text: "SPRING",
      hoverFrom: "from-pink-400",
      hoverTo: "to-white",
    },
    {
      image: BannerSixthAutumn,
      alt: "AUTUMN",
      text: "AUTUMN",
      hoverFrom: "from-orange-400",
      hoverTo: "to-white",
    },
  ];

  return (
    <div className="flex mt-[10%] gap-x-2 justify-between">
      {seasons.map((season, index) => (
        <div
          key={index}
          className="relative w-1/4 h-auto transform transition duration-500 hover:scale-105"
        >
          {/* Изображение */}
          <img src={season.image} alt={season.alt} />

          {/* Текст с градиентом */}
          <span
            className={`bg-gradient-to-b from-white from-40% to-black to-100% bg-clip-text text-transparent font-bebas-neue absolute inset-0 flex items-center justify-center text-xl lg:text-5xl animate-fade-in transition duration-500 hover:bg-gradient-to-t hover:${season.hoverFrom} hover:${season.hoverTo}`}
          >
            {season.text}
          </span>
        </div>
      ))}
    </div>
  );
}

export default BannerSixth;