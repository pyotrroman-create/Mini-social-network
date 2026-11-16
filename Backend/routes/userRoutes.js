const express = require('express');
const router = express.Router();

const {
    getUserProfile,
    updateMyProfile,
    updateAvatar,
    searchUsers
} = require('../controllers/userController');

const authMiddleware = require('../middlewares/authMiddleware');
const uploadImage = require('../middlewares/uploadMiddleware');

router.patch(
    '/me/avatar',
    authMiddleware,
    uploadImage('profileImage'),
    updateAvatar
);

router.patch('/me', authMiddleware, updateMyProfile);

router.get('/search', searchUsers);

router.get('/:id', getUserProfile);

module.exports = router;