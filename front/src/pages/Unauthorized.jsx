import React, { useEffect } from 'react';
import { getToken } from '../security/AuthService';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = getToken(); 

        const timer = setTimeout(() => {
            if (token) {
                navigate('/home'); 
            } else {
                navigate('/'); 
            }
        }, 5000); 

        return () => clearTimeout(timer);
    }, [navigate]);
    
    return (
        <div style={styles.unauthorizedContainer}>
            <h1>404</h1>
        </div>
    );
};

const styles = {
    unauthorizedContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
    },
};

export default Unauthorized;