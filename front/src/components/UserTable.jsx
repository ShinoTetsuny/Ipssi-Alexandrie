// UserTable.js
import React from 'react';
import '../styles/components/UserTable.css'; // Assurez-vous d'ajouter un fichier CSS pour le style
import '../styles/components/StoragesBar.css'; // Assurez-vous d'ajouter un fichier CSS pour le style

const StorageBar = ({ totalStorage, remainingStorage }) => {
    const usedStorage = totalStorage - remainingStorage;
    const remainingPercentage = (remainingStorage / totalStorage) * 100;
    const usedPercentage = (usedStorage / totalStorage) * 100;

    const formatStorage = (bytes) => {
        return (bytes / (1024 * 1024 * 1024)).toFixed(2); // Convert to GB and format
    };

    return (
        <div className="storage-bar-container">
            <div className="storage-info">
                <span>Espace restant: {formatStorage(remainingStorage)} GB</span>
                <span>Total: {formatStorage(totalStorage)} GB</span>
            </div>
            <div className="storage-bar">
                <div
                    className="storage-bar-used"
                    style={{ width: `${usedPercentage}%` }}
                />
                <div
                    className="storage-bar-remaining"
                    style={{ width: `${remainingPercentage}%` }}
                />
            </div>
        </div>
    );
};

const UserTable = ({ users }) => {
    return (
        <div className="user-table-container">
            <h2>Liste des Utilisateurs</h2>
            <table className="user-table">
                <thead>
                    <tr>
                        <th>Prénom</th>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Adresse</th>
                        <th>Stockage</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user.firstname}</td>
                            <td>{user.lastname}</td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td>{user.address}</td>
                            <td>
                                <StorageBar
                                    totalStorage={user.stockageTotal}
                                    remainingStorage={user.stockageLeft}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;

