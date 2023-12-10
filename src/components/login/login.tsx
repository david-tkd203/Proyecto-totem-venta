import React, { useState } from 'react';
import axios from 'axios';
import './login.css';

const Login: React.FC<{ onLogin: (userId: string) => void }> = ({ onLogin }) => {
  const [idCliente, setIdCliente] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        id_cliente: idCliente,
        nombre: nombre,
      });

      if (response.data.success) {
        onLogin(response.data.user_id);
      } else {
        setError('Credenciales incorrectas. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error al realizar el inicio de sesión:', error);
      setError('Error al iniciar sesión. Inténtalo de nuevo más tarde.');
    }
  };

  return (
    <div className="login-container">
      <h1>Iniciar Sesión</h1>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin}>
        <label>
          ID Cliente:
          <input type="text" value={idCliente} onChange={(e) => setIdCliente(e.target.value)} />
        </label>
        <label>
          Nombre:
          <input type="password" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </label>
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
};

export default Login;
