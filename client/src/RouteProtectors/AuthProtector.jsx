import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthProtector = ({ children }) => {
  const userType = localStorage.getItem('userType');
  if (!userType) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AuthProtector;
