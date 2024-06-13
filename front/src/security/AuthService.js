import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'secretKey';

export const getToken = () => {
    return Cookies.get('Alexandrie');
};

export const setToken = (token) => {
    Cookies.set('Alexandrie', token, { expires: 7 });
    console.log("setToken");
};

export const removeToken = () => {
    Cookies.remove('Alexandrie');
};

export const isAuthenticated = () => {
    console.log(typeof SECRET_KEY); // Should log 'string'
    console.log("isAuthenticated");
    const token = getToken();
    console.log(token);
    if (!token) return false;

    try {
        console.log("try");
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log("qsdqsdqdqdsqd",decoded); // Log the decoded token
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

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        if (decoded && decoded.roles) {
            return roles.some(role => decoded.roles.includes(role));
        }
        return false;
    } catch (error) {
        console.log(error); // Log the error
        return false;
    }
};
