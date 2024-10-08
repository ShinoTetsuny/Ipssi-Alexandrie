import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';

const SECRET_KEY = '123456789';

export const getToken = () => {
    return Cookies.get('Alexandrie');
};

export const setToken = (token) => {
    Cookies.set('Alexandrie', token, { expires: 7 });
};

export const removeToken = () => {
    Cookies.remove('Alexandrie');
};

export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        return true;
    } catch (error) {
        console.log("catch");
        console.log(error); // Log the error
        return false;
    }
};

export const hasRole = (roles) => {
    const token = getToken();
    if (!token) return false;

    // Si `roles` n'est pas un tableau, le convertir en tableau
    if (!Array.isArray(roles)) {
        roles = [roles];
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        // Vérifie la propriété 'role' et non 'roles'
        if (decoded && decoded.role) {
            return roles.some(role => decoded.role.includes(role));
        }
        return false;
    } catch (error) {
        console.log(error); // Log the error
        return false;
    }
};


export const getUserId = () => {
    const token = getToken();
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        if (decoded && decoded._id) {
            return decoded._id;
        }
        return null;
    } catch (error) {
        console.log(error); // Log the error
        return null;
    }
};
