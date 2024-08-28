import React, { useEffect, useState } from 'react';
import { getToken, getUserId } from '../security/AuthService'; // Assurez-vous d'avoir getToken
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';

const Home = () => {
    const [user, setUser] = useState(null);
    const handleUploadSuccess = (file) => {
        console.log('File uploaded successfully:', file);
        // Perform additional actions, such as updating the file list or notifying the user
      };

    useEffect(() => {
        const fetchUserData = async () => {
            const token = getToken(); // Récupère le token d'authentification
            const userId = getUserId(); // Récupère l'ID de l'utilisateur
            
            try {
                const response = await fetch(`http://localhost:3000/users/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`, // Inclut le token dans l'en-tête Authorization
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchUserData();
    }, []); // Dépendances vide : exécute uniquement au montage du composant

    return (
        <div>
            {user ? (
                <div>
                    <h1>Vous êtes connecté</h1>
                    <p>Nom: {user.name}</p>
                    <p>Email: {user.email}</p>
                    {/* Ajoutez plus d'informations sur l'utilisateur ici */}
                    <FileUpload clientId={user._id} onUploadSuccess={handleUploadSuccess} />
                    <FileList clientId={user._id} />
                </div>
            ) : (
                <h1>Loading...</h1>
            )}
        </div>
    );
};

export default Home;