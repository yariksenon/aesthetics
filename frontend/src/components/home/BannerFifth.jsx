import brandBanner from '../../assets/home/bannerFirst-BrandsSales.svg';
import BannerFifthGym from '../../assets/home/BannerFifth-gym.svg';
import BannerFifthDayving from '../../assets/home/BannerFifth-dayving.svg';
import leftArrow from '../../assets/home/bannerFirst-leftArrow.svg';
import rightArrow from '../../assets/home/bannerFirst-rightArrow.svg';
import slash from '../../assets/home/bannerFirst-slash.svg';
import longLine from '../../assets/home/BannerFifth-longLine.svg';
import shortLine from '../../assets/home/BannerFifth-shortLine.svg';

function BannerFifth() {
  const buttonText = "Положить под ёлку";

  return (
    <div className="grid grid-cols-3 gap-4 mt-[5%]">
      <div className="grid grid-rows-2 gap-10 lg:gap-12 col-span-1 h-[25vh] md:h-[40vh] lg:h-[50vh] xl:h-full">
        {[BannerFifthGym, BannerFifthDayving].map((banner, index) => (
          <div key={index} className="group">
            <img 
              src={banner} 
              alt={`Banner ${index + 1}`} 
              className="group-hover:opacity-75 w-full h-full object-cover cursor-pointer" 
            />
            <div>
              <a className='block text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>{buttonText}</a>
              <a href="#" className='block group-hover:hidden text-gray-600 text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>{buttonText}</a>
            </div>
            <div className='flex items-center transform -translate-x-5 group-hover:translate-x-0 transition-transform duration-300 ease-in-out'>
              <img 
                src={shortLine} 
                alt="Short Line Decoration" 
                className="hidden group-hover:block w-[20%]" 
              />
              <p className='ml-[2%] hidden text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-600 group-hover:block'>
                Купить
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="col-span-2 relative h-[25vh] md:h-[40vh] lg:h-[50vh] xl:h-full group p-0 m-0 w-full">
        <img 
          src={brandBanner} 
          alt="Brands Banner" 
          className="w-full hover:opacity-75 h-full object-cover cursor-pointer" 
        />
        
        <div className='flex items-center justify-between'>
          <div>
            <a className='block text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>
              {buttonText}
            </a>
            <a href="#" className='absolute group-hover:hidden text-gray-600 text-[10px] sm:text-xs md:text-sm lg:text-base cursor-pointer'>
              {buttonText}
            </a>
          </div>

          <div className='absolute right-0 mt-[5%] flex items-center space-x-2'>
            <a href="#" className='cursor-pointer'>
              <img 
                src={leftArrow} 
                alt="Previous Slide" 
                className='w-4 h-full sm:w-6 md:w-8 lg:w-10 cursor-pointer' 
              />
            </a>
            
            <div className='flex items-center space-x-1'>
              <p className='text-[10px] sm:text-xs md:text-sm lg:text-base'>1</p>
              <img 
                src={slash} 
                alt="Separator" 
                className='w-3 h-full sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6' 
              />
              <p className='text-[10px] sm:text-xs md:text-sm lg:text-base'>4</p>
            </div>
           
            <a href="#" className='cursor-pointer'>
              <img 
                src={rightArrow} 
                alt="Next Slide" 
                className='w-4 h-full sm:w-6 md:w-8 lg:w-10 cursor-pointer' 
              />
            </a>
          </div>
        </div>

        <div className='flex items-center transform -translate-x-5 group-hover:translate-x-0 transition-transform duration-300 ease-in-out'>
          <img 
            src={longLine} 
            alt="Long Line Decoration" 
            className="hidden group-hover:block w-[20%]" 
          />
          <p className='ml-[2%] hidden text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-600 group-hover:block'>
            Купить
          </p>
        </div>
      </div>
    </div>
  

        
  );
}

export default BannerFifth;