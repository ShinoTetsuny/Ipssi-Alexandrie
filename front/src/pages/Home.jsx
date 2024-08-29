import React, { useEffect, useState } from 'react';
import { getToken, getUserId, hasRole } from '../security/AuthService';
import FileList from '../components/FileList';
import Storage from '../components/Storage';
import PaymentModal from '../components/PaymentModal';
import '../styles/Home.css';

const Home = () => {
    const [user, setUser] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const handleUploadSuccess = (file) => {
        console.log('File uploaded successfully:', file);
    };

    const handleDeleteSuccess = (file) => {
        console.log('File deleted successfully:', file);
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const token = getToken();
            const userId = getUserId();

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
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    const handleBuyStorage = () => {
        setShowPaymentModal(true);
    };

    const handleDeleteAccount = async () => {
        const userId = getUserId();
        const token = getToken();
        if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
            try {
                const response = await fetch(`http://localhost:3000/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    alert('Compte supprimé avec succès');
                    handleLogout();
                } else {
                    alert('Échec de la suppression du compte');
                }
            } catch (error) {
                console.error('Erreur lors de la suppression du compte:', error);
                alert('Erreur lors de la suppression du compte');
            }
        }
    };

    return (
        <div className="home-container">
            {user ? (
                <div>
                    <div className="header">
                        <h1>Vous êtes connecté</h1>
                        <div className="header-buttons">
                            <button onClick={handleBuyStorage}>Acheter de l'espace de stockage</button>
                            {hasRole('ADMIN') && <button onClick={() => window.location.href = '/dashboard'}>Back Office</button>}
                            <button onClick={handleLogout}>Déconnexion</button>
                        </div>
                    </div>
                    <div className="user-info">
                        <p>Nom: {user.firstname} {user.lastname}</p>
                        <p>Email: {user.email}</p>
                        <p>Téléphone: {user.phone}</p>
                        <p>Adresse: {user.address}</p>
                    </div>
                    <div className="storage-info">
                        <Storage totalStorage={user.stockageTotal} remainingStorage={user.stockageLeft} />
                    </div>
                    <button className="delete-account" onClick={handleDeleteAccount}>Supprimer le compte</button>
                    <FileList clientId={user._id} onUploadSuccess={handleUploadSuccess} onDeleteSuccess={handleDeleteSuccess} page='HOME' />
                </div>
            ) : (
                <h1>Loading...</h1>
            )}
            {showPaymentModal && <PaymentModal user={user} onClose={() => setShowPaymentModal(false)} />}
        </div>
    );
};

export default Home;
