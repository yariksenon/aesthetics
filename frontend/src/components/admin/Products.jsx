import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaSearch, FaSync, FaSortUp, FaSortDown } from "react-icons/fa";
import Swal from "sweetalert2";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const navigate = useNavigate();

    const [newProduct, setNewProduct] = useState({
        name: "",
        description: "",
        summary: "",
        sub_category_id: "",
        color: "",
        size: "",
        price: "",
        quantity: "",
        sku: "",
    });

    const [formErrors, setFormErrors] = useState({});

    const transformProduct = (product) => ({
        ...product,
        description: product.description || "",
        summary: product.summary || "",
        sub_category_id: product.sub_category_id || 0,
        color: product.color || "",
        size: product.size || "",
        created_at: product.created_at ? String(product.created_at) : "",
        sku: product.sku && product.sku.Valid ? product.sku.Int64 : generateSKU(),
        price: product.price || "",
    });

    const generateSKU = () => {
        return Math.floor(100000 + Math.random() * 900000); // 6-значное число
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/v1/admin/products");
            const productsData = Array.isArray(response.data) ? response.data : [];
            const transformedProducts = productsData.map(transformProduct);
            setProducts(transformedProducts);
            setFilteredProducts(transformedProducts);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setProducts([]);
            setFilteredProducts([]);
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
        fetchProducts();
        fetchCategories();
    }, []);

    const validateForm = (product) => {
        const errors = {};
        if (!product.name || product.name.length < 2) errors.name = "Название должно быть минимум 2 символа";
        if (!product.sub_category_id) errors.sub_category_id = "Выберите категорию";
        if (!product.price || isNaN(product.price) || Number(product.price) <= 0) errors.price = "Цена должна быть числом больше 0";
        if (!product.quantity || isNaN(product.quantity) || Number(product.quantity) < 0) errors.quantity = "Количество не может быть отрицательным";
        if (product.size && (isNaN(Number(product.size)) || Number(product.size) > 100)) errors.size = "Размер должен быть числом до 100";
        if (product.sku && (product.sku.length !== 6 || isNaN(product.sku))) errors.sku = "SKU должен быть 6-значным числом";
        return errors;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct({ ...newProduct, [name]: value });
        setFormErrors({ ...formErrors, [name]: "" });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingProduct({ ...editingProduct, [name]: value });
        setFormErrors({ ...formErrors, [name]: "" });
    };

    const formatDateTime = (dateString) => {
        if (!dateString || typeof dateString !== "string") return "";
        const formattedDateString = dateString.replace(" ", "T").split(".")[0];
        const date = new Date(formattedDateString);
        return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleString();
    };

    const getCategoryName = (id) => {
        const category = categories.find(cat => cat.id === id);
        return category ? category.name : "Неизвестно";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const productToValidate = { ...newProduct, sku: newProduct.sku || generateSKU() };
        const errors = validateForm(productToValidate);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            const dataToSend = {
                ...productToValidate,
                sub_category_id: Number(productToValidate.sub_category_id),
                price: Number(productToValidate.price),
                quantity: Number(productToValidate.quantity),
                size: productToValidate.size ? Number(productToValidate.size) : null,
                sku: Number(productToValidate.sku),
            };
            const response = await axios.post("http://localhost:8080/api/v1/admin/products", dataToSend);
            if (response.status === 201) {
                setShowAddForm(false);
                setNewProduct({ name: "", description: "", summary: "", sub_category_id: "", color: "", size: "", price: "", quantity: "", sku: "" });
                fetchProducts();
                Swal.fire("Успех!", "Товар успешно добавлен.", "success");
            }
        } catch (err) {
            Swal.fire("Ошибка!", "Ошибка при добавлении товара.", "error");
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm(editingProduct);
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
                        ...editingProduct,
                        sub_category_id: Number(editingProduct.sub_category_id),
                        price: Number(editingProduct.price),
                        quantity: Number(editingProduct.quantity),
                        size: editingProduct.size ? Number(editingProduct.size) : null,
                        sku: Number(editingProduct.sku),
                    };
                    const response = await axios.put(`http://localhost:8080/api/v1/admin/products/${editingProduct.id}`, dataToSend);
                    if (response.status === 200) {
                        setShowEditForm(false);
                        fetchProducts();
                        Swal.fire("Сохранено!", "Товар успешно обновлен.", "success");
                    }
                } catch (err) {
                    Swal.fire("Ошибка!", "Ошибка при редактировании товара.", "error");
                }
            }
        });
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setShowEditForm(true);
    };

    const handleDeleteClick = (productId) => {
        Swal.fire({
            title: "Вы уверены?",
            text: "Вы действительно хотите удалить этот товар?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Да, удалить",
            cancelButtonText: "Нет",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.delete(`http://localhost:8080/api/v1/admin/products/${productId}`);
                    if (response.status === 200) {
                        fetchProducts();
                        Swal.fire("Удалено!", "Товар успешно удален.", "success");
                    }
                } catch (err) {
                    Swal.fire("Ошибка!", "Ошибка при удалении товара.", "error");
                }
            }
        });
    };

    useEffect(() => {
        let result = [...products];
        if (searchQuery) {
            result = result.filter((p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (filterCategory) {
            result = result.filter((p) => String(p.sub_category_id) === filterCategory);
        }
        if (sortConfig.key) {
            result.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }
        setFilteredProducts(result);
    }, [searchQuery, filterCategory, products, sortConfig]);

    const handleSort = (key) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
        });
    };

    const handleRefresh = async () => {
        try {
            await axios.post("http://localhost:8080/api/v1/admin/products/refresh");
            fetchProducts();
            Swal.fire("Обновлено!", "Данные успешно обновлены.", "success");
        } catch (err) {
            Swal.fire("Ошибка!", "Ошибка при обновлении данных.", "error");
        }
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
                    {showAddForm ? "Скрыть форму" : "Добавить товар"}
                </button>
                <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-600 flex items-center transition duration-200"
                >
                    <FaSync className="mr-2" />
                    Обновить
                </button>
            </div>

            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex items-center w-full md:w-1/2">
                    <FaSearch className="mr-2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Поиск по названию или описанию..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-gray-600 bg-white text-gray-800"
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="p-2 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-gray-600 bg-white text-gray-800"
                >
                    <option value="">Все категории</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {showAddForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white shadow rounded-lg border border-gray-300">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Добавить новый товар</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <input
                                type="text"
                                name="name"
                                placeholder="Название"
                                value={newProduct.name}
                                onChange={handleInputChange}
                                className={`p-2 border ${formErrors.name ? "border-red-500" : "border-gray-400"} rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-600`}
                            />
                            {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                        </div>
                        <input
                            type="text"
                            name="description"
                            placeholder="Описание"
                            value={newProduct.description}
                            onChange={handleInputChange}
                            className="p-2 border border-gray-400 rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-600"
                        />
                        <input
                            type="text"
                            name="summary"
                            placeholder="Краткое описание"
                            value={newProduct.summary}
                            onChange={handleInputChange}
                            className="p-2 border border-gray-400 rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-600"
                        />
                        <div>
                            <select
                                name="sub_category_id"
                                value={newProduct.sub_category_id}
                                onChange={handleInputChange}
                                className={`p-2 border ${formErrors.sub_category_id ? "border-red-500" : "border-gray-400"} rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-600`}
                            >
                                <option value="">Выберите категорию</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {formErrors.sub_category_id && <p className="text-red-500 text-sm">{formErrors.sub_category_id}</p>}
                        </div>
                        <input
                            type="text"
                            name="color"
                            placeholder="Цвет"
                            value={newProduct.color}
                            onChange={handleInputChange}
                            className="p-2 border border-gray-400 rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-600"
                        />
                        <div>
                            <input
                                type="number"
                                name="size"
                                placeholder="Размер (макс. 100)"
                                value={newProduct.size}
                                onChange={handleInputChange}
                                max="100"
                                className={`p-2 border ${formErrors.size ? "border-red-500" : "border-gray-400"} rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-600`}
                            />
                            {formErrors.size && <p className="text-red-500 text-sm">{formErrors.size}</p>}
                        </div>
                        <div>
                            <input
                                type="number"
                                name="price"
                                placeholder="Цена (BYN)"
                                value={newProduct.price}
                                onChange={handleInputChange}
                                step="0.01"
                                className={`p-2 border ${formErrors.price ? "border-red-500" : "border-gray-400"} rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-600`}
                            />
                            {formErrors.price && <p className="text-red-500 text-sm">{formErrors.price}</p>}
                        </div>
                        <div>
                            <input
                                type="number"
                                name="quantity"
                                placeholder="Количество"
                                value={newProduct.quantity}
                                onChange={handleInputChange}
                                min="0"
                                className={`p-2 border ${formErrors.quantity ? "border-red-500" : "border-gray-400"} rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-600`}
                            />
                            {formErrors.quantity && <p className="text-red-500 text-sm">{formErrors.quantity}</p>}
                        </div>
                        <div>
                            <input
                                type="number"
                                name="sku"
                                placeholder="SKU (6 цифр)"
                                value={newProduct.sku || generateSKU()}
                                onChange={handleInputChange}
                                className={`p-2 border ${formErrors.sku ? "border-red-500" : "border-gray-400"} rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-600`}
                            />
                            {formErrors.sku && <p className="text-red-500 text-sm">{formErrors.sku}</p>}
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
                    <div className="bg-white p-6 rounded-lg w-full max-w-2xl border border-gray-300">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Редактировать товар</h2>
                        <form onSubmit={handleEditSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Название"
                                        value={editingProduct.name}
                                        onChange={handleEditInputChange}
                                        className={`p-2 border ${formErrors.name ? "border-red-500" : "border-gray-400"} rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-600`}
                                    />
                                    {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                                </div>
                                <input
                                    type="text"
                                    name="description"
                                    placeholder="Описание"
                                    value={editingProduct.description}
                                    onChange={handleEditInputChange}
                                    className="p-2 border border-gray-400 rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-600"
                                />
                                <input
                                    type="text"
                                    name="summary"
                                    placeholder="Краткое описание"
                                    value={editingProduct.summary}
                                    onChange={handleEditInputChange}
                                    className="p-2 border border-gray-400 rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-600"
                                />
                                <div>
                                    <select
                                        name="sub_category_id"
                                        value={editingProduct.sub_category_id}
                                        onChange={handleEditInputChange}
                                        className={`p-2 border ${formErrors.sub_category_id ? "border-red-500" : "border-gray-400"} rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-600`}
                                    >
                                        <option value="">Выберите категорию</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.sub_category_id && <p className="text-red-500 text-sm">{formErrors.sub_category_id}</p>}
                                </div>
                                <input
                                    type="text"
                                    name="color"
                                    placeholder="Цвет"
                                    value={editingProduct.color}
                                    onChange={handleEditInputChange}
                                    className="p-2 border border-gray-400 rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-600"
                                />
                                <div>
                                    <input
                                        type="number"
                                        name="size"
                                        placeholder="Размер (макс. 100)"
                                        value={editingProduct.size}
                                        onChange={handleEditInputChange}
                                        max="100"
                                        className={`p-2 border ${formErrors.size ? "border-red-500" : "border-gray-400"} rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-600`}
                                    />
                                    {formErrors.size && <p className="text-red-500 text-sm">{formErrors.size}</p>}
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        name="price"
                                        placeholder="Цена (BYN)"
                                        value={editingProduct.price}
                                        onChange={handleEditInputChange}
                                        step="0.01"
                                        className={`p-2 border ${formErrors.price ? "border-red-500" : "border-gray-400"} rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-600`}
                                    />
                                    {formErrors.price && <p className="text-red-500 text-sm">{formErrors.price}</p>}
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        name="quantity"
                                        placeholder="Количество"
                                        value={editingProduct.quantity}
                                        onChange={handleEditInputChange}
                                        min="0"
                                        className={`p-2 border ${formErrors.quantity ? "border-red-500" : "border-gray-400"} rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-600`}
                                    />
                                    {formErrors.quantity && <p className="text-red-500 text-sm">{formErrors.quantity}</p>}
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        name="sku"
                                        placeholder="SKU (6 цифр)"
                                        value={editingProduct.sku}
                                        onChange={handleEditInputChange}
                                        className={`p-2 border ${formErrors.sku ? "border-red-500" : "border-gray-400"} rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-600`}
                                    />
                                    {formErrors.sku && <p className="text-red-500 text-sm">{formErrors.sku}</p>}
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
                            <th className="py-3 px-4 text-left">Описание</th>
                            <th className="py-3 px-4 text-left">Краткое описание</th>
                            <th className="py-3 px-4 text-left">Категория</th>
                            <th className="py-3 px-4 text-left">Цвет</th>
                            <th className="py-3 px-4 text-left">Размер</th>
                            <th className="py-3 px-4 text-left">SKU</th>
                            <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort("price")}>
                                Цена (BYN) {sortConfig.key === "price" && (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
                            </th>
                            <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort("quantity")}>
                                Количество {sortConfig.key === "quantity" && (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
                            </th>
                            <th className="py-3 px-4 text-left">Дата создания</th>
                            <th className="py-3 px-4 text-left">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-400">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-200 transition duration-150">
                                    <td className="py-3 px-4">{product.id || ""}</td>
                                    <td className="py-3 px-4">{product.name || ""}</td>
                                    <td className="py-3 px-4">{product.description || ""}</td>
                                    <td className="py-3 px-4">{product.summary || ""}</td>
                                    <td className="py-3 px-4">{getCategoryName(product.sub_category_id)}</td>
                                    <td className="py-3 px-4">{product.color || ""}</td>
                                    <td className="py-3 px-4">{product.size || ""}</td>
                                    <td className="py-3 px-4">{product.sku}</td>
                                    <td className="py-3 px-4">{product.price} BYN</td>
                                    <td className="py-3 px-4">{product.quantity || ""}</td>
                                    <td className="py-3 px-4">{product.created_at ? formatDateTime(product.created_at) : ""}</td>
                                    <td className="py-3 px-4 flex space-x-2">
                                        <button
                                            onClick={() => handleEditClick(product)}
                                            className="text-gray-600 hover:text-gray-800 transition duration-200"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(product.id)}
                                            className="text-gray-600 hover:text-red-600 transition duration-200"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="12" className="py-4 text-center text-gray-500 italic">
                                    Товары отсутствуют
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Products;