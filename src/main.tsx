// main.tsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Login from './components/login/login';

const Main: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const handleLogin = (userId: string) => {
    // Lógica de autenticación (puedes almacenar el estado en localStorage, etc.)
    setLoggedIn(true);
  };

  return (
    <React.StrictMode>
      {loggedIn ? <App /> : <Login onLogin={handleLogin} />}
    </React.StrictMode>
  );
};

ReactDOM.render(<Main />, document.getElementById('root'));

