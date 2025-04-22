import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

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
    quantity: '1',
    image_path: '',
    currency: '' // Добавили выбор валюты
  });

  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Drag and drop для изображений
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        handleImageChange({ target: { files: acceptedFiles } });
      }
    }
  });

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
    const file = e.target.files?.[0] || (e instanceof Array && e[0]);
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
      // Валидация полей
      if (!formData.name || formData.name.length > 255) {
        throw new Error('Название обязательно (макс. 255 символов)');
      }
      
      if (!formData.sku || formData.sku.length > 100) {
        throw new Error('SKU обязательно (макс. 100 символов)');
      }
      
      if (!formData.price || parseFloat(formData.price) <= 0) {
        throw new Error('Цена должна быть больше 0');
      }
      
      if (!formData.sub_category_id) {
        throw new Error('Выберите подкатегорию');
      }
      
      if (parseInt(formData.quantity) < 1) {
        throw new Error('Количество не может быть меньше 1');
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
        const normalizedCategory = selectedCategory.name
          .toLowerCase()
          .replace(/\s+/g, '_');
        imagePath = `${normalizedCategory}/${imageFile.name}`;
      }
  
      // Создаем FormData для отправки
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('summary', formData.summary);
      formDataToSend.append('sub_category_id', formData.sub_category_id);
      formDataToSend.append('color', formData.color);
      formDataToSend.append('size', formData.size);
      formDataToSend.append('sku', formData.sku);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('quantity', formData.quantity);
      formDataToSend.append('image_path', imagePath);
      formDataToSend.append('currency', formData.currency);
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
  
      const response = await axios.post(
        'http://localhost:8080/api/v1/admin/products', 
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      setSuccess('Товар успешно добавлен!');
      resetForm();
      
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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      summary: '',
      sub_category_id: '',
      color: '',
      size: '',
      sku: '',
      price: '0',
      quantity: '1',
      image_path: '',
      currency: 'BYN'
    });
    setImageFile(null);
    setImagePreview('');
  };

  return (
    <div className="flex flex-col md:flex-row bg-white min-h-screen">
      {/* Блок загрузки изображения */}
      <div className="md:w-1/3 p-8 bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div
            {...getRootProps()}
            className={`w-full h-96 flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-colors overflow-hidden ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-500'
            }`}
          >
            <input {...getInputProps()} />
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
                <p className="mb-2 text-gray-600">
                  {isDragActive ? 'Отпустите для загрузки' : 'Перетащите изображение сюда'}
                </p>
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
          </div>
          <input 
            id="image-upload"
            type="file" 
            className="hidden" 
            onChange={handleImageChange} 
            accept="image/jpeg,image/png,image/webp"
          />
        </div>
      </div>

      {/* Форма добавления товара */}
      <div className="md:w-2/3 p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Добавить товар</h2>
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Название товара*
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                maxLength={255}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Например: Футболка с принтом"
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.name.length}/255 символов
              </div>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Артикул (SKU)*
              </label>
              <input
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                maxLength={100}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Например: T-SHIRT-001"
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.sku.length}/100 символов
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Описание товара
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="5"
              placeholder="Подробное описание товара..."
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Краткое описание (для карточки товара)
            </label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              maxLength={255}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
              placeholder="Кратко о товаре..."
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.summary.length}/255 символов
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Цена*
            </label>
            <div className="relative">
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-16"
                required
                min="0.01"
                step="0.01"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="bg-gray-100 text-sm rounded-l px-3">
                  Br
                </span>
              </div>
            </div>
          </div>

            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Количество*
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                required
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Подкатегория*
              </label>
              <select
                name="sub_category_id"
                value={formData.sub_category_id}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Цвет
              </label>
              <input
                name="color"
                value={formData.color}
                onChange={handleChange}
                maxLength={50}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Например: Красный"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Размер
              </label>
              <input
                name="size"
                value={formData.size}
                onChange={handleChange}
                maxLength={50}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Например: XL или 42"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 text-white rounded-lg transition-colors ${
                loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-black hover:bg-gray-700'
              } flex items-center justify-center`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Добавление...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Добавить товар
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductAdd;