const jwt = require('jsonwebtoken');

const secretKey = process.env.SECRET;

function generateAccessToken(userId) {
    return jwt.sign({ id: userId }, secretKey, { expiresIn: '60m' });
}

function generateRefreshToken(userId) {
    return jwt.sign({ id: userId }, secretKey);
}

function verifyAccessToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).send('Токен не был загружен.');

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return res.status(403).send('Недействительный токен.');
        req.userId = decoded.id;
        next();
    });
}

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken };