import BannerFirst from "./BannerFirst";
import ProductCarts from './ProductCarts';
import BannerThird from "./BannerThird";
import SportActivities from './SportsActivities';
import BannerFifth from "./BannerFifth";
import BannerSixth from "./BannerSixth";
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
                <BannerSixth />
                <Email />
            </main>
        </>
    )
}

export default Main;