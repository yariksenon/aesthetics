import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaSearch, FaSortUp, FaSortDown } from "react-icons/fa";
import Swal from "sweetalert2";

const SubCategories = () => {
    const [subCategories, setSubCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingSubCategory, setEditingSubCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const navigate = useNavigate();

    const [newSubCategory, setNewSubCategory] = useState({
        name: "",
        parent_id: "",
    });

    const [formErrors, setFormErrors] = useState({});

    const fetchSubCategories = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/v1/admin/subcategories");
            const subCategoriesData = Array.isArray(response.data) ? response.data : [];
            setSubCategories(subCategoriesData);
            setFilteredSubCategories(subCategoriesData);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setSubCategories([]);
            setFilteredSubCategories([]);
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/v1/admin/category");
            setCategories(response.data.categories || []);
        } catch (err) {
            setCategories([]);
        }
    };

    useEffect(() => {
        fetchSubCategories();
        fetchCategories();
    }, []);

    const validateForm = (subCategory) => {
        const errors = {};
        if (!subCategory.name || subCategory.name.length < 2) errors.name = "Название должно быть минимум 2 символа";
        if (!subCategory.parent_id) errors.parent_id = "Выберите родительскую категорию";
        return errors;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSubCategory({ ...newSubCategory, [name]: value });
        setFormErrors({ ...formErrors, [name]: "" });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingSubCategory({ ...editingSubCategory, [name]: value });
        setFormErrors({ ...formErrors, [name]: "" });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleString();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm(newSubCategory);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            const dataToSend = {
                ...newSubCategory,
                parent_id: Number(newSubCategory.parent_id),
            };
            const response = await axios.post("http://localhost:8080/api/v1/admin/subcategories", dataToSend);
            if (response.status === 201) {
                setShowAddForm(false);
                setNewSubCategory({ name: "", parent_id: "" });
                fetchSubCategories();
                Swal.fire("Успех!", "Подкатегория успешно добавлена.", "success");
            }
        } catch (err) {
            Swal.fire("Ошибка!", "Ошибка при добавлении подкатегории.", "error");
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm(editingSubCategory);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        Swal.fire({
            title: "Вы уверены?",
            text: "Вы хотите сохранить изменения?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Да, сохранить",
            cancelButtonText: "Нет",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const dataToSend = {
                        name: editingSubCategory.name,
                        parent_id: Number(editingSubCategory.parent_id),
                    };
                    const response = await axios.put(`http://localhost:8080/api/v1/admin/subcategories/${editingSubCategory.id}`, dataToSend);
                    if (response.status === 200) {
                        setShowEditForm(false);
                        fetchSubCategories();
                        Swal.fire("Сохранено!", "Подкатегория успешно обновлена.", "success");
                    }
                } catch (err) {
                    Swal.fire("Ошибка!", "Ошибка при редактировании подкатегории.", "error");
                }
            }
        });
    };

    const handleEditClick = (subCategory) => {
        setEditingSubCategory(subCategory);
        setShowEditForm(true);
    };

    const handleDeleteClick = (subCategoryId) => {
        Swal.fire({
            title: "Вы уверены?",
            text: "Вы действительно хотите удалить эту подкатегорию?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Да, удалить",
            cancelButtonText: "Нет",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.delete(`http://localhost:8080/api/v1/admin/subcategories/${subCategoryId}`);
                    if (response.status === 200) {
                        fetchSubCategories();
                        Swal.fire("Удалено!", "Подкатегория успешно удалена.", "success");
                    }
                } catch (err) {
                    Swal.fire("Ошибка!", "Ошибка при удалении подкатегории.", "error");
                }
            }
        });
    };

    useEffect(() => {
        let result = [...subCategories];
        if (searchQuery) {
            result = result.filter((sc) => sc.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        if (sortConfig.key) {
            result.sort((a, b) => {
                if (sortConfig.key === "created_at") {
                    const dateA = new Date(a[sortConfig.key]);
                    const dateB = new Date(b[sortConfig.key]);
                    return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
                }
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }
        setFilteredSubCategories(result);
    }, [searchQuery, subCategories, sortConfig]);

    const handleSort = (key) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
        });
    };

    const getCategoryName = (id) => {
        const category = categories.find(cat => cat.id === id);
        return category ? category.name : "Неизвестно";
    };

    if (loading) return <div className="text-center text-gray-500">Загрузка данных...</div>;
    if (error) return <div className="text-center text-red-500">Ошибка: {error}</div>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen text-gray-800">
            <button
                onClick={() => navigate(-1)}
                className="mb-4 flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-600 transition duration-200"
            >
                <FaArrowLeft className="mr-2" />
                Назад
            </button>

            <div className="flex justify-between mb-4">
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-600 flex items-center transition duration-200"
                >
                    <FaPlus className="mr-2" />
                    {showAddForm ? "Скрыть форму" : "Добавить подкатегорию"}
                </button>
            </div>

            <div className="mb-6 flex items-center">
                <FaSearch className="mr-2 text-gray-500" />
                <input
                    type="text"
                    placeholder="Поиск по названию..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-1/2 p-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-gray-600 bg-white text-gray-800"
                />
            </div>

            {showAddForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white shadow rounded-lg border border-gray-300">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Добавить новую подкатегорию</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <input
                                type="text"
                                name="name"
                                placeholder="Название"
                                value={newSubCategory.name}
                                onChange={handleInputChange}
                                className={`p-2 border ${formErrors.name ? "border-red-500" : "border-gray-400"} rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-600`}
                            />
                            {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                        </div>
                        <div>
                            <select
                                name="parent_id"
                                value={newSubCategory.parent_id}
                                onChange={handleInputChange}
                                className={`p-2 border ${formErrors.parent_id ? "border-red-500" : "border-gray-400"} rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-600`}
                            >
                                <option value="">Выберите родительскую категорию</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {formErrors.parent_id && <p className="text-red-500 text-sm">{formErrors.parent_id}</p>}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-600 flex items-center transition duration-200"
                    >
                        <FaPlus className="mr-2" />
                        Добавить
                    </button>
                </form>
            )}

            {showEditForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-full max-w-xl border border-gray-300">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Редактировать подкатегорию</h2>
                        <form onSubmit={handleEditSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Название"
                                        value={editingSubCategory.name}
                                        onChange={handleEditInputChange}
                                        className={`p-2 border ${formErrors.name ? "border-red-500" : "border-gray-400"} rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-600`}
                                    />
                                    {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                                </div>
                                <div>
                                    <select
                                        name="parent_id"
                                        value={editingSubCategory.parent_id}
                                        onChange={handleEditInputChange}
                                        className={`p-2 border ${formErrors.parent_id ? "border-red-500" : "border-gray-400"} rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-600`}
                                    >
                                        <option value="">Выберите родительскую категорию</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.parent_id && <p className="text-red-500 text-sm">{formErrors.parent_id}</p>}
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEditForm(false)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-400 flex items-center transition duration-200"
                                >
                                    <FaTimes className="mr-2" />
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-600 flex items-center transition duration-200"
                                >
                                    <FaSave className="mr-2" />
                                    Сохранить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto bg-white shadow rounded-lg border border-gray-300">
                <table className="min-w-full divide-y divide-gray-400">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort("id")}>
                                ID {sortConfig.key === "id" && (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
                            </th>
                            <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort("name")}>
                                Название {sortConfig.key === "name" && (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
                            </th>
                            <th className="py-3 px-4 text-left">Родительская категория</th>
                            <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort("created_at")}>
                                Дата создания {sortConfig.key === "created_at" && (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
                            </th>
                            <th className="py-3 px-4 text-left">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-400">
                        {filteredSubCategories.length > 0 ? (
                            filteredSubCategories.map((subCategory) => (
                                <tr key={subCategory.id} className="hover:bg-gray-200 transition duration-150">
                                    <td className="py-3 px-4">{subCategory.id}</td>
                                    <td className="py-3 px-4">{subCategory.name}</td>
                                    <td className="py-3 px-4">{getCategoryName(subCategory.parent_id)}</td>
                                    <td className="py-3 px-4">{formatDateTime(subCategory.created_at)}</td>
                                    <td className="py-3 px-4 flex space-x-2">
                                        <button
                                            onClick={() => handleEditClick(subCategory)}
                                            className="text-gray-600 hover:text-gray-800 transition duration-200"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(subCategory.id)}
                                            className="text-gray-600 hover:text-red-600 transition duration-200"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-4 text-center text-gray-500 italic">
                                    Подкатегории отсутствуют
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SubCategories;