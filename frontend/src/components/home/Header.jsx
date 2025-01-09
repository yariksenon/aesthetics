import './header.css';
import headerLogo from "../../assets/home/header-logo.svg"
import headerBasket from "../../assets/home/header-basket.svg"

function Header() {
    const accept = "Войти"
    return(
        <>
            <header className='ml-60 mr-60 mt-5 flex justify-between items-center'>
                <div className='flex space-x-12'>
                    <a href="" className="text-base custom-underline">Женщинам</a>
                    <a href="" className="text-base custom-underline">Мужчинам</a>
                    <a href="" className="text-base custom-underline">Детям</a>
                </div>
                <div className='flex justify-center'>
                    <img src={headerLogo} alt="Logo" className="cursor-pointer h-10 w-auto" />
                </div>
                <div className="flex space-x-20 items-center">
                <button className="text-base text-black bg-white py-2 px-6 border-2 border-black rounded-lg transition duration-300 ease-in-out transform hover:bg-black hover:text-white hover:border-white hover:shadow-lg">
                    {accept}
                </button>
                    
                    <div className="flex items-center space-x-6">
                        <img src={headerBasket} className="h-10 w-10 cursor-pointer" alt="Basket" />
                        <a href="#" className="text-base text-black custom-underline">Корзина</a>
                    </div>
                </div>
            </header>
        </>
    )
}   

export default Header;