import React, { useEffect, useState } from 'react';
import { getToken } from '../security/AuthService';
import FileList from '../components/FileList';
import UserTable from '../components/UserTable';
import '../styles/Dashboard.css'; // Assurez-vous d'importer le fichier CSS

const DashBoard = () => {
    const [users, setUsers] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchUsersData = async () => {
            const token = getToken();

            try {
                const response = await fetch(`http://localhost:3000/users/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setUsers(data);
                console.log(data);
            } catch (error) {
                console.log(error);
            }
        };

        const fetchStats = async () => {
            const token = getToken();

            try {
                const response = await fetch(`http://localhost:3000/files/stats`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setStats(data);
                console.log(data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchUsersData();
        fetchStats();
    }, []);

    return (
        <div className="home-container">
            {users ? (
                <div>
                    {stats && (
                        <div className="stats-container">
                            <h3 className="stats-title">Dashboard Statistics</h3>
                            <div className="stats-details">
                                <p><strong>Total files:</strong> {stats.totalFiles}</p>
                                <p><strong>Files uploaded today:</strong> {stats.filesUploadedToday}</p>
                                <h4>Files per client:</h4>
                                <ul className="stats-list">
                                    {stats.filesPerClient.map((clientStat) => (
                                        <li key={clientStat._id}>
                                            {clientStat._id}: {clientStat.count} files
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    <UserTable users={users} />
                    <FileList clientId={""} onUploadSuccess={""} onDeleteSuccess={""} page='ADMIN' />
                </div>
            ) : (
                <h1>Loading...</h1>
            )}
        </div>
    );
};

export default DashBoard;
