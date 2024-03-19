const { User, Friend, Block } = require('../models'); // Подключаем модели пользователей и друзей
const jwt = require('jsonwebtoken');
const ApiError = require('../error/ApiError');
const {logger} = require("sequelize/lib/utils/logger");

class FriendController {
    async addFriend(req, res, next) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const { id } = jwt.verify(token, process.env.SECRET);

            const { email } = req.body;
            const friend = await User.findOne({ where: { email } });
            if (!friend) {
                return next(ApiError.badRequest('Пользователь с таким email не найден'));
            }

            const isBlocked = await Block.findOne({ where: { userId: friend.id, blockedUserId: id } });
            if (isBlocked) {
                return next(ApiError.badRequest('Вы не можете добавить заблокированного пользователя в друзья'));
            }

            const alreadyFriend = await Friend.findOne({ where: { userId: id, friendId: friend.id } });
            if (alreadyFriend) {
                return next(ApiError.badRequest('Пользователь уже является вашим другом'));
            }

            await Friend.create({ userId: id, friendId: friend.id });

            res.json({ success: true, message: 'Пользователь успешно добавлен в друзья' });
        } catch (error) {
            next(ApiError.internal('Ошибка при добавлении друга'));
        }
    }

    async removeFriend(req, res, next) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const { id } = jwt.verify(token, process.env.SECRET);

            const { email } = req.body;
            const friend = await User.findOne({ where: { email } });
            if (!friend) {
                return next(ApiError.badRequest('Пользователь с таким email не найден'));
            }

            await Friend.destroy({ where: { userId: id, friendId: friend.id } });

            res.json({ success: true, message: 'Пользователь успешно удален из друзей' });
        } catch (error) {
            next(ApiError.internal('Ошибка при удалении друга'));
        }
    }

    async blockUser(req, res, next) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const { id } = jwt.verify(token, process.env.SECRET);

            const { email } = req.body;
            const userToBlock = await User.findOne({ where: { email } });
            if (!userToBlock) {
                return next(ApiError.badRequest('Пользователь с таким email не найден'));
            }

            // console.log(userToBlock.id)
            await Friend.destroy({ where: { userId: id, friendId: userToBlock.id } });

            const isAlreadyBlocked = await Block.findOne({ where: { userId: id, blockedUserId: userToBlock.id } });
            if (isAlreadyBlocked) {
                return next(ApiError.badRequest('Пользователь уже заблокирован'));
            }

            await Block.create({ userId: id, blockedUserId: userToBlock.id });

            res.json({ success: true, message: 'Пользователь успешно заблокирован' });
        } catch (error) {
            next(ApiError.internal('Ошибка при блокировке пользователя'));
        }
    }

    async getFriends(req, res, next) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const { id } = jwt.verify(token, process.env.SECRET);

            const friendsAddedToUser = await Friend.findAll({ where: { friendId: id } });
            const friendIdsAddedToUser = friendsAddedToUser.map(friend => friend.userId);

            const friendsOfUser = await Friend.findAll({ where: { userId: id } });
            const friendIdsOfUser = friendsOfUser.map(friend => friend.friendId);

            const allFriendIds = [...friendIdsAddedToUser, ...friendIdsOfUser];

            const friendsInfo = await User.findAll({ where: { id: allFriendIds } });
            res.json(friendsInfo);
        } catch (error) {
            next(ApiError.internal('Ошибка при получении списка друзей'));
        }
    }
}

module.exports = new FriendController();
