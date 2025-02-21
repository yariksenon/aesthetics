import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { fetchUsers, deleteUser, updateUserRole, updateUser } from '../../services/user';
import { FaEdit, FaTrash, FaSave, FaTimes, FaFileExcel } from 'react-icons/fa'; // Добавлена иконка для Excel
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx'; // Импорт библиотеки для работы с Excel

const AdminUser = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editedUser, setEditedUser] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchUsers();
                setUsers(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Ошибка при загрузке пользователей');
                console.error('Ошибка:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDeleteUser = async (userId) => {
        Swal.fire({
            title: 'Вы уверены?',
            text: "Вы не сможете отменить это действие!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Да, удалить!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteUser(userId);
                    setUsers(users.filter(user => user.id !== userId));
                    Swal.fire('Удалено!', 'Пользователь был удален.', 'success');
                } catch (err) {
                    setError('Ошибка при удалении пользователя');
                    console.error('Ошибка:', err);
                }
            }
        });
    };

    const handleChangeRole = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            setUsers(users.map(user => 
                user.id === userId ? { ...user, role: newRole } : user
            ));
        } catch (err) {
            setError('Ошибка при изменении роли');
            console.error('Ошибка:', err);
        }
    };

    const handleEditUser = (user) => {
        setEditingUserId(user.id);
        setEditedUser({
            ...user,
            first_name: user.first_name?.String || user.first_name || '',
            last_name: user.last_name?.String || user.last_name || '',
        });
    };

    const handleCancelEdit = () => {
        setEditingUserId(null);
        setEditedUser({});
    };

    const handleSaveUser = async () => {
        try {
            const dataToSend = {
                ...editedUser,
                first_name: editedUser.first_name?.String || editedUser.first_name || '',
                last_name: editedUser.last_name?.String || editedUser.last_name || '',
            };

            const response = await updateUser(editingUserId, dataToSend);
            setUsers(users.map(user => 
                user.id === editingUserId ? { ...user, ...dataToSend } : user
            ));
            setEditingUserId(null);
        } catch (err) {
            setError('Ошибка при обновлении пользователя: ' + err.message);
            console.error('Ошибка:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser((prevUser) => ({
            ...prevUser,
            [name]: value,
        }));
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Функция для экспорта всей таблицы в Excel
    const exportAllToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(users);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Users");
        XLSX.writeFile(wb, "all_users.xlsx");
    };

    // Функция для экспорта результатов поиска в Excel
    const exportFilteredToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredUsers);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Filtered Users");
        XLSX.writeFile(wb, "filtered_users.xlsx");
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Загрузка...</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Пользователи</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}

            {/* Поиск по username */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Поиск по имени"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Кнопки для экспорта */}
            <div className="mb-4 flex space-x-4">
                <button
                    onClick={exportAllToExcel}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
                >
                    <FaFileExcel className="mr-2" />
                    Экспорт всей таблицы
                </button>
                <button
                    onClick={exportFilteredToExcel}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
                >
                    <FaFileExcel className="mr-2" />
                    Экспорт результатов поиска
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse border border-gray-300">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border border-gray-300 p-2">id</th>
                            <th className="border border-gray-300 p-2">first_name</th>
                            <th className="border border-gray-300 p-2">last_name</th>
                            <th className="border border-gray-300 p-2">username</th>
                            <th className="border border-gray-300 p-2">email</th>
                            <th className="border border-gray-300 p-2">subscribe</th>
                            <th className="border border-gray-300 p-2">password</th>
                            <th className="border border-gray-300 p-2">phone</th>
                            <th className="border border-gray-300 p-2">role</th>
                            <th className="border border-gray-300 p-2">created_at</th>
                            <th className="border border-gray-300 p-2">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map((user, index) => (
                            <tr key={user.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors`}>
                                <td className="border border-gray-300 p-2">{user.id}</td>
                                <td className="border border-gray-300 p-2">
                                    {editingUserId === user.id ? (
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={editedUser.first_name || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-2 py-1 border rounded"
                                        />
                                    ) : (
                                        user.first_name?.String || user.first_name || "not specified"
                                    )}
                                </td>
                                <td className="border border-gray-300 p-2">
                                    {editingUserId === user.id ? (
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={editedUser.last_name || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-2 py-1 border rounded"
                                        />
                                    ) : (
                                        user.last_name?.String || user.last_name || "not specified"
                                    )}
                                </td>
                                <td className="border border-gray-300 p-2">
                                    {editingUserId === user.id ? (
                                        <input
                                            type="text"
                                            name="username"
                                            value={editedUser.username || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-2 py-1 border rounded"
                                        />
                                    ) : (
                                        user.username
                                    )}
                                </td>
                                <td className="border border-gray-300 p-2">
                                    {editingUserId === user.id ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={editedUser.email || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-2 py-1 border rounded"
                                        />
                                    ) : (
                                        user.email
                                    )}
                                </td>
                                <td className="border border-gray-300 p-2">{user.subscribe ? "yes" : "no"}</td>
                                <td className="border border-gray-300 p-2">
                                    {editingUserId === user.id ? (
                                        <input
                                            type="password"
                                            name="password"
                                            value={editedUser.password || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-2 py-1 border rounded"
                                        />
                                    ) : (
                                        user.password
                                    )}
                                </td>
                                <td className="border border-gray-300 p-2">
                                    {editingUserId === user.id ? (
                                        <input
                                            type="text"
                                            name="phone"
                                            value={editedUser.phone || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-2 py-1 border rounded"
                                        />
                                    ) : (
                                        user.phone
                                    )}
                                </td>
                                <td className="border border-gray-300 p-2">
                                    {editingUserId === user.id ? (
                                        <select
                                            name="role"
                                            value={editedUser.role || 'user'}
                                            onChange={handleInputChange}
                                            className="w-full px-2 py-1 border rounded"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    ) : (
                                        user.role
                                    )}
                                </td>
                                <td className="border border-gray-300 p-2">{new Date(user.created_at).toLocaleString()}</td>
                                <td className="border border-gray-300 p-2">
                                    {editingUserId === user.id ? (
                                        <>
                                            <button
                                                onClick={handleSaveUser}
                                                className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 mr-2"
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
                                                onClick={() => handleEditUser(user)}
                                                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mr-2"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
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
                {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`mx-1 px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-white'}`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AdminUser;