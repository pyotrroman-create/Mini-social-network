const express = require('express');
const router = express.Router();
const { addLike, removeLike, getPostLikes } = require('../controllers/likeController');
const { addComment, getPostComments } = require('../controllers/commentController');

const {
    createPost,
    getPostById,
    getUserPosts,
    getAllPosts,
    updatePost,
    deletePost,
    getExplorePosts
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

router.get('/explore', getExplorePosts);

router.get('/:id', getPostById);

router.post('/:postId/likes', authMiddleware, addLike);
router.delete('/:postId/likes', authMiddleware, removeLike);
router.get('/:postId/likes', getPostLikes);
router.post('/:postId/comments', authMiddleware, addComment);
router.get('/:postId/comments', getPostComments);

module.exports = router;