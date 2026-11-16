const express = require('express');
const router = express.Router();
const { followUser, unfollowUser, getUserFollowers, getUserFollowing } = require('../controllers/followController');

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

router.post('/:userId/follow', authMiddleware, followUser);

router.delete('/:userId/follow', authMiddleware, unfollowUser);

router.get('/:userId/followers', getUserFollowers);

router.get('/:userId/following', getUserFollowing);

router.get('/:id', getUserProfile);

module.exports = router;