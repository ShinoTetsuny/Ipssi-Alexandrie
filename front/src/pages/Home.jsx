import React, { useEffect, useState } from 'react';
import { getUserId } from '../security/AuthService';

const Home = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:3000/users/${getUserId()}`)
            .then(response => response.json())
            .then(data => setUser(data))
            .catch(error => console.log(error));
    }, []);

    return (
        <div>
            {user ? (
                <div>
                    <h1>Vous êtes connecté</h1>
                    <p>Nom: {user.name}</p>
                    <p>Email: {user.email}</p>
                    {/* Add more user information here */}
                </div>
            ) : (
                <h1>Loading...</h1>
            )}
        </div>
    );
};

export default Home;