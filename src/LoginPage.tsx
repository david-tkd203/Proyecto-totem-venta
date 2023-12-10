import React, { useState } from 'react';
import Login from './components/login/login';

const LoginPage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);

  const handleLogin = (id: string) => {
    setUserId(id);
  };

  return (
    <div className="login-page">
      {!userId ? <Login onLogin={handleLogin} /> : <p>Bienvenido, Usuario {userId}.</p>}
    </div>
  );
};

export default LoginPage;
