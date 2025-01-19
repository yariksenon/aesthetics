import BannerSixthWinter from "../../assets/home/BannerSixth-winter.svg";
import BannerSixthSummer from "../../assets/home/BannerSixth-summer.svg";
import BannerSixthSpring from "../../assets/home/BannerSixth-spring.svg";
import BannerSixthAutumn from "../../assets/home/BannerSixth-autumn.svg";
import './custom.css';

function BannerSixth() {
    return (
        <>
            <div className="flex mt-[3%] gap-x-2 justify-between">
                <div className="relative w-1/4 h-auto transform transition duration-500 hover:scale-105">
                    <img src={BannerSixthWinter} alt="WINTER" />
                    <span className="bg-gradient-to-b from-white from-40% to-black to-100% bg-clip-text text-transparent font-bebas-neue absolute inset-0 flex items-center justify-center text-xl lg:text-5xl animate-fade-in transition duration-500 hover:bg-gradient-to-t hover:from-gray-400 hover:to-white">WINTER</span>
                </div>
                <div className="relative w-1/4 h-auto transform transition duration-500 hover:scale-105">
                    <img src={BannerSixthSummer} alt="SUMMER" />
                    <span className="bg-gradient-to-b from-white from-40% to-black to-100% bg-clip-text text-transparent font-bebas-neue absolute inset-0 flex items-center justify-center text-xl lg:text-5xl animate-fade-in transition duration-500 hover:bg-gradient-to-t hover:from-green-400 hover:to-white">SUMMER</span> </div>
                <div className="relative w-1/4 h-auto transform transition duration-500 hover:scale-105">
                    <img src={BannerSixthSpring} alt="SPRING" />
                    <span className="bg-gradient-to-b from-white from-40% to-black to-100% bg-clip-text text-transparent font-bebas-neue absolute inset-0 flex items-center justify-center text-xl lg:text-5xl animate-fade-in transition duration-500 hover:bg-gradient-to-t hover:from-pink-400 hover:to-white">SPRING</span> </div>
                <div className="relative w-1/4 h-auto transform transition duration-500 hover:scale-105">
                    <img src={BannerSixthAutumn} alt="AUTUMN" />
                    <span className="bg-gradient-to-b from-white from-40% to-black to-100% bg-clip-text text-transparent font-bebas-neue absolute inset-0 flex items-center justify-center text-xl lg:text-5xl animate-fade-in transition duration-500 hover:bg-gradient-to-t hover:from-orange-400 hover:to-white">AUTUMN</span> </div>
            </div>
        </>
    );
}

export default BannerSixth;
