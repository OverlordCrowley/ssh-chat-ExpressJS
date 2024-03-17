const {User} = require('../models/index');
const { generateKeyPair, encrypt, decrypt } = require('crypto');
const bcrypt = require('bcryptjs');
const ApiError = require("../error/ApiError");
const {generateAccessToken, generateRefreshToken} = require("../func/auth");
const jwt = require("jsonwebtoken");
class UserController {
  refreshTokens = [];
  constructor() {
    this.refreshTokens = [];
    this.login = this.login.bind(this);
  }
  async register(req, res, next) {

    try {

      const user = await User.create({
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName
      });
      console.log(user)

      res.json({ auth: true, message: 'Пользователь успешно зарегистрирован.' });
    } catch (error) {
      return next(ApiError.internal("Ошибка регистрации пользователя"))
    }

  }

  async login(req, res, next) {
    try {
      const user = await User.findOne({ where: { email: req.body.email } });
      if (!user) {
        return next(ApiError.badRequest('Неверный email или пароль'));
      }

      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) {
        return next(ApiError.badRequest('Неверный email или пароль'));
      }

      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);
      this.refreshTokens.push(refreshToken);


      await new Promise(resolve => setTimeout(resolve, 0));

      res.json({firstName: user.firstName, lastName: user.lastName, email: user.email, accessToken: accessToken,
      refreshToken: refreshToken})
    } catch (error) {
      return next(ApiError.badRequest('Неверный email или пароль'));
    }
  }

  async refresh(req,res, next){
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) return res.status(401).send('Токен не был отправлен.');
    if (!this.refreshTokens.includes(refreshToken)) return res.status(403).send('Невалидный токен.');

    jwt.verify(refreshToken, process.env.SECRET, (err, decoded) => {
      if (err) return res.status(403).send('Невалидный токен.');
      const accessToken = generateAccessToken(decoded.id);
      res.json({ accessToken: accessToken });
    });
  }
}

module.exports = new UserController();