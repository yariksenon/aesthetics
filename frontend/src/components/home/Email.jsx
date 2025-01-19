function Email(){
    return(
        <>
            <div className="flex bg-black p-4 items-center space-x-0 lg:space-x-4 justify-between mt-[3%]">
                <h2 className="text-white text-xs sm:text-lg md:text-xl lg:text-2xl xl:text-2xl">
                    Будьте в курсе наших последних предложений.
                </h2>

                <form className="flex items-center space-x-4 w-full justify-between">
                <label htmlFor="email" className="sr-only">Email</label>
                <input 
                    type="email"
                    id="email"
                    name="email"
                    required 
                    className="bg-transparent border-b border-white text-white outline-none placeholder-gray-400 w-full sm:w-1/2 lg:w-1/2 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl transition duration-300 ease-in-out focus:border-red-500 hover:border-gray-500"

                    placeholder="Email" 
                />
                <button 
                    type="submit"
                    className="bg-transparent border text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl border-gray-400 text-white px-1 py-1 hover:bg-white hover:text-black w-full sm:w-auto sm:px-4 lg:px-6 transition duration-300 ease-in-out transform hover:scale-105">
                    Подписаться
                </button>

                </form>
            </div>
        </>
    )
}
export default Email;