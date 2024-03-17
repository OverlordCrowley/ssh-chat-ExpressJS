const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Friend = sequelize.define('friend', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false }, // ID пользователя
    friendId: { type: DataTypes.INTEGER, allowNull: false }, // ID друга
});

module.exports = Friend;