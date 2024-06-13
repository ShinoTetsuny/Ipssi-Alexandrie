import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { setToken } from '../security/AuthService';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
    
            if (response.ok) {
                const data = await response.json();
                const token = data.token;
                console.log("reponseOK")
                setToken(token) // Le cookie expirera après 7 jours
                // Connexion réussie, effectuez les actions nécessaires ici
                console.log("afterToken")
                navigate('/home'); // Redirige vers la page d'accueil
            } else {
                // Gestion des erreurs de connexion ici
            }
        } catch (error) {
            // Gestion des erreurs de connexion ici
        }
    };

    return (
        <div>
            <h1>Page de connexion</h1>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Se connecter</button>

            <Link to="/register">S'inscrire</Link> {/* Bouton pour naviguer vers la page d'inscription */}
        </div>
    );
};

export default Login;