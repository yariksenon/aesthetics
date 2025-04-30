import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = 'admin' }) => {
  // Получаем данные пользователя из localStorage
  const userData = localStorage.getItem('userData');
  
  try {
    // Пытаемся распарсить JSON
    const parsedUserData = userData ? JSON.parse(userData) : null;
    
    // Проверяем роль пользователя
    if (parsedUserData?.role === requiredRole) {
      return children; // Разрешаем доступ
    }
    
    // Перенаправляем на главную, если роль не подходит
    return <Navigate to="/" replace />;
    
  } catch (error) {
    console.error('Error parsing user data:', error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;