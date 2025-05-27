import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { FaEdit, FaTrash, FaSave, FaTimes, FaArrowLeft } from 'react-icons/fa'
import Swal from 'sweetalert2'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { motion } from 'framer-motion'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import * as Flags from 'country-flag-icons/react/3x2'

const UserRow = React.memo(
	({
		user,
		editingUserId,
		editedUser,
		handleInputChange,
		handleEdit,
		handleDelete,
		handleSave,
		handleCancel,
		isSelected,
		handleSelect,
	}) => {
		const [countryCode, setCountryCode] = useState('')

		useEffect(() => {
			if (user.phone) {
				const phoneNumber = parsePhoneNumberFromString(user.phone)
				if (phoneNumber && phoneNumber.isValid()) {
					setCountryCode(phoneNumber.country || '')
				} else {
					setCountryCode('')
				}
			}
		}, [user.phone])

		const isEditing = editingUserId === user.id

		const handleRowClick = e => {
			if (!e.target.closest('button')) handleSelect(user.id)
		}

		const renderCell = (name, value, type = 'text') =>
			isEditing ? (
				name === 'subscription' ? (
					<select
						name={name}
						value={editedUser[name] ?? (value ? 'yes' : 'no')}
						onChange={handleInputChange}
						className='w-full px-2 py-1 border rounded'
					>
						<option value='yes'>Да</option>
						<option value='no'>Нет</option>
					</select>
				) : type === 'select' ? (
					<select
						name={name}
						value={editedUser[name] || ''}
						onChange={handleInputChange}
						className='w-full px-2 py-1 border rounded'
					>
						{['admin', 'client', 'brand', 'courier'].map(role => (
							<option key={role} value={role}>
								{role}
							</option>
						))}
					</select>
				) : (
					<input
						type={type}
						name={name}
						value={editedUser[name] || value}
						onChange={handleInputChange}
						className='w-full px-2 py-1 border rounded'
						maxLength={
							{
								username: 20,
								email: 50,
								phone: 12,
								password: 30,
								first_name: 20,
								last_name: 20,
							}[name]
						}
					/>
				)
			) : (
				<span className='block truncate' title={value?.toString()}>
					{name === 'subscription' ? (value ? 'да' : 'нет') : value}
				</span>
			)

		const FlagComponent = countryCode ? Flags[countryCode.toUpperCase()] : null

		return (
			<motion.tr
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
				className={`${
					isSelected
						? 'bg-gray-300'
						: user.id % 2 === 0
						? 'bg-gray-50'
						: 'bg-white'
				} hover:bg-gray-200 transition-colors cursor-pointer`}
				onClick={handleRowClick}
			>
				{[
					'id',
					'first_name',
					'last_name',
					'username',
					'email',
					'subscription',
					'password',
					'phone',
					'role',
					'created_at',
				].map((field, i) => (
					<td key={field} className='border border-gray-300 p-2'>
						{field === 'created_at' ? (
							new Date(user[field]).toLocaleString()
						) : field === 'password' && !isEditing ? (
							'••••••••'
						) : field === 'phone' ? (
							<div className='flex items-center'>
								{FlagComponent && (
									<FlagComponent title={countryCode} className='w-5 h-4 mr-2' />
								)}
								{renderCell(
									field,
									user[field],
									field === 'email'
										? 'email'
										: field === 'role'
										? 'select'
										: 'text'
								)}
							</div>
						) : (
							renderCell(
								field,
								user[field],
								field === 'email'
									? 'email'
									: field === 'role'
									? 'select'
									: 'text'
							)
						)}
					</td>
				))}
				<td className='border border-gray-300 p-2'>
					{isEditing ? (
						<>
							<button
								onClick={handleSave}
								className='bg-black text-white px-2 py-1 rounded hover:bg-gray-600 mr-2'
							>
								<FaSave />
							</button>
							<button
								onClick={handleCancel}
								className='bg-black text-white px-2 py-1 rounded hover:bg-gray-600'
							>
								<FaTimes />
							</button>
						</>
					) : (
						<>
							<button
								onClick={e => {
									e.stopPropagation()
									handleEdit(user)
								}}
								className='bg-black text-white px-2 py-1 rounded hover:bg-gray-600 mr-2'
							>
								<FaEdit />
							</button>
							<button
								onClick={e => {
									e.stopPropagation()
									handleDelete(user.id)
								}}
								className='bg-black text-white px-2 py-1 rounded hover:bg-gray-600'
							>
								<FaTrash />
							</button>
						</>
					)}
				</td>
			</motion.tr>
		)
	}
)

