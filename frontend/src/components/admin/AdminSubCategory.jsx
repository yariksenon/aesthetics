import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaSortUp, FaSortDown, FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8080/api/v1/admin/category/subcategories/';
const CATEGORY_API_URL = 'http://localhost:8080/api/v1/admin/categories/';

const AdminSubCategory = () => {
    const [subCategories, setSubCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [subCategoriesPerPage] = useState(10);
    const [editingSubCategoryId, setEditingSubCategoryId] = useState(null);
    const [editedSubCategory, setEditedSubCategory] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [newSubCategory, setNewSubCategory] = useState({ name: '', parent_id: '' });
    const [isAdding, setIsAdding] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const navigate = useNavigate();

    const fetchSubCategories = useCallback(async () => {
        try {
            const response = await axios.get(API_URL);
            if (response.data && Array.isArray(response.data.subCategories)) {
                setSubCategories(response.data.subCategories);
            } else {
                setError('Ошибка: Данные не являются массивом');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при загрузке подкатегорий');
            console.error('Ошибка:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await axios.get(CATEGORY_API_URL);
            if (response.data && Array.isArray(response.data.categories)) {
                setCategories(response.data.categories);
            } else {
                setError('Ошибка: Данные категорий не являются массивом');
            }
        } catch (err) {
            setError('Ошибка при загрузке категорий');
            console.error('Ошибка:', err);
        }
    }, []);

    useEffect(() => {
        fetchSubCategories();
        fetchCategories();
    }, [fetchSubCategories, fetchCategories]);

    const handleDeleteSubCategory = async (id) => {
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
                await axios.delete(`http://localhost:8080/api/v1/admin/subcategory/${id}`);
                setSubCategories(subCategories.filter(subCategory => subCategory.id !== id));
                Swal.fire('Удалено!', 'Подкатегория была удалена.', 'success');
            } catch (err) {
                setError('Ошибка при удалении подкатегории');
                console.error('Ошибка:', err);
            }
        }
    };

    const handleEditSubCategory = (subCategory) => {
        setEditingSubCategoryId(subCategory.id);
        setEditedSubCategory({ ...subCategory });
    };

    const handleSaveSubCategory = async () => {
        try {
            const response = await axios.put(
                `http://localhost:8080/api/v1/admin/subcategory/${editingSubCategoryId}`,
                editedSubCategory
            );
            setSubCategories(subCategories.map(subCategory =>
                subCategory.id === editingSubCategoryId ? response.data : subCategory
            ));
            setEditingSubCategoryId(null);
            Swal.fire('Успех!', 'Подкатегория успешно обновлена.', 'success');
        } catch (err) {
            setError('Ошибка при обновлении подкатегории: ' + err.message);
            console.error('Ошибка:', err);
        }
    };

    const handleCancelEdit = () => {
        setEditingSubCategoryId(null);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCreateSubCategory = async () => {
        if (!newSubCategory.name.trim() || !newSubCategory.parent_id) {
            setError('Название и родительская категория не могут быть пустыми');
            return;
        }

        try {
            const response = await axios.post(API_URL, newSubCategory);
            setSubCategories([...subCategories, response.data]);
            setIsAdding(false);
            setNewSubCategory({ name: '', parent_id: '' });
            Swal.fire('Успех!', 'Подкатегория успешно создана.', 'success');
        } catch (err) {
            setError('Ошибка при создании подкатегории: ' + err.message);
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

    const filteredSubCategories = useMemo(() => subCategories.filter(subCategory =>
        subCategory.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [subCategories, searchTerm]);

    const sortedSubCategories = useMemo(() => filteredSubCategories.sort((a, b) => {
        if (sortConfig.key) {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
        }
        return 0;
    }), [filteredSubCategories, sortConfig]);

    const indexOfLastSubCategory = currentPage * subCategoriesPerPage;
    const indexOfFirstSubCategory = indexOfLastSubCategory - subCategoriesPerPage;
    const currentSubCategories = sortedSubCategories.slice(indexOfFirstSubCategory, indexOfLastSubCategory);

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

            <h1 className="text-2xl font-bold mb-4 text-black">Подкатегории</h1>
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

            {isAdding && (
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Название подкатегории"
                        value={newSubCategory.name}
                        onChange={(e) => setNewSubCategory({ ...newSubCategory, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white text-black mb-2"
                    />
                    <select
                        value={newSubCategory.parent_id}
                        onChange={(e) => setNewSubCategory({ ...newSubCategory, parent_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white text-black mb-2"
                    >
                        <option value="">Выберите родительскую категорию</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleCreateSubCategory}
                        className="mt-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 flex items-center"
                    >
                        <FaSave className="mr-2" />
                        Сохранить
                    </button>
                </div>
            )}

            <SubCategoryTable
                subCategories={currentSubCategories}
                editingSubCategoryId={editingSubCategoryId}
                editedSubCategory={editedSubCategory}
                handleEditSubCategory={handleEditSubCategory}
                handleSaveSubCategory={handleSaveSubCategory}
                handleCancelEdit={handleCancelEdit}
                handleDeleteSubCategory={handleDeleteSubCategory}
                setEditedSubCategory={setEditedSubCategory}
                handleSort={handleSort}
                sortConfig={sortConfig}
                categories={categories}
            />

            <Pagination
                totalSubCategories={filteredSubCategories.length}
                subCategoriesPerPage={subCategoriesPerPage}
                currentPage={currentPage}
                paginate={paginate}
            />

            <div className="mt-4 text-gray-700">
                Показано {currentSubCategories.length} из {filteredSubCategories.length} подкатегорий
            </div>
        </div>
    );
};

const SubCategoryTable = ({
    subCategories,
    editingSubCategoryId,
    editedSubCategory,
    handleEditSubCategory,
    handleSaveSubCategory,
    handleCancelEdit,
    handleDeleteSubCategory,
    setEditedSubCategory,
    handleSort,
    sortConfig,
    categories
}) => {
    const getCategoryNameById = (parentId) => {
        const category = categories.find((cat) => cat.id === parentId);
        return category ? category.name : 'Неизвестно';
    };

    return (
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
                        <th className="border border-gray-300 p-2">Родительская категория</th>
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
                    {subCategories.map((subCategory) => (
                        <tr key={subCategory.id} className="hover:bg-gray-100 transition-colors">
                            <td className="border border-gray-300 p-2">{subCategory.id}</td>
                            <td className="border border-gray-300 p-2">
                                {editingSubCategoryId === subCategory.id ? (
                                    <input
                                        type="text"
                                        value={editedSubCategory.name}
                                        onChange={(e) => setEditedSubCategory({ ...editedSubCategory, name: e.target.value })}
                                        className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-black"
                                    />
                                ) : (
                                    subCategory.name
                                )}
                            </td>
                            <td className="border border-gray-300 p-2">
                                {getCategoryNameById(subCategory.parent_id)}
                            </td>
                            <td className="border border-gray-300 p-2">
                                {new Date(subCategory.created_at).toLocaleString()}
                            </td>
                            <td className="border border-gray-300 p-2">
                                {editingSubCategoryId === subCategory.id ? (
                                    <>
                                        <button
                                            onClick={handleSaveSubCategory}
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
                                            onClick={() => handleEditSubCategory(subCategory)}
                                            className="bg-gray-800 text-white px-2 py-1 rounded hover:bg-gray-900 mr-2"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSubCategory(subCategory.id)}
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
};

const Pagination = ({ totalSubCategories, subCategoriesPerPage, currentPage, paginate }) => (
    <div className="flex justify-center mt-4">
        {Array.from({ length: Math.ceil(totalSubCategories / subCategoriesPerPage) }, (_, i) => (
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

export default AdminSubCategory;