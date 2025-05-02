import React, { useEffect, useState } from 'react'
import axios from 'axios'
import AddressInput from './AddressInput'

const UserProfile = () => {
	const [profile, setProfile] = useState(null)
	const [error, setError] = useState('')
	const [showAddressForm, setShowAddressForm] = useState(false)
	const [userAddress, setUserAddress] = useState(null)
	const [avatar, setAvatar] = useState(null)
	const [isEditing, setIsEditing] = useState(false)

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const token =
					localStorage.getItem('authToken') || getCookie('auth_token')
				if (!token) {
					throw new Error('Not authenticated')
				}

				const response = await axios.get(
					'http://localhost:8080/api/v1/profile',
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
						withCredentials: true,
					}
				)

				setProfile(response.data)
				await fetchUserAddress(response.data.id, token)

				// Загрузка аватара (если есть)
				if (response.data.avatar_url) {
					setAvatar(response.data.avatar_url)
				} else {
					// Дефолтный аватар
					setAvatar(
						'https://ui-avatars.com/api/?name=' +
							encodeURIComponent(
								response.data.first_name + ' ' + response.data.last_name
							) +
							'&background=random'
					)
				}
			} catch (err) {
				setError(err.response?.data?.error || err.message)
				localStorage.removeItem('authToken')
			}
		}

		fetchProfile()
	}, [])

	const fetchUserAddress = async (userId, token) => {
		try {
			const response = await axios.get(
				`http://localhost:8080/api/v1/profile/address?user_id=${userId}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			)
			setUserAddress(response.data)
		} catch (err) {
			if (err.response?.status !== 404) {
				console.error('Error fetching address:', err)
			}
		}
	}

	const handleAvatarChange = e => {
		const file = e.target.files[0]
		if (file) {
			const reader = new FileReader()
			reader.onloadend = () => {
				setAvatar(reader.result)
				// Здесь можно добавить запрос на сервер для сохранения аватара
			}
			reader.readAsDataURL(file)
		}
	}

	const handleUnsubscribe = async () => {
		try {
			const token = localStorage.getItem('authToken') || getCookie('auth_token')
			await axios.post(
				'http://localhost:8080/api/v1/profile/unsubscribe',
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			)
			setProfile(prev => ({ ...prev, subscription: false }))
		} catch (err) {
			console.error('Error unsubscribing:', err)
		}
	}

	const getCookie = name => {
		const value = `; ${document.cookie}`
		const parts = value.split(`; ${name}=`)
		if (parts.length === 2) return parts.pop().split(';').shift()
	}

	if (error) {
		return (
			<div className='max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-center'>
				<div className='text-red-500 mb-4'>{error}</div>
				<button
					onClick={() => (window.location.href = '/login')}
					className='mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg transition'
				>
					Go to Login
				</button>
			</div>
		)
	}

	if (!profile) {
		return (
			<div className='max-w-md mx-auto mt-10 p-6 text-center'>
				<div className='animate-pulse'>
					<div className='h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4'></div>
					<div className='h-8 bg-gray-200 rounded w-1/2 mx-auto'></div>
				</div>
			</div>
		)
	}

	return (
		<div className='mt-[2%] bg-white overflow-hidden'>
			<div className='flex-1'>
				<div className='mt-4 space-y-3'>
					<div className='flex items-center'>
						<span className='w-24 text-gray-600'>Имя</span>
						{isEditing ? (
							<input
								type='text'
								defaultValue={profile.first_name}
								className='flex-1 border-b border-gray-300 focus:border-blue-500 outline-none py-1'
							/>
						) : (
							<span className='flex-1 font-medium'>{profile.first_name}</span>
						)}
					</div>

					<div className='flex items-center'>
						<span className='w-24 text-gray-600'>Фамилия</span>
						{isEditing ? (
							<input
								type='text'
								defaultValue={profile.last_name}
								className='flex-1 border-b border-gray-300 focus:border-blue-500 outline-none py-1'
							/>
						) : (
							<span className='flex-1 font-medium'>{profile.last_name}</span>
						)}
					</div>

					<div className='flex items-center'>
						<span className='w-24 text-gray-600'>Email</span>
						<span className='flex-1 font-medium'>{profile.email}</span>
					</div>

					<div className='flex items-center'>
						<span className='w-24 text-gray-600'>Телефон</span>
						{isEditing ? (
							<input
								type='text'
								defaultValue={profile.phone}
								className='flex-1 border-b border-gray-300 focus:border-blue-500 outline-none py-1'
							/>
						) : (
							<span className='flex-1 font-medium'>{profile.phone}</span>
						)}
					</div>

					<div className='flex items-center'>
						<span className='w-24 text-gray-600'>Подписка</span>
						<div className='flex-1 flex items-center'>
							<span
								className={`font-medium ${
									profile.subscription ? 'text-green-600' : 'text-gray-600'
								}`}
							>
								{profile.subscription ? 'Active' : 'Inactive'}
							</span>
						</div>
					</div>

					<div className='flex items-center'>
						<span className='w-24 text-gray-600'>С нами с</span>
						<span className='flex-1 font-medium'>
							{new Date(profile.created_at).toLocaleDateString()}
						</span>
					</div>
				</div>

				<div className='mt-8 pt-6 border-t border-gray-200'>
					<h3 className='text-lg font-medium text-gray-900 mb-4'>
						Address Information
					</h3>

					{!showAddressForm ? (
						<div className='space-y-2'>
							{userAddress ? (
								<div className='bg-gray-50 p-4 rounded-lg'>
									<p>
										<span className='text-gray-600'>Street:</span>{' '}
										{userAddress.street}
									</p>
									<p>
										<span className='text-gray-600'>City:</span>{' '}
										{userAddress.city}
									</p>
									<p>
										<span className='text-gray-600'>Postal Code:</span>{' '}
										{userAddress.postal_code}
									</p>
									<p>
										<span className='text-gray-600'>Country:</span>{' '}
										{userAddress.country}
									</p>
								</div>
							) : (
								<p className='text-gray-500 italic'>
									No address information provided
								</p>
							)}
							<button
								onClick={() => setShowAddressForm(true)}
								className='mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition'
							>
								{userAddress ? 'Edit Address' : 'Add Address'}
							</button>
						</div>
					) : (
						<AddressInput
							userId={profile.id}
							onCancel={() => setShowAddressForm(false)}
							onSave={() => {
								setShowAddressForm(false)
								fetchUserAddress(
									profile.id,
									localStorage.getItem('authToken') || getCookie('auth_token')
								)
							}}
							initialAddress={userAddress}
						/>
					)}
				</div>

				{isEditing && (
					<div className='mt-6 flex justify-end space-x-3'>
						<button
							className='px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition'
							onClick={() => setIsEditing(false)}
						>
							Cancel
						</button>
						<button
							className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition'
							onClick={() => {
								// Здесь должна быть логика сохранения изменений
								setIsEditing(false)
							}}
						>
							Save Changes
						</button>
					</div>
				)}

				<div className='mt-8 pt-6 border-t border-gray-200'>
					<button
						onClick={() => {
							localStorage.removeItem('authToken')
							document.cookie =
								'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
							window.location.href = '/login'
						}}
						className='w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition'
					>
						Logout
					</button>
				</div>
			</div>
		</div>
	)
}

export default UserProfile
