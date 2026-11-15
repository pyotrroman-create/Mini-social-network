const express = require('express');
const router = express.Router();

const {
    getUserProfile,
    updateMyProfile,
    updateAvatar
} = require('../controllers/userController');

const authMiddleware = require('../middlewares/authMiddleware');
const uploadAvatar = require('../middlewares/uploadMiddleware');

router.patch('/me/avatar', authMiddleware, uploadAvatar, updateAvatar);

router.patch('/me', authMiddleware, updateMyProfile);

router.get('/:id', getUserProfile);

module.exports = router;