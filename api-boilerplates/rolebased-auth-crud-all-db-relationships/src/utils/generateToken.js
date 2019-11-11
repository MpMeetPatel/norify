import jwt from 'jsonwebtoken';

const generateUserToken = userId => {
    return jwt.sign({ id: userId }, process.env.SECRET, {
        expiresIn: '7d'
    });
};

export { generateUserToken };
