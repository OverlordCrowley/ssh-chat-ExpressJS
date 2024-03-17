const sequelize = require('../db');
const { DataTypes } = require('sequelize');


const User = require('./user');
const Friend = require('./friend');


module.exports = {
  User,
  Friend
};
