import footerLogo from '../../assets/home/Footer-logo.svg';
import './custom.css'
function Footer(){
    return(
        <>
          <footer class="color-balck mt-[5%] bg-black font-bebas-neue text-white text-center">
            <div className='relative mx-[15%]'>
            <div className='flex flex-wrap '>
  {/* Блок Telegram */}
  <div className='w-full sm:w-1/2 md:w-[15%] border-b-2 sm:border-r-0 md:border-r-2 p-4 mb-4 sm:mb-0'>
    <p>Telegram</p>
    <p>t.me/Aesthetics_Market</p>
    <p>t.me/Aesthetics_Market/bot</p>
  </div>

  {/* Блок Instagram */}
  <div className='w-full sm:w-1/2 md:w-[15%] border-b-2 sm:border-r-0 md:border-r-2 p-4 mb-4 sm:mb-0'>
    <p>Instagram</p>
    <p>t.me/Aesthetics_Market</p>
  </div>

  {/* Блок Twitter */}
  <div className='w-full sm:w-1/2 md:w-[40%] border-b-2 sm:border-r-0 md:border-r-2 p-4 mb-4 sm:mb-0'>
    <p>Twitter</p>
    <p></p>
  </div>

  {/* Блок About */}
  <div className='w-full sm:w-1/2 md:w-[15%] border-b-2 sm:border-l-0 md:border-l-2 p-4 mb-4 sm:mb-0'>
    <a href="#" className='text-center block'>About</a>
  </div>

  <div className='w-full sm:w-1/2 md:w-[15%] border-b-2 sm:border-l-0 md:border-l-2 p-4 mb-4 sm:mb-0'>
    <a href="#" className='text-center block'>About</a>
  </div>
</div>

              
              <div className='flex justify-center '>
                <img src={footerLogo} alt="Logo" className='my-[2%] cursor-pointer w-[60%]' />
                  <a href="#" class="absolute left-0 bottom-0 hover:text-red-400 hover:-translate-y-1 transition-all duration-300 text-xs md:text-base lg:text-lg">
                    ©2024 Aesthetic’s
                  </a>  
              </div>
              
            </div>
            
          </footer>
        </>
    )
}

export default Footer;