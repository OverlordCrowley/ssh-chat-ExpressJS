const Router = require('express')
const router = new Router()
const friendController = require('../controllers/FriendController')
const authMiddleware = require('../func/auth')

router.post('/getFriends', authMiddleware.verifyAccessToken , friendController.getFriends)
router.post('/addToFriends', authMiddleware.verifyAccessToken , friendController.addFriend)
router.post('/removeFromFriends', authMiddleware.verifyAccessToken , friendController.removeFriend)
router.post('/blockFriend', authMiddleware.verifyAccessToken , friendController.blockUser)

module.exports = router
