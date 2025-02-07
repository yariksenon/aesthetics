import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Загрузка списка пользователей
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/v1/admin/users', {
                    withCredentials: true,
                });
                setUsers(response.data);
            } catch (err) {
                setError('Ошибка при загрузке пользователей');
                console.error('Ошибка:', err);
            }
        };

        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId) => {
        try {
            await axios.delete(`http://localhost:8080/api/v1/admin/users/${userId}`, {
                withCredentials: true,
            });
            setUsers(users.filter(user => user.id !== userId)); // Удаляем пользователя из списка
        } catch (err) {
            setError('Ошибка при удалении пользователя');
            console.error('Ошибка:', err);
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        try {
            await axios.put(`http://localhost:8080/api/v1/admin/users/${userId}/role`, {
                role: newRole,
            }, {
                withCredentials: true,
            });
            setUsers(users.map(user => 
                user.id === userId ? { ...user, role: newRole } : user
            )); // Обновляем роль пользователя в списке
        } catch (err) {
            setError('Ошибка при изменении роли');
            console.error('Ошибка:', err);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Админ-панель</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
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
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-100">
                            <td className="border border-gray-300 p-2">{user.id}</td>
                            <td className="border border-gray-300 p-2">
                                {user.first_name?.String || "not specified"}
                            </td>
                            <td className="border border-gray-300 p-2">
                                {user.last_name?.String || "not specified"}
                            </td>
                            <td className="border border-gray-300 p-2">
                                {user.username}
                            </td>
                            <td className="border border-gray-300 p-2">{user.email}</td>
                            <td className="border border-gray-300 p-2">{user.subscribe ? "yes" : "no"}</td>
                            <td className="border border-gray-300 p-2">{user.password}</td>
                            <td className="border border-gray-300 p-2">{user.phone}</td>
                            <td className="border border-gray-300 p-2">
                                {user.role}
                            </td>
                            <td className="border border-gray-300 p-2">
                                {new Date(user.created_at).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminPanel;
