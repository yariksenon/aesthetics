import BannerThree from "../../assets/home/bannerThree-banner.svg"

function BannerThird(){
    return (
        <>
            <div className="mt-[2%]">
                <a href="#">
                    <img src={BannerThree} alt="Banner-3" className="duration-500  hover:opacity-75"/>    
                </a>
            </div>
        </>
    )
}

export default BannerThird