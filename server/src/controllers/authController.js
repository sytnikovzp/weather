const { setRefreshTokenCookie } = require('../utils/sharedFunctions');
const { sequelize } = require('../db/models');
const {
  registration,
  login,
  refresh,
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
} = require('../services/authService');

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

  async getAllUsers(req, res, next) {
    try {
      const users = await getAllUsers();
      if (users.length > 0) {
        res.status(200).json(users);
      } else {
        res.status(401);
      }
    } catch (error) {
      console.log('Get all users error: ', error.message);
      next(error);
    }
  }

  async getCurrentUserProfile(req, res, next) {
    try {
      const userEmail = req.user.email;
      const user = await getUserByEmail(userEmail);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(401);
      }
    } catch (error) {
      console.log('Get user profile error: ', error.message);
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await getUserById(id);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(401);
      }
    } catch (error) {
      console.log('Get user error: ', error.message);
      next(error);
    }
  }

  async updateUser(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
      const { id, fullName, email, password } = req.body;
      const userData = await updateUser(
        id,
        fullName,
        email,
        password,
        transaction
      );
      await transaction.commit();
      res.status(201).json(userData);
    } catch (error) {
      await transaction.rollback();
      console.log('Update user error: ', error.message);
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      await deleteUser(id, transaction);
      await transaction.commit();
      res.sendStatus(res.statusCode);
    } catch (error) {
      await transaction.rollback();
      console.log('Delete user error: ', error.message);
      next(error);
    }
  }
}

module.exports = new AuthController();
