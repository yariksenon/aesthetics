import navClose from '../../assets/home/nav-close.svg';

function Nav() {
    const salary = 20;
    return (
        
        <nav className="bg-black text-white p-3 flex justify-center items-center">
            <p className="text-center text-xs md:text-sm lg:text-lg xl:text-5xs mr-0 md:mr-4 lg:mr-6 xl:mr-10">
                Зарегистрируйтесь и получите {salary}% скидку на первый заказ. <a href="#" className="underline">Зарегистрироваться сейчас.</a>
            </p>
            <img className="w-4 h-4 object-cover cursor-pointer ml-2 md:ml-4 lg:ml-6 xl:ml-10" src={navClose} alt="Close" />
        </nav>
    );
}

export default Nav;
