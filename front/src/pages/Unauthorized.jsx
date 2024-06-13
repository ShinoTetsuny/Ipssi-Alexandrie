import React from 'react';

const Unauthorized = () => {
    return (
        <div style={styles.unauthorizedContainer}>
            <h1 style={styles.rotatingText}>404</h1>
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

    rotatingText: {
        fontSize: '10rem',
        animation: 'rotate 2s infinite linear',
    },
};

export default Unauthorized;