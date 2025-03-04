import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaSortUp, FaSortDown, FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

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
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const navigate = useNavigate();

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
                setCategories(categories.filter(category => category.id !== id));
                Swal.fire('Удалено!', 'Категория была удалена.', 'success');
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
            setCategories(categories.map(category =>
                category.id === editingCategoryId ? response.data : category
            ));
            setEditingCategoryId(null);
            Swal.fire('Успех!', 'Категория успешно обновлена.', 'success');
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

    const handleCreateCategory = async () => {
        if (!newCategory.name.trim()) {
            setError('Название категории не может быть пустым');
            return;
        }

        try {
            const response = await axios.post(API_URL, newCategory);
            setCategories([...categories, response.data]);
            setIsAdding(false);
            setNewCategory({ name: '' });
            Swal.fire('Успех!', 'Категория успешно создана.', 'success');
        } catch (err) {
            setError('Ошибка при создании категории: ' + err.message);
            console.error('Ошибка:', err);
        }
    };

    const handleSort = useCallback((key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    }, [sortConfig]);

    const filteredCategories = useMemo(() => categories.filter(category =>
        category.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [categories, searchTerm]);

    const sortedCategories = useMemo(() => filteredCategories.sort((a, b) => {
        if (sortConfig.key) {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
        }
        return 0;
    }), [filteredCategories, sortConfig]);

    const indexOfLastCategory = currentPage * categoriesPerPage;
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
    const currentCategories = sortedCategories.slice(indexOfFirstCategory, indexOfLastCategory);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Загрузка...</div>;
    }

    return (
        <div className="p-8 bg-white min-h-screen">
            <button
                onClick={() => navigate(-1)}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center mb-4"
            >
                <FaArrowLeft className="mr-2" />
                Назад
            </button>













        











    
            <h1 className="text-2xl font-bold mb-4 text-black">Категории</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
    
            <button
                onClick={() => setIsAdding(true)}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center mb-4"
            >
                <FaPlus className="mr-2" />
                Добавить категорию
            </button>

            {isAdding && (
                <div className="mb-4 flex flex-col items-start">
                    <input
                        type="text"
                        placeholder="Название категории"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white text-black"
                    />
                    <div className="flex mt-2">
                        <button
                            onClick={handleCreateCategory}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 ease-in-out flex items-center mr-2"
                        >
                            <FaSave className="mr-2" />
                            Сохранить
                        </button>
                        <button
                            onClick={() => setIsAdding(false)}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300 ease-in-out flex items-center"
                        >
                            <FaTimes className="mr-2" />
                            Отмена
                        </button>
                    </div>
                </div>
            )}

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Поиск по названию"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white text-black"
                />
            </div>
    
            

            
    
            <CategoryTable
                categories={currentCategories}
                editingCategoryId={editingCategoryId}
                editedCategory={editedCategory}
                handleEditCategory={handleEditCategory}
                handleSaveCategory={handleSaveCategory}
                handleCancelEdit={handleCancelEdit}
                handleDeleteCategory={handleDeleteCategory}
                setEditedCategory={setEditedCategory}
                handleSort={handleSort}
                sortConfig={sortConfig}
            />
    
            <Pagination
                totalCategories={filteredCategories.length}
                categoriesPerPage={categoriesPerPage}
                currentPage={currentPage}
                paginate={paginate}
            />
    
            <div className="mt-4 text-gray-700">
                Показано {currentCategories.length} из {filteredCategories.length} категорий
            </div>
        </div>
    );
};

const CategoryTable = ({
    categories,
    editingCategoryId,
    editedCategory,
    handleEditCategory,
    handleSaveCategory,
    handleCancelEdit,
    handleDeleteCategory,
    setEditedCategory,
    handleSort,
    sortConfig
}) => (
    <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse border border-gray-300 shadow-lg">
            <thead className="bg-gray-800 text-white">
                <tr>
                    <th className="border border-gray-300 p-2 cursor-pointer relative" onClick={() => handleSort('id')}>
                        <div className="flex items-center justify-center">
                            <span>ID</span>
                            {sortConfig.key === 'id' && (
                                <span className="ml-2 absolute right-2">
                                    {sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />}
                                </span>
                            )}
                        </div>
                    </th>
                    <th className="border border-gray-300 p-2 cursor-pointer relative" onClick={() => handleSort('name')}>
                        <div className="flex items-center justify-center">
                            <span>Название</span>
                            {sortConfig.key === 'name' && (
                                <span className="ml-2 absolute right-2">
                                    {sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />}
                                </span>
                            )}
                        </div>
                    </th>
                    <th className="border border-gray-300 p-2 cursor-pointer relative" onClick={() => handleSort('created_at')}>
                        <div className="flex items-center justify-center">
                            <span>Дата создания</span>
                            {sortConfig.key === 'created_at' && (
                                <span className="ml-2 absolute right-2">
                                    {sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />}
                                </span>
                            )}
                        </div>
                    </th>
                    <th className="border border-gray-300 p-2">Действия</th>
                </tr>
            </thead>
            <tbody>
                {categories.map((category) => (
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
);

const Pagination = ({ totalCategories, categoriesPerPage, currentPage, paginate }) => (
    <div className="flex justify-center mt-4">
        {Array.from({ length: Math.ceil(totalCategories / categoriesPerPage) }, (_, i) => (
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
);

export default AdminCategory;