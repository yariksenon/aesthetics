const Loading = () => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
        <div className="flex flex-col items-center">
          {/* Спиннер */}
          <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
          {/* Текст */}
          <p className="mt-4 text-lg text-gray-700">Загрузка...</p>
        </div>
      </div>
    );
  };
  
  export default Loading;