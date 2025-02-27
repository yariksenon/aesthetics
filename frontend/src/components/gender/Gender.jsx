import React from 'react';
import { useParams, Outlet, Navigate } from 'react-router-dom'; 

export const VALID_GENDERS = ['man', 'woman', 'children'];

function GenderRoute() {
  const { gender } = useParams();

  if (!VALID_GENDERS.includes(gender)) {
    return <Navigate to="/404" />;
  }

  return <Outlet />;
}

export default GenderRoute;