import BannerFirst from "./BannerFirst";
import ProductCarts from './ProductCards';
import BannerThird from "./BannerThird";
import SportActivities from './SportsActivities';
import BannerFifth from "./BannerFifth";
import BannerSeasons from "./BannerSeasons";
import Email from './Email';

function Main(){
    return (
        <>
            <main className="mx-[15%] mt-[2%]">
                <BannerFirst/>
                <ProductCarts />
                <BannerThird />
                <SportActivities />
                <BannerFifth />
                <BannerSeasons />
                <Email />
            </main>
        </>
    )
}

export default Main;