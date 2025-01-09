import headerLogo from "../../assets/main/header-logo.svg"
import headerBasket from "../../assets/main/header-basket.svg"

function Header() {
    return(
        <>
            <div className='header flex justify-center'>
                <div className='container-left'>
                    <a href="">Женщинам</a>
                    <a href="">Мужчинам</a>
                    <a href="">Детям</a>
                </div>
                <div className='container-logo'>
                    <img src={headerLogo} alt="" className="cursor-pointer" />
                </div>
                <div className='container-right'>
                    <img src={headerBasket} className="h-5 w-5 cursor-pointer" alt="" />
                </div>
            </div>
        </>
    )
}   

export default Header;