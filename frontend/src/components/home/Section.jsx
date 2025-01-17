import './custom.css'
import sectionGlass from "../../assets/home/section-glass.svg"

function Section(){
    return(
        <>
            <nav className="mx-[15%] mt-[2%] flex flex-col lg:flex-row justify-between items-start lg:items-center ">
                <ul className="flex space-x-0 lg:space-x-4 justify-between lg:justify-normal w-full"> 
                    <li className="text-[10px] sm:text-xs md:text-sm lg:text-base custom-underline cursor-pointer">Новинки</li> 
                    <li className="text-[10px] sm:text-xs md:text-sm lg:text-base custom-underline cursor-pointer">Обувь</li> 
                    <li className="text-[10px] sm:text-xs md:text-sm lg:text-base custom-underline cursor-pointer">Одежда</li> 
                    <li className="text-[10px] sm:text-xs md:text-sm lg:text-base custom-underline cursor-pointer">Аксессуары</li> 
                    <li className="text-[10px] sm:text-xs md:text-sm lg:text-base custom-underline cursor-pointer">Красота</li> 
                    <li className="text-[10px] sm:text-xs md:text-sm lg:text-base text-red-500 custom-underline cursor-pointer">Скидки</li> 
                </ul>
                
                <div className="flex w-full mt-[2%] lg:mt-[0%] lg:w-[35%]">
                    <input 
                        type="text" 
                        className="overflow-hidden p-1 lg:p-2 border-2 border-black flex-grow  focus:outline-none text-[10px] sm:text-xs md:text-sm lg:text-base" 
                        placeholder="Поиск" />
                
                    <button className="bg-black rounded-tr-lg rounded-br-lg flex items-center justify-center w-[60px]">
                        <img 
                            src={sectionGlass} 
                            alt="glass" 
                            className="h-7 w-7" />
                    </button>
                </div>
            </nav>
        </>
    )
}

export default Section