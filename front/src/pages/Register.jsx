import React, { useState } from 'react';

const RegisterForm = () => {
    const [email, setEmail] = useState('');
    const [surname, setSurname] = useState('');
    const [firstname, setFirstname] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState('');

    const handleRegister = () => {
        // Appel API pour enregistrer les informations
        // Utilisez les valeurs des états pour envoyer les données au serveur
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        setPasswordStrength(calculatePasswordStrength(newPassword));
    };

    const calculatePasswordStrength = (password) => {
        // Logique pour calculer la force de sécurité du mot de passe
        // Retourne un score de sécurité basé sur des critères tels que la longueur, les caractères spéciaux, les chiffres, etc.
    };

    return (
        <form>
            <label>Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

            <label>Surname:</label>
            <input type="text" value={surname} onChange={(e) => setSurname(e.target.value)} />

            <label>Firstname:</label>
            <input type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} />

            <label>Phone Number:</label>
            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />

            <label>Password:</label>
            <input type="password" value={password} onChange={handlePasswordChange} />

            <label>Confirm Password:</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

            <div>Password Strength: {passwordStrength}</div>

            <button type="button" onClick={handleRegister}>Register</button>
        </form>
    );
};

export default RegisterForm;