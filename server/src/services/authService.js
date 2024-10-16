const bcrypt = require('bcrypt');
// ==============================================================
const { User, Token } = require('../db/models');
// ==============================================================
const {
  HASH: { SALT_ROUNDS },
} = require('../constants');
const { emailToLowerCase } = require('../utils/sharedFunctions');
// ==============================================================
const {
  generateTokens,
  saveToken,
  deleteToken,
  validateRefreshToken,
  findToken,
} = require('./tokenService');
// ==============================================================
const { unAuthorizedError } = require('../errors/authErrors');
const { badRequest } = require('../errors/customErrors');

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

class AuthService {
  async registration(fullName, email, password, transaction) {
    const emailToLower = emailToLowerCase(email);
    const person = await User.findOne({ where: { email: emailToLower } });
    if (person) throw badRequest('This user already exists');
    const hashedPassword = await hashPassword(password);
    const user = await User.create(
      {
        fullName,
        email: emailToLower,
        password: hashedPassword,
      },
      { transaction }
    );
    const tokens = generateTokens({ email });
    const userId = user.id;
    await saveToken(userId, tokens.refreshToken, transaction);
    return {
      ...tokens,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
    };
  }

  async login(email, password, transaction) {
    const emailToLower = emailToLowerCase(email);
    const user = await User.findOne({ where: { email: emailToLower } });
    if (!user) throw unAuthorizedError();
    const isPassRight = await bcrypt.compare(password, user.password);
    if (!isPassRight) throw unAuthorizedError();
    const tokens = generateTokens({ email });
    await saveToken(user.id, tokens.refreshToken, transaction);
    return {
      ...tokens,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: emailToLower,
      },
    };
  }

  async logout(refreshToken, transaction) {
    if (!refreshToken) throw unAuthorizedError();
    const token = await deleteToken(refreshToken, transaction);
    return token;
  }

  async refresh(refreshToken, transaction) {
    if (!refreshToken) throw unAuthorizedError();
    const data = validateRefreshToken(refreshToken);
    const dbToken = await findToken(refreshToken);
    if (!data || !dbToken) throw unAuthorizedError();
    const { email } = data;
    const emailToLower = emailToLowerCase(email);
    const user = await User.findOne({ where: { email: emailToLower } });
    const tokens = generateTokens({ email: emailToLower });
    await saveToken(user.id, tokens.refreshToken, transaction);
    return {
      ...tokens,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: emailToLower,
      },
    };
  }

  async getAllUsers() {
    const users = await User.findAll();
    if (users.length === 0) {
      throw badRequest('Users not found');
    }
    return users;
  }

  async getUserById(id) {
    const user = await User.findByPk(id);
    if (!user) {
      throw badRequest('User not found');
    }
    return user;
  }

  async getUserByEmail(email) {
    const emailToLower = emailToLowerCase(email);
    const user = await User.findOne({ where: { email: emailToLower } });
    if (!user) {
      throw badRequest('User not found');
    }
    return user;
  }

  async updateUser(id, fullName, email, password, transaction) {
    const user = await User.findOne({ where: { id } });
    if (!user) {
      throw badRequest('User not found');
    }
    const updateData = { fullName };
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const newEmail = emailToLowerCase(email);
      const person = await User.findOne({ where: { email: newEmail } });
      if (person) throw badRequest('This email is already used');
      updateData.email = newEmail;
      const token = await Token.findOne({ where: { userId: id } });
      await deleteToken(token.refreshToken, transaction);
    }
    if (password) {
      const hashedPassword = await hashPassword(password);
      updateData.password = hashedPassword;
    }
    const [affectedRows, [updatedUser]] = await User.update(updateData, {
      where: { id },
      returning: true,
      transaction,
    });
    if (affectedRows === 0) {
      throw badRequest('User not found');
    }
    return {
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
      },
    };
  }

  async deleteUser(id, transaction) {
    const user = await User.findByPk(id);
    if (!user) {
      throw badRequest('User not found');
    }
    const delUser = await User.destroy({ where: { id }, transaction });
    return delUser;
  }
}

module.exports = new AuthService();
