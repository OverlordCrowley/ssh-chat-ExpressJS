const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('user', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING, unique: true },
  firstName: { type: DataTypes.STRING, unique: true },
  lastName: { type: DataTypes.STRING, unique: true },
});

module.exports = User;
