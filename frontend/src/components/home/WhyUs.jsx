import React from 'react';
import Logo from '../../assets/home/Footer-logo.svg';
import { Link } from 'react-router-dom';

function WhyUs() {
    return (
        <>
            <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
                {/* Декоративные элементы на заднем фоне */}
                <div className="absolute inset-0 z-0">
                    {/* Абстрактные круги */}
                    <div className="absolute w-64 h-64 bg-white opacity-10 rounded-full -top-32 -left-32 animate-spin-slow"></div>
                    <div className="absolute w-96 h-96 bg-white opacity-5 rounded-full -bottom-48 -right-48 animate-pulse"></div>
                    <div className="absolute w-80 h-80 bg-white opacity-10 rounded-full top-1/4 left-1/4 animate-bounce"></div>
                    <div className="absolute w-72 h-72 bg-white opacity-5 rounded-full top-1/2 right-1/4 animate-ping"></div>
                    {/* Линии */}
                    <div className="absolute w-1 h-64 bg-white opacity-10 top-1/4 left-1/2 transform -translate-x-1/2 animate-slide"></div>
                    <div className="absolute w-64 h-1 bg-white opacity-10 top-1/2 left-1/4 transform -translate-y-1/2 animate-slide-reverse"></div>
                    {/* Градиентный фон */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>
                    {/* Хаотичные элементы */}
                    <div className="absolute w-24 h-24 bg-purple-500 opacity-20 rounded-full top-1/3 left-1/4 animate-spin"></div>
                    <div className="absolute w-40 h-40 bg-orange-500 opacity-20 rounded-full bottom-1/4 right-1/3 animate-wiggle"></div>
                    <div className="absolute w-56 h-56 bg-pink-500 opacity-20 rounded-full top-1/2 left-1/2 animate-pulse"></div>
                    <div className="absolute w-32 h-32 bg-teal-500 opacity-20 rounded-full bottom-1/3 right-1/4 animate-bounce"></div>
                    {/* Случайные фигуры */}
                    <div className="absolute w-48 h-48 bg-red-500 opacity-20 transform rotate-45 top-1/4 right-1/4 animate-spin-slow"></div>
                    <div className="absolute w-36 h-36 bg-blue-500 opacity-20 transform skew-x-12 bottom-1/4 left-1/4 animate-wiggle"></div>
                </div>

                {/* Логотип */}
                <div className="mb-12 z-10">
                    <Link to="/">
                        <img
                            src={Logo}
                            alt="Logo"
                            className="filter hover:opacity-80 transition-opacity duration-300 transform rotate-45 hover:rotate-0 animate-pulse"
                        />
                    </Link>
                </div>

                {/* Контент */}
                <div className="max-w-4xl mx-auto text-center z-10">
                    <h1 className="text-6xl font-bold mb-8 font-comic underline decoration-wavy decoration-red-500 animate-bounce">
                        Почему Мы? 🤔
                    </h1>
                    <p className="text-2xl mb-8 font-serif italic text-yellow-300 underline decoration-dotted animate-pulse">
                        Мы — команда профессионалов, посвятивших себя предоставлению высококачественных спортивных товаров и экипировки. Наша миссия — помочь вам достичь ваших спортивных целей с лучшими продуктами на рынке.
                    </p>
                    <p className="text-2xl mb-8 font-mono text-green-400 underline decoration-double animate-wiggle">
                        Наш опыт и страсть к спорту позволяют нам предлагать уникальные решения, которые помогают нашим клиентам преуспеть в их спортивных начинаниях.
                    </p>
                    <p className="text-2xl mb-12 font-cursive text-blue-300 underline decoration-solid animate-bounce">
                        Свяжитесь с нами, чтобы узнать больше о том, как мы можем помочь вам улучшить ваш спортивный опыт.
                    </p>

                    {/* Дополнительные объекты */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-300 transform hover:scale-110" style={{ clipPath: "polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)" }}>
                            <h2 className="text-3xl font-semibold mb-4 font-fantasy text-purple-400 underline decoration-wavy animate-spin-slow">
                                Гарантия Качества
                            </h2>
                            <p className="text-pink-200 animate-pulse">Мы тщательно отбираем наши спортивные товары, чтобы обеспечить высочайшее качество и производительность.</p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-300 transform hover:rotate-6" style={{ clipPath: "polygon(10% 0%, 90% 0%, 100% 90%, 0% 100%)" }}>
                            <h2 className="text-3xl font-semibold mb-4 font-sans text-orange-400 underline decoration-dotted animate-wiggle">
                                Широкий Ассортимент
                            </h2>
                            <p className="text-teal-200 animate-bounce">Наш магазин предлагает разнообразный выбор спортивных товаров, от экипировки до оборудования, чтобы удовлетворить все ваши потребности.</p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-300 transform hover:skew-y-12" style={{ clipPath: "polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)" }}>
                            <h2 className="text-3xl font-semibold mb-4 font-serif text-red-400 underline decoration-dashed animate-spin">
                                Поддержка Клиентов
                            </h2>
                            <p className="text-indigo-200 animate-pulse">Наша команда всегда готова помочь вам с любыми вопросами и обеспечить лучший опыт покупок.</p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-300 transform hover:translate-x-6" style={{ clipPath: "polygon(0% 10%, 100% 0%, 90% 90%, 0% 100%)" }}>
                            <h2 className="text-3xl font-semibold mb-4 font-mono text-yellow-400 underline decoration-solid animate-bounce">
                                Быстрая Доставка
                            </h2>
                            <p className="text-cyan-200 animate-wiggle">Мы предоставляем быструю и надёжную доставку, чтобы вы могли наслаждаться своими новыми спортивными товарами как можно скорее.</p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-300 transform hover:-translate-y-6" style={{ clipPath: "polygon(0% 0%, 90% 10%, 100% 100%, 10% 90%)" }}>
                            <h2 className="text-3xl font-semibold mb-4 font-cursive text-green-400 underline decoration-double animate-spin-slow">
                                Экологичные Товары
                            </h2>
                            <p className="text-amber-200 animate-pulse">Мы стремимся предлагать экологически чистые товары и поддерживать устойчивые практики.</p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-300 transform hover:scale-125" style={{ clipPath: "polygon(10% 0%, 100% 10%, 90% 100%, 0% 90%)" }}>
                            <h2 className="text-3xl font-semibold mb-4 font-fantasy text-blue-400 underline decoration-wavy animate-wiggle">
                                Оптимальные Цены
                            </h2>
                            <p className="text-lime-200 animate-bounce">Мы предлагаем высококачественные спортивные товары по конкурентоспособным ценам, чтобы дать вам лучшее соотношение цены и качества.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default WhyUs;