import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminProductAdd = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    summary: '',
    sub_category_id: '',
    color: '',
    size: '',
    sku: '',
    price: '0',
    quantity: '0',
    image_path: ''
  });

  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Загрузка подкатегорий
  useEffect(() => {
    const loadSubCategories = async () => {
      try {
        const { data } = await axios.get('http://localhost:8080/api/v1/admin/subcategory/');
        setSubCategories(data.category || data);
      } catch (err) {
        setError('Ошибка загрузки подкатегорий');
        console.error(err);
      }
    };
    loadSubCategories();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setError('Пожалуйста, загрузите изображение (JPEG, PNG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Размер изображения не должен превышать 5MB');
      return;
    }

    setImageFile(file);
    setError('');
    
    // Создаем превью изображения
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Проверка обязательных полей
      if (!formData.name || !formData.sku || !formData.price || !formData.sub_category_id) {
        throw new Error('Заполните все обязательные поля');
      }

      // Находим выбранную подкатегорию
      const selectedCategory = subCategories.find(
        cat => cat.id === Number(formData.sub_category_id)
      );

      if (!selectedCategory) {
        throw new Error('Подкатегория не найдена');
      }

      // Формируем путь к изображению
      let imagePath = '';
      if (imageFile) {
        const fileExtension = imageFile.name.split('.').pop();
        imagePath = `${selectedCategory.name.toLowerCase()}/${formData.name.replace(/\s+/g, '_').toLowerCase()}.${fileExtension}`;
      }

      // Подготовка данных для отправки
      const productData = {
        name: formData.name,
        description: formData.description,
        summary: formData.summary,
        sub_category_id: Number(formData.sub_category_id),
        color: formData.color,
        size: formData.size,
        sku: formData.sku,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        image_path: imagePath
      };

      console.log('Отправляемые данные:', productData);

      // Отправляем данные в JSON формате
      const response = await axios.post(
        'http://localhost:8080/api/v1/admin/products', 
        productData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess('Товар успешно добавлен!');
      
      // Сброс формы
      setFormData({
        name: '',
        description: '',
        summary: '',
        sub_category_id: '',
        color: '',
        size: '',
        sku: '',
        price: '0',
        quantity: '0',
        image_path: ''
      });
      setImageFile(null);
      setImagePreview('');
      
    } catch (err) {
      console.error('Ошибка:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || 
                         err.message || 
                         'Ошибка при добавлении товара';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-white min-h-screen">
      {/* Блок загрузки изображения */}
      <div className="md:w-1/3 p-8 bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md">
          <label className="w-full h-96 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-500 transition-colors overflow-hidden">
            {imagePreview ? (
              <div className="relative w-full h-full">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-full object-contain rounded-lg"
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <button 
                    type="button"
                    className="px-4 py-2 bg-black bg-opacity-70 text-white rounded-lg hover:bg-opacity-90 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('image-upload').click();
                    }}
                  >
                    Заменить изображение
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-4">
                <svg className="w-12 h-12 mb-4 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p className="mb-2 text-gray-600">Перетащите изображение сюда</p>
                <p className="text-sm text-gray-400 mb-4">(JPEG, PNG, WEBP до 5MB)</p>
                <button 
                  type="button" 
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById('image-upload').click();
                  }}
                >
                  Выбрать файл
                </button>
              </div>
            )}
            <input 
              id="image-upload"
              type="file" 
              className="hidden" 
              onChange={handleImageChange} 
              accept="image/jpeg,image/png,image/webp"
            />
          </label>
        </div>
      </div>

      {/* Форма добавления товара */}
      <div className="md:w-2/3 p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Добавить товар</h2>
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Название*
                {formData.name.length > 255 && (
                  <span className="text-red-500 text-xs ml-1">
                    (Максимум 255 символов)
                  </span>
                )}
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                maxLength={255}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                SKU*
                {formData.sku.length > 100 && (
                  <span className="text-red-500 text-xs ml-1">
                    (Максимум 100 символов)
                  </span>
                )}
              </label>
              <input
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                maxLength={100}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              rows="4"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Краткое описание
              {formData.summary.length > 255 && (
                <span className="text-red-500 text-xs ml-1">
                  (Максимум 255 символов)
                </span>
              )}
            </label>
            <input
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              maxLength={255}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Цена*</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Количество</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                min="0"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Подкатегория*</label>
              <select
                name="sub_category_id"
                value={formData.sub_category_id}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                required
              >
                <option value="">Выберите подкатегорию</option>
                {subCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Цвет</label>
              <input
                name="color"
                value={formData.color}
                onChange={handleChange}
                maxLength={50}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Размер</label>
              <input
                name="size"
                value={formData.size}
                onChange={handleChange}
                maxLength={50}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 mt-6 text-white rounded-lg hover:bg-gray-800 transition-colors ${
              loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-black'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Обработка...
              </span>
            ) : 'Добавить товар'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProductAdd;