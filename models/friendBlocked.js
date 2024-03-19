const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const BlockedUser = sequelize.define('blockedUser', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    blockedUserId: { type: DataTypes.INTEGER, allowNull: false },
});

module.exports = BlockedUser;