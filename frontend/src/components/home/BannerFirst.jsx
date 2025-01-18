import brandBanner from '../../assets/home/bannerFirst-BrandsSales.svg'
import hockeyBanner from '../../assets/home/bannerFirst-hockeyBanner.svg'
import tenisBanner from '../../assets/home/bannerFirst-tennisBanner.svg'
import leftArrow from '../../assets/home/bannerFirst-leftArrow.svg'
import rightArrow from '../../assets/home/bannerFirst-rightArrow.svg'
import slash from '../../assets/home/bannerFirst-slash.svg'

function BannerFirst(){
    return (
        <>
          <div className="grid grid-cols-3 gap-4">
  <div className="col-span-2 bg-gray-300">
    <img src={brandBanner} alt="Brands banner" className="w-full h-full object-cover" />
      <div>
      <h2>Положить под ёлку </h2>  
      </div>
      
  </div>
  
  <div className="grid grid-rows-2 gap-4">
    <div className="bg-blue-300">
      <img src={hockeyBanner} alt="Hockey banner" className="w-full h-full object-cover" />
      <h2>Положить под ёлку</h2>
    </div>
    <div className="bg-green-300 mt-[3%]">
      <img src={tenisBanner} alt="Tenis banner" className="w-full h-full object-cover" />
      <h2>Положить под ёлку</h2>
    </div>
  </div>
</div>

        </>
    )
}

export default BannerFirst