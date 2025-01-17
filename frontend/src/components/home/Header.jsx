import './custom.css';
import headerLogo from "../../assets/home/header-logo.svg"
import headerBasket from "../../assets/home/header-basket.svg"

function Header() {
    const accept = "Войти"
    return(
        <>
            <header className="mx-[15%] mt-[1%] flex justify-between items-center">
                <div className='flex space-x-2 sm:space-x-3 md:space-x-6 lg:space-x-8 text-[10px] sm:text-xs md:text-sm lg:text-base'>
                    <a href="" className="custom-underline">Женщинам</a>
                    <a href="" className="custom-underline">Мужчинам</a>
                    <a href="" className="custom-underline">Детям</a>
                </div>

                <div className='flex justify-center'>
                    <img src={headerLogo} alt="Logo" className="cursor-pointer h-6 md:h-10 w-auto" />
                </div>

                <div className="flex space-x-2 sm:space-x-3 md:space-x-5 lg:space-x-10 items-center">
                    <button className="text-[10px] sm:text-xs md:text-sm lg:text-base text-black bg-white py-0.5 sm:py-1.5 md:py-2 px-2 sm:px-4 md:px-6 border-[1px] md:border-2 border-black rounded-lg transition duration-300 ease-in-out transform hover:bg-black hover:text-white hover:border-white hover:shadow-lg">
                        {accept}
                    </button>
                    <div className="flex items-center transition-transform duration-300 ease-in-out hover:scale-110">
                        <img 
                            src={headerBasket} 
                            className="h-6 sm:h-8 md:h-10 w-6 sm:w-8 md:w-10 cursor-pointer" 
                            alt="Basket" 
                        />
                        <a href="#" className="text-[10px] sm:text-xs md:text-sm lg:text-base text-black custom-underline">Корзина</a>
                    </div>
                </div>
            </header>
        </>
    )
}

export default Header;
