import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { fetchUsers, deleteUser, updateUserRole, updateUser } from '../../services/user';
import ReactModal from 'react-modal';
import EditUserModal from './EditUserModal';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Иконки для кнопок
import Swal from 'sweetalert2'; // Для красивых подтверждений

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [editingUser, setEditingUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleSaveUser = async (updatedUser) => {
        try {
            await updateUser(updatedUser.id, updatedUser);
            setUsers(users.map(user => 
                user.id === updatedUser.id ? updatedUser : user
            ));
            setIsEditModalOpen(false);
        } catch (err) {
            setError('Ошибка при обновлении пользователя');
            console.error('Ошибка:', err);
        }
    };

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Загрузка...</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Админ-панель</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
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
                                <td className="border border-gray-300 p-2">{user.first_name?.String || "not specified"}</td>
                                <td className="border border-gray-300 p-2">{user.last_name?.String || "not specified"}</td>
                                <td className="border border-gray-300 p-2">{user.username}</td>
                                <td className="border border-gray-300 p-2">{user.email}</td>
                                <td className="border border-gray-300 p-2">{user.subscribe ? "yes" : "no"}</td>
                                <td className="border border-gray-300 p-2">{user.password}</td>
                                <td className="border border-gray-300 p-2">{user.phone}</td>
                                <td className="border border-gray-300 p-2">{user.role}</td>
                                <td className="border border-gray-300 p-2">{new Date(user.created_at).toLocaleString()}</td>
                                <td className="border border-gray-300 p-2">
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
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-center mt-4">
                {Array.from({ length: Math.ceil(users.length / usersPerPage) }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`mx-1 px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-white'}`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={editingUser}
                onSave={handleSaveUser}
            />
        </div>
    );
};

export default AdminPanel;