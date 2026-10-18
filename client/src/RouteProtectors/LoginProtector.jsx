import { useEffect } from 'react';

const LoginProtector = ({ children }) => {
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType === 'customer') {
      window.location.href = '/home';
    } else if (userType === 'admin') {
      window.location.href = '/admin';
    }
  }, []);

  return children;
};

export default LoginProtector;
