const { setRefreshTokenCookie } = require('../utils/sharedFunctions');
const { sequelize } = require('../db/models');
const { registration, login, refresh } = require('../services/authService');

class AuthController {
  async registration(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
      const { fullName, email, password } = req.body;
      const authData = await registration(
        fullName,
        email,
        password,
        transaction
      );
      await transaction.commit();
      setRefreshTokenCookie(res, authData.refreshToken);
      res.status(201).json(authData);
    } catch (error) {
      await transaction.rollback();
      console.log('Registration error: ', error.message);
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const authData = await login(email, password);
      setRefreshTokenCookie(res, authData.refreshToken);
      res.status(200).json(authData);
    } catch (error) {
      console.log('Login error: ', error.message);
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      res.clearCookie('refreshToken');
      res.sendStatus(res.statusCode);
    } catch (error) {
      console.log('Logout error: ', error.message);
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const authData = await refresh(refreshToken);
      setRefreshTokenCookie(res, authData.refreshToken);
      res.status(200).json(authData);
    } catch (error) {
      console.log('Refresh error: ', error.message);
      next(error);
    }
  }
}

module.exports = new AuthController();
