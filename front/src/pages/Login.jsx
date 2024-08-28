import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { setToken } from '../security/AuthService';
import '../styles/LoginPage.css'; // Assurez-vous de créer et d'importer ce fichier CSS pour le style

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token;
        setToken(token); // Le cookie expirera après 7 jours
        navigate('/home'); // Redirige vers la page d'accueil
      } else {
        setMessage('Email ou mot de passe incorrect.');
      }
    } catch (error) {
      setMessage('Une erreur s\'est produite lors de la connexion.');
    }
  };

  return (
    <div className="login-container">
      <form className="form" onSubmit={(e) => e.preventDefault()}>
        <h2>Page de connexion</h2>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <label>Mot de passe:</label>
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        <button type="button" onClick={handleLogin}>Se connecter</button>
        {message && <div className="message">{message}</div>}
        <div className="register-link">
          <Link to="/register">Pas encore inscrit ? Créez un compte</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
