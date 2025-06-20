// src/services/user.js
import axios from 'axios'

const API_URL = 'http://45.12.74.28:8080/api/v1/admin'

// Получить список пользователей
export const fetchUsers = async () => {
	const response = await axios.get(`${API_URL}/users`, {
		withCredentials: true,
	})
	return response.data
}

// Удалить пользователя
export const deleteUser = async userId => {
	await axios.delete(`${API_URL}/users/${userId}`, {
		withCredentials: true,
	})
}

// Изменить роль пользователя
export const updateUserRole = async (userId, newRole) => {
	await axios.put(
		`${API_URL}/users/${userId}/role`,
		{
			role: newRole,
		},
		{
			withCredentials: true,
		}
	)
}

// Обновить данные пользователя
export const updateUser = async (userId, userData) => {
	const response = await axios.put(`${API_URL}/users/${userId}`, userData, {
		withCredentials: true,
	})
	return response.data
}
