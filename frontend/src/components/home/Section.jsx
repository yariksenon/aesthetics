import './header.css'
import sectionGlass from "../../assets/home/section-glass.svg"

function Section(){
    return(
        <>
            <section className="ml-60 mr-60 flex justify-between items-center space-x-4">
                <ul className="flex space-x-4 py-2"> 
                    <li className="custom-underline cursor-pointer">Новинки</li> 
                    <li className="custom-underline cursor-pointer">Обувь</li> 
                    <li className="custom-underline cursor-pointer">Одежда</li> 
                    <li className="custom-underline cursor-pointer">Аксессуары</li> 
                    <li className="custom-underline cursor-pointer">Красота</li> 
                    <li className="text-red-500 custom-underline cursor-pointer">Скидки</li> 
                </ul>
                <div className="flex items-center border-2 border-black overflow-hidden">
                    <input type="text" className="py-2 px-4  text-base w-full focus:outline-none" placeholder="Поиск" />
                    <button className="bg-black">
                        <div>
                            <img src={sectionGlass} alt="glass" className="h-6 w-8 m-2"/>
                        </div>
                    </button>
                </div>
            </section>
        </>
    )
}

export default Section