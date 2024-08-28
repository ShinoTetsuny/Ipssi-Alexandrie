import React, { useEffect, useState } from 'react';
import { getToken, getUserId } from '../security/AuthService'; // Assurez-vous d'avoir getToken
import FileList from '../components/FileList';
import Storage from '../components/Storage';
import '../styles/Home.css';

const Home = () => {
    const [user, setUser] = useState(null);
    const handleUploadSuccess = (file) => {
        console.log('File uploaded successfully:', file);
        // Perform additional actions, such as updating the file list or notifying the user
      };
    const handleDeleteSuccess = (file) => {
        console.log('File deleted successfully:', file);
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
                        'Authorization': `Bearer ${token}`,
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
        <div className="home-container">
        {user ? (
            <div>
            <h1>Vous êtes connecté</h1>
            <div className="user-info">
                <p>Nom: {user.firstname} {user.lastname}</p>
                <p>Email: {user.email}</p>
            </div>
            <div className="storage-info">
                <Storage totalStorage={user.stockageTotal} remainingStorage={user.stockageLeft} />
            </div>
            <FileList clientId={user._id} onUploadSuccess={handleUploadSuccess} onDeleteSuccess={handleDeleteSuccess} page='HOME' />
            </div>
        ) : (
            <h1>Loading...</h1>
        )}
        </div>
    );
};

export default Home;