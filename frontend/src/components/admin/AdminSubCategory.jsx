import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SubCategoryAdmin = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newSubCategory, setNewSubCategory] = useState({ name: '', parent_id: '' });
  const [editSubCategory, setEditSubCategory] = useState({ id: null, name: '', parent_id: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subCategoriesResponse = await axios.get('http://localhost:8080/api/v1/admin/category/subcategories/');
        setSubCategories(subCategoriesResponse.data.subCategories);

        const categoriesResponse = await axios.get('http://localhost:8080/api/v1/admin/categories/');
        setCategories(categoriesResponse.data.categories);
      } catch (error) {
        setError('Ошибка при загрузке данных');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCategoryNameById = (parentId) => {
    const category = categories.find((cat) => cat.id === parentId);
    return category ? category.name : 'Неизвестно';
  };

  const handleAddSubCategory = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/v1/admin/category/subcategories/', newSubCategory);
      setSubCategories([...subCategories, response.data]);
      setNewSubCategory({ name: '', parent_id: '' });
    } catch (error) {
      console.error('Ошибка при добавлении подкатегории:', error);
    }
  };

  const handleEditSubCategory = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8080/api/v1/admin/subcategories/${editSubCategory.id}`,
        editSubCategory
      );
      setSubCategories(
        subCategories.map((subCat) =>
          subCat.id === editSubCategory.id ? response.data : subCat
        )
      );
      setEditSubCategory({ id: null, name: '', parent_id: '' });
    } catch (error) {
      console.error('Ошибка при редактировании подкатегории:', error);
    }
  };

  const handleDeleteSubCategory = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/admin/subcategories/${id}`);
      setSubCategories(subCategories.filter((subCat) => subCat.id !== id));
    } catch (error) {
      console.error('Ошибка при удалении подкатегории:', error);
    }
  };

  if (loading) return <div className="text-center text-gray-700">Загрузка...</div>;
  if (error) return <div className="text-center text-red-600">{error}</div>;

  return (
    <div className="p-4 bg-white text-black">
      <h1 className="text-2xl font-bold mb-4">Управление подкатегориями</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Добавить подкатегорию</h2>
        <input
          type="text"
          placeholder="Название подкатегории"
          value={newSubCategory.name}
          onChange={(e) => setNewSubCategory({ ...newSubCategory, name: e.target.value })}
          className="border border-gray-700 p-2 mr-2 bg-white text-black"
        />
        <input
          type="number"
          placeholder="ID родительской категории"
          value={newSubCategory.parent_id}
          onChange={(e) => setNewSubCategory({ ...newSubCategory, parent_id: e.target.value })}
          className="border border-gray-700 p-2 mr-2 bg-white text-black"
        />
        <button
          onClick={handleAddSubCategory}
          className="bg-black text-white p-2 rounded hover:bg-gray-800 transition-colors"
        >
          Добавить
        </button>
      </div>

      {editSubCategory.id && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Редактировать подкатегорию</h2>
          <input
            type="text"
            placeholder="Название подкатегории"
            value={editSubCategory.name}
            onChange={(e) => setEditSubCategory({ ...editSubCategory, name: e.target.value })}
            className="border border-gray-700 p-2 mr-2 bg-white text-black"
          />
          <input
            type="number"
            placeholder="ID родительской категории"
            value={editSubCategory.parent_id}
            onChange={(e) => setEditSubCategory({ ...editSubCategory, parent_id: e.target.value })}
            className="border border-gray-700 p-2 mr-2 bg-white text-black"
          />
          <button
            onClick={handleEditSubCategory}
            className="bg-black text-white p-2 rounded hover:bg-gray-800 transition-colors"
          >
            Сохранить
          </button>
          <button
            onClick={() => setEditSubCategory({ id: null, name: '', parent_id: '' })}
            className="bg-gray-500 text-white p-2 rounded ml-2 hover:bg-gray-600 transition-colors"
          >
            Отмена
          </button>
        </div>
      )}

      <table className="w-full border-collapse border border-gray-700">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-700 p-2">ID</th>
            <th className="border border-gray-700 p-2">Название</th>
            <th className="border border-gray-700 p-2">Родительская категория</th>
            <th className="border border-gray-700 p-2">Действия</th>
          </tr>
        </thead>
        <tbody>
          {subCategories.map((subCat) => (
            <tr key={subCat.id} className="hover:bg-gray-100 transition-colors">
              <td className="border border-gray-700 p-2">{subCat.id}</td>
              <td className="border border-gray-700 p-2">{subCat.name}</td>
              <td className="border border-gray-700 p-2">
                {subCat.parent_id} ({getCategoryNameById(subCat.parent_id)})
              </td>
              <td className="border border-gray-700 p-2">
                <button
                  onClick={() => setEditSubCategory(subCat)}
                  className="bg-black text-white p-1 rounded mr-2 hover:bg-gray-800 transition-colors"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => handleDeleteSubCategory(subCat.id)}
                  className="bg-red-600 text-white p-1 rounded hover:bg-red-700 transition-colors"
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubCategoryAdmin;