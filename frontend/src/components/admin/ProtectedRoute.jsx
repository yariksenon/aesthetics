import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Получаем данные пользователя из localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  // Проверяем, есть ли пользователь и является ли он администратором
  if (user && user.role === 'admin') {
    return children; // Разрешаем доступ
  }

  // Если пользователь не администратор, перенаправляем на главную страницу или страницу 404
  return <Navigate to="/" />;
};

export default ProtectedRoute;