const User = () => {
	const [users, setUsers] = useState([])
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(true)
	const [currentPage, setCurrentPage] = useState(1)
	const [usersPerPage] = useState(10)
	const [editingUserId, setEditingUserId] = useState(null)
	const [editedUser, setEditedUser] = useState({})
	const [searchTerm, setSearchTerm] = useState('')
	const [roleFilter, setRoleFilter] = useState('all')
	const [subscriptionFilter, setSubscriptionFilter] = useState('all')
	const [selectedUsers, setSelectedUsers] = useState([])
	const [sortConfig, setSortConfig] = useState({
		key: null,
		direction: 'ascending',
	})
	const navigate = useNavigate()

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axios.get(
					'http://localhost:8080/api/v1/admin/users'
				)
				setUsers(response.data)
			} catch (err) {
				setError(
					err.response?.data?.message || 'Ошибка при загрузке пользователей'
				)
			} finally {
				setLoading(false)
			}
		}
		fetchData()
	}, [])

	const handleSort = key => {
		let direction = 'ascending'
		if (sortConfig.key === key && sortConfig.direction === 'ascending') {
			direction = 'descending'
		}
		setSortConfig({ key, direction })
	}

	const sortedUsers = [...users].sort((a, b) => {
		if (a[sortConfig.key] < b[sortConfig.key])
			return sortConfig.direction === 'ascending' ? -1 : 1
		if (a[sortConfig.key] > b[sortConfig.key])
			return sortConfig.direction === 'ascending' ? 1 : -1
		return 0
	})

	const filteredUsers = sortedUsers.filter(user => {
		const matchesSearch =
			user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesRole = roleFilter === 'all' || user.role === roleFilter
		const matchesSubscription =
			subscriptionFilter === 'all' ||
			(subscriptionFilter === 'subscribed' && user.subscription) ||
			(subscriptionFilter === 'notSubscribed' && !user.subscription)
		return matchesSearch && matchesRole && matchesSubscription
	})

	const indexOfLastUser = currentPage * usersPerPage
	const indexOfFirstUser = indexOfLastUser - usersPerPage
	const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)

	const handleSelectUser = userId => {
		setSelectedUsers(prev =>
			prev.includes(userId)
				? prev.filter(id => id !== userId)
				: [...prev, userId]
		)
	}

	const handleDelete = async userId => {
		const result = await Swal.fire({
			title: 'Вы уверены?',
			text: 'Вы не сможете отменить это действие!',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Да, удалить!',
		})
		if (result.isConfirmed) {
			try {
				if (Array.isArray(userId)) {
					await Promise.all(
						userId.map(id =>
							axios.delete(`http://localhost:8080/api/v1/admin/users/${id}`)
						)
					)
					setUsers(users.filter(user => !userId.includes(user.id)))
					setSelectedUsers([])
				} else {
					await axios.delete(
						`http://localhost:8080/api/v1/admin/users/${userId}`
					)
					setUsers(users.filter(user => user.id !== userId))
				}
				Swal.fire('Удалено!', 'Пользователь был удален.', 'success')
			} catch (err) {
				setError('Ошибка при удалении пользователя')
			}
		}
	}

	const handleSave = async () => {
		const result = await Swal.fire({
			title: 'Вы уверены?',
			text: 'Вы хотите сохранить изменения?',
			icon: 'question',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Да, сохранить!',
		})
		if (result.isConfirmed) {
			try {
				await axios.put(
					`http://localhost:8080/api/v1/admin/users/${editingUserId}`,
					editedUser
				)
				setUsers(
					users.map(user =>
						user.id === editingUserId ? { ...user, ...editedUser } : user
					)
				)
				setEditingUserId(null)
				Swal.fire('Сохранено!', 'Изменения успешно сохранены.', 'success')
			} catch (err) {
				setError('Ошибка при обновлении пользователя: ' + err.message)
			}
		}
	}

	const exportToPDF = (users, title) => {
		const doc = new jsPDF()
		doc.setFontSize(18)
		doc.text(title, 10, 10)
		autoTable(doc, {
			startY: 20,
			head: [
				[
					'ID',
					'Имя',
					'Фамилия',
					'Логин',
					'Email',
					'Роль',
					'Подписка',
					'Дата создания',
				],
			],
			body: users.map(user => [
				user.id,
				user.first_name,
				user.last_name,
				user.username,
				user.email,
				user.role,
				user.subscription ? 'да' : 'нет',
				new Date(user.created_at).toLocaleString(),
			]),
		})
		doc.save(`${title}.pdf`)
	}

	if (loading)
		return (
			<div className='flex justify-center items-center h-screen'>
				Загрузка...
			</div>
		)

	return (
		<div className='p-8'>
			<button
				onClick={() => navigate(-1)}
				className='bg-black text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center mb-4'
			>
				<FaArrowLeft className='mr-2' /> Назад
			</button>
			<h1 className='text-2xl font-bold mb-4'>Пользователи</h1>
			{error && <div className='text-red-500 mb-4'>{error}</div>}

			<div className='mb-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
				{[
					{
						label: 'Всего пользователей',
						value: users.length,
						onClick: () => exportToPDF(users, 'Все пользователи'),
					},
					{
						label: 'Администраторов',
						value: users.filter(user => user.role === 'admin').length,
						onClick: () =>
							exportToPDF(
								users.filter(user => user.role === 'admin'),
								'Администраторы'
							),
					},
					{
						label: 'Подписчиков',
						value: users.filter(user => user.subscription).length,
						onClick: () =>
							exportToPDF(
								users.filter(user => user.subscription),
								'Подписчики'
							),
					},
				].map((stat, i) => (
					<div
						key={i}
						onClick={stat.onClick}
						className='bg-white p-4 rounded-lg shadow-md hover:bg-gray-200 cursor-pointer'
					>
						<h3 className='text-lg font-medium'>{stat.label}</h3>
						<p className='text-2xl font-bold'>{stat.value}</p>
					</div>
				))}
			</div>

			<div className='mb-4 flex gap-4'>
				<input
					type='text'
					placeholder='Поиск по имени'
					value={searchTerm}
					onChange={e => setSearchTerm(e.target.value)}
					className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
				/>
				<select
					value={roleFilter}
					onChange={e => setRoleFilter(e.target.value)}
					className='px-3 py-2 border rounded-md'
				>
					<option value='all'>Все роли</option>
					<option value='admin'>Администраторы</option>
					<option value='client'>Клиенты</option>
					<option value='brand'>Бренд</option>
					<option value='courier'>Курьер</option>
				</select>
				<select
					value={subscriptionFilter}
					onChange={e => setSubscriptionFilter(e.target.value)}
					className='px-3 py-2 border rounded-md'
				>
					<option value='all'>Все подписки</option>
					<option value='subscribed'>Подписанные</option>
					<option value='notSubscribed'>Не подписанные</option>
				</select>
			</div>

			<div className='mb-4'>
				<button
					onClick={() => handleDelete(selectedUsers)}
					className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
					disabled={selectedUsers.length === 0}
				>
					Удалить выбранных ({selectedUsers.length})
				</button>
			</div>

			<div className='overflow-x-auto'>
				<table className='w-full text-center border-collapse border border-gray-300 table-fixed'>
					<thead className='bg-gray-200'>
						<tr>
							<th className='border border-gray-300 p-2 w-16'>ID</th>
							<th className='border border-gray-300 p-2 w-32'>Имя</th>
							<th className='border border-gray-300 p-2 w-32'>Фамилия</th>
							<th className='border border-gray-300 p-2 w-48'>Логин</th>
							<th className='border border-gray-300 p-2 w-64'>Email</th>
							<th className='border border-gray-300 p-2 w-32'>Подписка</th>
							<th className='border border-gray-300 p-2 w-48'>Пароль</th>
							<th className='border border-gray-300 p-2 w-32'>Телефон</th>
							<th className='border border-gray-300 p-2 w-48'>Роль</th>
							<th
								className='border border-gray-300 p-2 w-48 cursor-pointer'
								onClick={() => handleSort('created_at')}
							>
								Дата создания{' '}
								{sortConfig.key === 'created_at' &&
									(sortConfig.direction === 'ascending' ? '↑' : '↓')}
							</th>
							<th className='border border-gray-300 p-2 w-32'>Действия</th>
						</tr>
					</thead>
					<tbody>
						{currentUsers.map(user => (
							<UserRow
								key={user.id}
								user={user}
								editingUserId={editingUserId}
								editedUser={editedUser}
								handleInputChange={e =>
									setEditedUser({
										...editedUser,
										[e.target.name]: e.target.value,
									})
								}
								handleEdit={user => {
									setEditingUserId(user.id)
									setEditedUser(user)
								}}
								handleDelete={handleDelete}
								handleSave={handleSave}
								handleCancel={() => {
									setEditingUserId(null)
									setEditedUser({})
								}}
								isSelected={selectedUsers.includes(user.id)}
								handleSelect={handleSelectUser}
							/>
						))}
					</tbody>
				</table>
			</div>

			<div className='flex justify-center mt-4'>
				{Array.from(
					{ length: Math.ceil(filteredUsers.length / usersPerPage) },
					(_, i) => (
						<button
							key={i + 1}
							onClick={() => setCurrentPage(i + 1)}
							className={`mx-1 px-3 py-1 border rounded ${
								currentPage === i + 1 ? 'bg-black text-white' : 'bg-white'
							}`}
						>
							{i + 1}
						</button>
					)
				)}
			</div>
		</div>
	)
}

export default User
