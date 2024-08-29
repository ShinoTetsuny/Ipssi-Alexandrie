const jwt = require('jsonwebtoken');
const User = require('../models/user'); 

const verifyUser = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        req.user = decoded;

        const user = await User.findById(decoded._id); 
        console.log(user);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.role.includes('ADMIN')) {
            return next();
        }

        if (req.params.id && req.params.id !== decoded._id) {
            return res.status(403).json({ message: 'Unauthorized. Invalid user ID.' });
        }

        next(); 
    } catch (err) {
        res.status(400).json({ message: 'Invalid token or server error.' });
    }
};

const checkAdmin = async (req, res, next) => {
    try {
        // Récupérer le jeton de l'en-tête Authorization
        const token = req.header('Authorization')?.replace('Bearer ', '');

        console.log('Token reçu:', token); // Log pour vérifier le jeton

        // Vérification si le jeton existe
        if (!token) {
            console.log('Accès refusé. Aucun jeton fourni.');
            return res.status(401).json({ message: 'Access Denied. No token provided.' });
        }

        // Vérifier et décoder le jeton
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        // Rechercher l'utilisateur dans la base de données
        const user = await User.findById(decoded._id);

        // Vérifier si l'utilisateur existe
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Vérifier le rôle de l'utilisateur
        if (!user.role.includes('ADMIN')) {
            console.log('Accès refusé. Réservé aux administrateurs.');
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        // Passer au middleware suivant ou au contrôleur
        next();
    } catch (err) {
        console.error('Erreur de vérification du jeton:', err);
        res.status(400).json({ message: 'Invalid token or server error.' });
    }
};
module.exports = {
    verifyUser,
    checkAdmin
};
