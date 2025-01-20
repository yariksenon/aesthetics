import brandBanner from '../../assets/home/bannerFirst-BrandsSales.svg';
import BannerFifthGym from '../../assets/home/BannerFifth-gym.svg';
import BannerFifthDayving from '../../assets/home/BannerFifth-dayving.svg';
import leftArrow from '../../assets/home/bannerFirst-leftArrow.svg';
import rightArrow from '../../assets/home/bannerFirst-rightArrow.svg';
import slash from '../../assets/home/bannerFirst-slash.svg';
import line from '../../assets/home/BannerFifth-line.svg';

function BannerFifth() {
  return (
    <>
      <div className="grid grid-cols-3 gap-4 mt-[5%]">
        <div className="grid grid-rows-2 gap-4 col-span-1">
          
          
          
          <div className='relative group'>
            <img src={BannerFifthGym} alt="Hockey banner" className="group-hover:opacity-75 w-full h-full object-cover cursor-pointer" />
            <a className='group-hover:hidden text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>Положить под ёлку</a>
            
            <div className='flex items-center'>
                <img 
                    src={line} 
                    alt="Hover Image" 
                    className="
                        hidden group-hover:block w-[70%] mt-[4px]"
                />
                <p className='ml-[5%] hidden text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-600 group-hover:block mt-[2px]'>Купить</p>
            </div>
          </div>




            <div className="mt-[3%] relative group">
                <img src={BannerFifthDayving} alt="Tenis banner" className="group-hover:opacity-75 w-full h-full object-cover cursor-pointer" />
                <a className='group-hover:hidden text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>Положить под ёлку</a>
                <div className='flex items-center'>
                    <img 
                        src={line} 
                        alt="Hover Image" 
                        className="
                            hidden group-hover:block w-[70%] mt-[5px]"
                    />
                    <p className='ml-[5%] hidden text-gray-600 text-[10px] sm:text-xs md:text-sm lg:text-base group-hover:block mt-[2px]'>Купить</p>
                </div>
            </div>
        </div>

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
      </div>
    </>
  );
}

export default BannerFifth;
