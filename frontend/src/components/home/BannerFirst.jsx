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
            <div className="col-span-2">
              <img src={brandBanner} alt="Brands banner" className="w-full h-full object-cover cursor-pointer" />
                
                <div className='flex items-center justify-between'>
                  <a className='text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>Положить под ёлку</a>  
                  <div className='flex items-center space-x-2'>
                    <img src={leftArrow} alt="" className='w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 cursor-pointer' />
                    <div className='flex items-center space-x-1'>
                      <p className='text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>1</p>
                        <img src={slash} alt="" className='w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6' />
                      <p className='text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>4</p>
                    </div>
                    <img src={rightArrow} alt="" className='w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 cursor-pointer' />
                  </div>
                </div>

                
            </div>
          
            <div className="grid grid-rows-2 gap-4">
              <div>
                <img src={hockeyBanner} alt="Hockey banner" className="w-full h-full object-cover cursor-pointer" />
                <a className='text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>Положить под ёлку</a>
              </div>
              <div className="mt-[3%]">
                <img src={tenisBanner} alt="Tenis banner" className="w-full h-full object-cover cursor-pointer" />
                <a className='text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>Положить под ёлку</a>
              </div>
            </div>
        </div>
      </>
    )
}

export default BannerFirst