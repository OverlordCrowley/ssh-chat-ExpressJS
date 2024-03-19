const sequelize = require('../db');
const { DataTypes } = require('sequelize');


const User = require('./user');
const Friend = require('./friend');
const Block = require('./friendBlocked');


module.exports = {
  User,
  Friend,
  Block
};
