import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaSave, FaTimes, FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion } from 'framer-motion';

const UserRow = React.memo(({ user, editingUserId, editedUser, handleInputChange, handleEditUser, handleDeleteUser, handleSaveUser, handleCancelEdit, selectedUsers, handleSelectUser }) => {
    const isEditing = editingUserId === user.id;
    const isSelected = selectedUsers.includes(user.id);

    return (
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`${user.id % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-200 transition-colors`}
        >
            <td className="border border-gray-300 p-2">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectUser(user.id)}
                />
            </td>
            <td className="border border-gray-300 p-2">{user.id}</td>
            <td className="border border-gray-300 p-2">
                {isEditing ? (
                    <input
                        type="text"
                        name="first_name"
                        value={editedUser.first_name || ''}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 border rounded"
                    />
                ) : (
                    user.first_name?.String || user.first_name || ""
                )}
            </td>
            <td className="border border-gray-300 p-2">
                {isEditing ? (
                    <input
                        type="text"
                        name="last_name"
                        value={editedUser.last_name || ''}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 border rounded"
                    />
                ) : (
                    user.last_name?.String || user.last_name || ""
                )}
            </td>
            <td className="border border-gray-300 p-2">
                {isEditing ? (
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
                {isEditing ? (
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
                {isEditing ? (
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
                {isEditing ? (
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
                {isEditing ? (
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
                {isEditing ? (
                    <>
                        <button
                            onClick={handleSaveUser}
                            className="bg-black text-white px-2 py-1 rounded hover:bg-gray-600 mr-2"
                        >
                            <FaSave />
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            className="bg-black text-white px-2 py-1 rounded hover:bg-gray-600"
                        >
                            <FaTimes />
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => handleEditUser(user)}
                            className="bg-black text-white px-2 py-1 rounded hover:bg-gray-600 mr-2"
                        >
                            <FaEdit />
                        </button>
                        <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-black text-white px-2 py-1 rounded hover:bg-gray-600"
                        >
                            <FaTrash />
                        </button>
                    </>
                )}
            </td>
        </motion.tr>
    );
});

const User = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editedUser, setEditedUser] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [subscriptionFilter, setSubscriptionFilter] = useState('all');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [statistics, setStatistics] = useState({
        totalUsers: 0,
        totalAdmins: 0,
        totalSubscribers: 0,
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/v1/admin/users');
                const adaptedUsers = response.data.map(user => ({
                    ...user,
                    first_name: user.first_name?.String || '',
                    last_name: user.last_name?.String || '',
                }));

                if (Array.isArray(adaptedUsers)) {
                    setUsers(adaptedUsers);

                    const totalUsers = adaptedUsers.length;
                    const totalAdmins = adaptedUsers.filter(user => user.role === 'admin').length;
                    const totalSubscribers = adaptedUsers.filter(user => user.subscribe).length;

                    setStatistics({
                        totalUsers,
                        totalAdmins,
                        totalSubscribers,
                    });
                } else {
                    setError('Ошибка: Данные не являются массивом');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Ошибка при загрузке пользователей');
                console.error('Ошибка:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Сортировка
    const sortedUsers = [...users].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Фильтрация
    const filteredUsers = sortedUsers.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesSubscription = subscriptionFilter === 'all' || user.subscribe === (subscriptionFilter === 'subscribed');
        return matchesSearch && matchesRole && matchesSubscription;
    });

    // Пагинация
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Массовые действия
    const handleSelectUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleDeleteSelected = async () => {
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
                    await Promise.all(selectedUsers.map(userId =>
                        axios.delete(`http://localhost:8080/api/v1/admin/users/${userId}`)
                    ));
                    setUsers(users.filter(user => !selectedUsers.includes(user.id)));
                    setSelectedUsers([]);
                    Swal.fire('Удалено!', 'Пользователи были удалены.', 'success');
                } catch (err) {
                    setError('Ошибка при удалении пользователей');
                    console.error('Ошибка:', err);
                }
            }
        });
    };

    // Экспорт в CSV
    const exportUsersToPDF = (users, title = 'Users List') => {
        const doc = new jsPDF();
    
        try {
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text(title, 10, 10);
    
            autoTable(doc, {
                startY: 20,
                head: [['ID', 'First Name', 'Last Name', 'Username', 'Email', 'Role', 'Subscribed', 'Created At']],
                body: users.map(user => [
                    user.id,
                    user.first_name?.String || user.first_name || 'N/A',
                    user.last_name?.String || user.last_name || 'N/A',
                    user.username,
                    user.email,
                    user.role,
                    user.subscribe ? 'Yes' : 'No',
                    new Date(user.created_at).toLocaleString(),
                ]),
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
                alternateRowStyles: { fillColor: [245, 245, 245] },
            });
    
            doc.save(`${title}.pdf`);
        } catch (error) {
            console.error('Ошибка при создании PDF:', error);
            Swal.fire('Ошибка', 'Не удалось создать PDF-документ.', 'error');
        }
    };
    
    // Пример использования:
    const handleExportAllUsers = () => {
        exportUsersToPDF(users, 'All Users');
    };
    
    const handleExportAdmins = () => {
        const admins = users.filter(user => user.role === 'admin');
        exportUsersToPDF(admins, 'Administrators');
    };
    
    const handleExportSubscribers = () => {
        const subscribers = users.filter(user => user.subscribe);
        exportUsersToPDF(subscribers, 'Subscribers');
    };
    

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Загрузка...</div>;
    }

    return (
        <div className="p-8">
            <button
                onClick={() => navigate(-1)}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center mb-4"
            >
                <FaArrowLeft className="mr-2" />
                Назад
            </button>
            <h1 className="text-2xl font-bold mb-4">Пользователи</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}

            <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                        className="bg-white p-4 rounded-lg shadow-md hover:bg-gray-200 cursor-pointer"
                        onClick={() => handleExportAllUsers()}
                    >
                        <h3 className="text-lg font-medium">Всего пользователей</h3>
                        <p className="text-2xl font-bold">{statistics.totalUsers}</p>
                    </div>
                    <div
                        className="bg-white p-4 rounded-lg shadow-md hover:bg-gray-200 cursor-pointer"
                        onClick={() => handleExportAdmins()}
                    >
                        <h3 className="text-lg font-medium">Администраторов</h3>
                        <p className="text-2xl font-bold">{statistics.totalAdmins}</p>
                    </div>
                    <div
                        className="bg-white p-4 rounded-lg shadow-md hover:bg-gray-200 cursor-pointer"
                        onClick={() => handleExportSubscribers()}
                    >
                        <h3 className="text-lg font-medium">Подписчиков</h3>
                        <p className="text-2xl font-bold">{statistics.totalSubscribers}</p>
                    </div>
                </div>
            </div>

            <div className="mb-4 flex gap-4">
                <input
                    type="text"
                    placeholder="Поиск по имени"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                >
                    <option value="all">Все роли</option>
                    <option value="admin">Администраторы</option>
                    <option value="user">Пользователи</option>
                </select>
                <select
                    value={subscriptionFilter}
                    onChange={(e) => setSubscriptionFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                >
                    <option value="all">Все подписки</option>
                    <option value="subscribed">Подписанные</option>
                    <option value="notSubscribed">Не подписанные</option>
                </select>
            </div>

            <div className="mb-4">
                <button
                    onClick={handleDeleteSelected}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    disabled={selectedUsers.length === 0}
                >
                    Удалить выбранных
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse border border-gray-300">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border border-gray-300 p-2"></th>
                            <th className="border border-gray-300 p-2 cursor-pointer" onClick={() => handleSort('id')}>
                                ID {sortConfig.key === 'id' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                            </th>
                            <th className="border border-gray-300 p-2 cursor-pointer" onClick={() => handleSort('first_name')}>
                                First Name {sortConfig.key === 'first_name' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                            </th>
                            <th className="border border-gray-300 p-2 cursor-pointer" onClick={() => handleSort('last_name')}>
                                Last Name {sortConfig.key === 'last_name' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                            </th>
                            <th className="border border-gray-300 p-2 cursor-pointer" onClick={() => handleSort('username')}>
                                Username {sortConfig.key === 'username' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                            </th>
                            <th className="border border-gray-300 p-2 cursor-pointer" onClick={() => handleSort('email')}>
                                Email {sortConfig.key === 'email' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                            </th>
                            <th className="border border-gray-300 p-2 cursor-pointer" onClick={() => handleSort('subscribe')}>
                                Subscribed {sortConfig.key === 'subscribe' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                            </th>
                            <th className="border border-gray-300 p-2">Password</th>
                            <th className="border border-gray-300 p-2">Phone</th>
                            <th className="border border-gray-300 p-2 cursor-pointer" onClick={() => handleSort('role')}>
                                Role {sortConfig.key === 'role' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                            </th>
                            <th className="border border-gray-300 p-2 cursor-pointer" onClick={() => handleSort('created_at')}>
                                Created At {sortConfig.key === 'created_at' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                            </th>
                            <th className="border border-gray-300 p-2">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map((user) => (
                            <UserRow
                                key={user.id}
                                user={user}
                                editingUserId={editingUserId}
                                editedUser={editedUser}
                                handleInputChange={(e) => setEditedUser({ ...editedUser, [e.target.name]: e.target.value })}
                                handleEditUser={(user) => {
                                    setEditingUserId(user.id);
                                    setEditedUser(user);
                                }}
                                handleDeleteUser={async (userId) => {
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
                                                await axios.delete(`http://localhost:8080/api/v1/admin/users/${userId}`);
                                                setUsers(users.filter(user => user.id !== userId));
                                                Swal.fire('Удалено!', 'Пользователь был удален.', 'success');
                                            } catch (err) {
                                                setError('Ошибка при удалении пользователя');
                                                console.error('Ошибка:', err);
                                            }
                                        }
                                    });
                                }}
                                handleSaveUser={async () => {
                                    const result = await Swal.fire({
                                        title: 'Вы уверены?',
                                        text: "Вы хотите сохранить изменения?",
                                        icon: 'question',
                                        showCancelButton: true,
                                        confirmButtonColor: '#3085d6',
                                        cancelButtonColor: '#d33',
                                        confirmButtonText: 'Да, сохранить!'
                                    });

                                    if (result.isConfirmed) {
                                        try {
                                            const response = await axios.put(`http://localhost:8080/api/v1/admin/users/${editingUserId}`, editedUser);
                                            setUsers(users.map(user =>
                                                user.id === editingUserId ? { ...user, ...editedUser } : user
                                            ));
                                            setEditingUserId(null);
                                            Swal.fire('Сохранено!', 'Изменения успешно сохранены.', 'success');
                                        } catch (err) {
                                            setError('Ошибка при обновлении пользователя: ' + err.message);
                                            console.error('Ошибка:', err);
                                        }
                                    }
                                }}
                                handleCancelEdit={() => {
                                    setEditingUserId(null);
                                    setEditedUser({});
                                }}
                                selectedUsers={selectedUsers}
                                handleSelectUser={handleSelectUser}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-center mt-4">
                {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`mx-1 px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-black text-white' : 'bg-white'}`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default User;