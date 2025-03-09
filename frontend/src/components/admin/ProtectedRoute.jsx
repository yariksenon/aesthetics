import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const userRole = localStorage.getItem('role');

  if (userRole === 'admin') {
    return children; // Разрешаем доступ
  }

  return <Navigate to="/" />;
};

export default ProtectedRoute;
