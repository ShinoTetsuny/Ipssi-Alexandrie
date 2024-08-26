const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Assurez-vous que vous avez un modèle User

// Middleware de vérification du token et de l'ID de l'utilisateur
const verifyUser = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Décrypte le token avec la clé secrète
        req.user = decoded;
        console.log(decoded);

        if (req.params._id && req.params._id !== decoded._id) {
            return res.status(403).json({ message: 'Unauthorized. Invalid user ID.' });
        }

        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

// Middleware pour vérifier le rôle d'administrateur avec vérification du token
const checkAdmin = async (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Décrypte le token avec la clé secrète
        req.user = decoded;

        const user = await User.findById(decoded._id); // Cherche l'utilisateur dans la base de données avec son ID

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (!user.role.includes('ADMIN')) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        next(); // L'utilisateur est un admin, passez à la suite
    } catch (err) {
        res.status(400).json({ message: 'Invalid token or server error.' });
    }
};

module.exports = {
    verifyUser,
    checkAdmin
};
