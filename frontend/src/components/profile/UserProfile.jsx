import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      if (!userId || !token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8080/api/v1/profile/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setError('Не удалось загрузить данные профиля');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const renderLoading = () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  const renderError = () => (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-red-500 text-xl">{error || 'Пользователь не найден'}</p>
    </div>
  );

  const renderProfile = () => (
    <div className="container mt-8 mb-8">
      <div className="mx-auto bg-white rounded-xl shadow-lg transition-transform duration-300 hover:shadow-2xl hover:-translate-y-2">
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 mb-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold transition-transform duration-300 hover:scale-110">
              {user.first_name[0]}
              {user.last_name[0]}
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
          <div className="my-4 border-t border-gray-200"></div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Информация о профиле</h2>
            <div className="pl-4">
              <p className="mb-2">
                <strong>Дата регистрации:</strong>{' '}
                {new Date(user.created_at).toLocaleDateString()}
              </p>
              <p className="mb-2">
                <strong>Роль:</strong> {user.role}
              </p>
              <p className="mb-2">
                <strong>Подписка:</strong> {user.subscription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return renderLoading();
  }

  if (error || !user) {
    return renderError();
  }

  return renderProfile();
};

export default Profile;