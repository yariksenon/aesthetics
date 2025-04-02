import React from 'react';
import axios from 'axios';

const productData = {
  name: 'TestProduct',
  description: 'TestDescription',
  summary: 'TestSummary',
  sub_category_id: 1,
  color: 'Red',
  size: 'M',
  sku: '123A3BC',
  price: 99.99,
  quantity: 10,
  image_path: '/home/yariksen/Pictures/Santa_Maddalena_Italy_David_Becker_8K.jpg',
}

const sendProductData = async () => {
  try {
    event.preventDefault(); // Предотвращаем перезагрузку страницы
    const response = await axios.post('http://localhost:8080/api/v1/admin/products', productData);
    console.log('Успешно отправлено:', response.data);
  } catch (error) {
    console.error('Ошибка при отправке:', error.response ? error.response.data : error.message);
  }
};

const AdminProductAdd = () => {
  return (
    <div className="md:flex">
      <div className="md:w-1/2 bg-gray-50 p-6 flex items-center justify-center">
        <label className="w-full h-96 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-500">
          <span className="text-center mb-2 text-gray-500">
            Перетащите изображение сюда
          </span>
          <span className="text-sm text-gray-400">(до 5MB, JPEG/PNG/WebP)</span>
          <input 
            type="file" 
            className="hidden"
          />
          <button 
            type="button"
            className="mt-2 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            Выбрать файл
          </button>
        </label>
      </div>

      {/* Форма добавления товара */}
      <div className="md:w-1/2 p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Добавить товар</h2>
        
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Название*
              </label>
              <input
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Название товара"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                SKU*
              </label>
              <input
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Уникальный идентификатор"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Описание
            </label>
            <textarea
              rows="3"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Подробное описание товара"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Краткое описание
            </label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Краткое описание"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Цена*
              </label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Количество
              </label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Подкатегория*
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Выберите подкатегорию</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Цвет
              </label>
              <input
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Например: Красный"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Размер
              </label>
              <input
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Например: XL"
              />
            </div>
          </div>

          <button
            type="submit"
            onClick={sendProductData}
            className="w-full py-3 px-4 bg-gray-900 text-white rounded-md hover:bg-gray-800"
          >
            Добавить товар
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProductAdd;