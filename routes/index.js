const Router = require('express');
const router = new Router();
const userRouter = require('./userRouter');
const friendRouter = require('./friendRouter');

router.use('/user', userRouter);
router.use('/friends', friendRouter);

module.exports = router;
