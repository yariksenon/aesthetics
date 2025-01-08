import navClose from '../assets/nav-close.svg'

function Nav() {
    return (
            <div className="bg-black text-white p-3 flex justify-center items-center">
                <p className="">Зарегистрируйтесь и получите 20% скидку на первый заказ. <a href="#" className="underline">Зарегистрироваться сейчас.</a></p>
                <img className="w-4 h-4 ml-10 object-cover" src={navClose} alt="Close" />
            </div>
    );
}

export default Nav;
