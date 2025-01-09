import navClose from '../../assets/main/nav-close.svg'

function Nav() {
    const salary = 20;
    return (
            <div className="bg-black text-white p-3 flex justify-center items-center">
                <p className="">Зарегистрируйтесь и получите {salary}% скидку на первый заказ. <a href="#" className="underline">Зарегистрироваться сейчас.</a></p>
                <img className="w-4 h-4 ml-10 object-cover cursor-pointer" src={navClose} alt="Close" />
            </div>
    );
}

export default Nav;
