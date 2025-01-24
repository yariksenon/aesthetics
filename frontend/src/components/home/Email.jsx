import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Email() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/api/subscribe", {
        email,
      });

      if (response.status === 200) {
        toast.success("Вы успешно подписались!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        console.error("Ошибка при отправке данных на сервер");
      }
    } catch (error) {
      console.error("Ошибка при отправке запроса:", error);
      toast.error("Ошибка при отправке запроса", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <div className="bg-black py-[3%] h-full px-4 mt-[2%]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4">
        <h2 className="text-white text-center sm:text-left text-sm sm:text-base md:text-lg lg:text-xl font-medium">
          Будьте в курсе наших последних предложений.
        </h2>

        <form
          onSubmit={handleSubmit}
          className="w-full md:max-w-fit flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-3"
        >
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full 
              md:w-48 
              lg:w-56 
              bg-transparent 
              border-b 
              border-white 
              text-white 
              placeholder-gray-400 
              outline-none 
              focus:border-red-500 
              transition 
              duration-300 
              ease-in-out 
              py-1 
              px-2 
              text-sm 
              sm:text-base 
              md:text-base 
              lg:text-base
            "
            placeholder="Введите ваш email"
          />

          <button
            type="submit"
            className="
              w-full 
              md:w-auto 
              bg-white 
              text-black 
              font-medium 
              py-1 
              px-4 
              rounded-md 
              hover:bg-gray-100 
              focus:outline-none 
              focus:ring-2 
              focus:ring-offset-2 
              focus:ring-white 
              transition 
              duration-300 
              ease-in-out 
              transform 
              hover:scale-105 
              text-sm 
              sm:text-base
            "
          >
            Подписаться
          </button>
        </form>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default Email;