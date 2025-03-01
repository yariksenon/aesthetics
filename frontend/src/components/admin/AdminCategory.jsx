import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSave, FaTimes, FaFileExcel, FaPlus } from 'react-icons/fa';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

const API_URL = 'http://localhost:8080/api/v1/admin/category';

const AdminCategory = () => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [categoriesPerPage] = useState(10);
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editedCategory, setEditedCategory] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [newCategory, setNewCategory] = useState({ name: '' });
    const [isAdding, setIsAdding] = useState(false);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await axios.get(API_URL);
            if (response.data && Array.isArray(response.data.categories)) {
                setCategories(response.data.categories);
            } else {
                setError('Ошибка: Данные не являются массивом');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при загрузке категорий');
            console.error('Ошибка:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleDeleteCategory = async (id) => {
        const result = await Swal.fire({
            title: 'Вы уверены?',
            text: "Вы не сможете отменить это действие!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#000',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Да, удалить!'
        });
    
        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/${id}`);
    
                // Удаляем категорию из локального состояния
                setCategories(categories.filter(category => category.id !== id));
    
                // Показываем уведомление об успехе
                Swal.fire('Удалено!', 'Категория была удалена.', 'success');
    
                // Перезапрашиваем данные с сервера (опционально)
                await fetchCategories();
            } catch (err) {
                setError('Ошибка при удалении категории');
                console.error('Ошибка:', err);
            }
        }
    };

    const handleEditCategory = (category) => {
        setEditingCategoryId(category.id);
        setEditedCategory({ ...category });
    };

    const handleSaveCategory = async () => {
        try {
            const response = await axios.put(
                `${API_URL}/${editingCategoryId}`,
                editedCategory
            );
    
            // Обновляем локальное состояние
            setCategories(categories.map(category =>
                category.id === editingCategoryId ? response.data : category
            ));
    
            // Сбрасываем режим редактирования
            setEditingCategoryId(null);
    
            // Показываем уведомление об успехе
            Swal.fire('Успех!', 'Категория успешно обновлена.', 'success');
    
            // Перезапрашиваем данные с сервера (опционально)
            await fetchCategories();
        } catch (err) {
            setError('Ошибка при обновлении категории: ' + err.message);
            console.error('Ошибка:', err);
        }
    };

    const handleCancelEdit = () => {
        setEditingCategoryId(null);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredCategories = categories.filter(category =>
        category.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastCategory = currentPage * categoriesPerPage;
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
    const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const exportToExcel = (data, fileName) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Categories");
        XLSX.writeFile(wb, `${fileName}.xlsx`);
    };

    const handleCreateCategory = async () => {
        if (!newCategory.name.trim()) {
            setError('Название категории не может быть пустым');
            return;
        }
    
        try {
            const response = await axios.post(API_URL, newCategory);
    
            // Добавляем новую категорию в локальное состояние
            setCategories([...categories, response.data]);
    
            // Сбрасываем форму добавления
            setIsAdding(false);
            setNewCategory({ name: '' });
    
            // Показываем уведомление об успехе
            Swal.fire('Успех!', 'Категория успешно создана.', 'success');
    
            // Перезапрашиваем данные с сервера (опционально)
            await fetchCategories();
        } catch (err) {
            setError('Ошибка при создании категории: ' + err.message);
            console.error('Ошибка:', err);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Загрузка...</div>;
    }

    return (
        <div className="p-8 bg-white min-h-screen">
            <h1 className="text-2xl font-bold mb-4 text-black">Категории</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Поиск по названию"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white text-black"
                />
            </div>

            <div className="mb-4 flex space-x-4">
                <button
                    onClick={() => exportToExcel(categories, "all_categories")}
                    className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 flex items-center"
                >
                    <FaFileExcel className="mr-2" />
                    Экспорт всей таблицы
                </button>
                <button
                    onClick={() => exportToExcel(filteredCategories, "filtered_categories")}
                    className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 flex items-center"
                >
                    <FaFileExcel className="mr-2" />
                    Экспорт результатов поиска
                </button>
            </div>

            <div className="mb-4">
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 flex items-center"
                >
                    <FaPlus className="mr-2" />
                    Добавить категорию
                </button>
            </div>

            {isAdding && (
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Название категории"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white text-black"
                    />
                    <button
                        onClick={handleCreateCategory}
                        className="mt-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 flex items-center"
                    >
                        <FaSave className="mr-2" />
                        Сохранить
                    </button>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse border border-gray-300 shadow-lg">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="border border-gray-300 p-2">ID</th>
                            <th className="border border-gray-300 p-2">Название</th>
                            <th className="border border-gray-300 p-2">Дата создания</th>
                            <th className="border border-gray-300 p-2">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentCategories.map((category) => (
                            <tr key={category.id} className="hover:bg-gray-100 transition-colors">
                                <td className="border border-gray-300 p-2">{category.id}</td>
                                <td className="border border-gray-300 p-2">
                                    {editingCategoryId === category.id ? (
                                        <input
                                            type="text"
                                            value={editedCategory.name}
                                            onChange={(e) => setEditedCategory({ ...editedCategory, name: e.target.value })}
                                            className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-black"
                                        />
                                    ) : (
                                        category.name
                                    )}
                                </td>
                                <td className="border border-gray-300 p-2">
                                    {new Date(category.created_at).toLocaleString()}
                                </td>
                                <td className="border border-gray-300 p-2">
                                    {editingCategoryId === category.id ? (
                                        <>
                                            <button
                                                onClick={handleSaveCategory}
                                                className="bg-gray-800 text-white px-2 py-1 rounded hover:bg-gray-900 mr-2"
                                            >
                                                <FaSave />
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                                            >
                                                <FaTimes />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleEditCategory(category)}
                                                className="bg-gray-800 text-white px-2 py-1 rounded hover:bg-gray-900 mr-2"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(category.id)}
                                                className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                            >
                                                <FaTrash />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-center mt-4">
                {Array.from({ length: Math.ceil(filteredCategories.length / categoriesPerPage) }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`mx-1 px-3 py-1 border border-gray-300 rounded ${
                            currentPage === i + 1 ? 'bg-gray-800 text-white' : 'bg-white text-black'
                        }`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AdminCategory;