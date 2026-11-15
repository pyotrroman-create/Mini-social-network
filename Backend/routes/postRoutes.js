const express = require('express');
const router = express.Router();

const {
    createPost,
    getPostById,
    getUserPosts,
    getAllPosts,
    updatePost,
    deletePost
} = require('../controllers/postController');

const authMiddleware = require('../middlewares/authMiddleware');
const uploadImage = require('../middlewares/uploadMiddleware');

router.post(
    '/',
    authMiddleware,
    uploadImage('image'),
    createPost
);

router.patch(
    '/:id',
    authMiddleware,
    uploadImage('image'),
    updatePost
);

router.delete('/:id', authMiddleware, deletePost);

router.get('/', getAllPosts);

router.get('/user/:userId', getUserPosts);

router.get('/:id', getPostById);

module.exports = router;