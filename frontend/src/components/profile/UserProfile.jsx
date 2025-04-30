import React, { useEffect, useState } from "react";
import axios from "axios";
import AddressInput from "./AddressInput"; // Импортируем компонент для ввода адреса

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false); // Состояние для отображения формы адреса
  const [userAddress, setUserAddress] = useState(null); // Состояние для хранения адреса пользователя

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken') || getCookie('auth_token');
        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await axios.get('http://localhost:8080/api/v1/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });

        setProfile(response.data);
        
        // Загружаем адрес пользователя после загрузки профиля
        await fetchUserAddress(response.data.id, token);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        localStorage.removeItem('authToken');
      }
    };

    fetchProfile();
  }, []);

  // Функция для получения адреса пользователя
  const fetchUserAddress = async (userId, token) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/profile/address?user_id=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUserAddress(response.data);
    } catch (err) {
      // Если адрес не найден, это не критическая ошибка
      if (err.response?.status !== 404) {
        console.error('Error fetching address:', err);
      }
    }
  };

  // Функция для получения куки
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <div className="text-red-500">{error}</div>
        <button 
          onClick={() => window.location.href = '/login'}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (!profile) {
    return <div className="max-w-md mx-auto mt-10 p-6">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Profile</h2>
      <div className="space-y-2">
        <p><strong>ID:</strong> {profile.id}</p>
        <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Role:</strong> {profile.role}</p>
        <p><strong>Subscription:</strong> {profile.subscription}</p>
        <p><strong>Joined:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
        
        {/* Отображение адреса, если он есть */}
        {userAddress && !showAddressForm && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold">Address:</h3>
            <p>{userAddress.address_line}</p>
            <p>{userAddress.city}, {userAddress.country}</p>
            <p>Postal code: {userAddress.postal_code}</p>
          </div>
        )}
      </div>

      {/* Кнопки управления */}
      <div className="mt-6 space-y-3">
        {!showAddressForm ? (
          <button
            onClick={() => setShowAddressForm(true)}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            {userAddress ? 'Edit Address' : 'Add Address'}
          </button>
        ) : (
          <AddressInput 
            userId={profile.id} 
            onCancel={() => setShowAddressForm(false)}
            onSave={() => {
              setShowAddressForm(false);
              fetchUserAddress(profile.id, localStorage.getItem('authToken') || getCookie('auth_token'));
            }}
            initialAddress={userAddress}
          />
        )}

        <button
          onClick={() => {
            localStorage.removeItem('authToken');
            document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            window.location.href = '/login';
          }}
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserProfile;