import footerLogo from '../../assets/home/Footer-logo.svg';

function Footer(){
    return(
        <>
          <footer class="color-balck mt-[5%] pt-[2%] bg-black">
            <div className='relative flex justify-center'>
              <img src={footerLogo} alt="Logo" className='cursor-pointer' />
              <a href="" className='text-white absolute font-bebas-neue left-[15%] bottom-0'>©2024 Aesthetic’s</a>
            </div>
            
          </footer>
        </>
    )
}

export default Footer;