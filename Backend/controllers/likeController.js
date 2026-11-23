const mongoose = require('mongoose');
const Like = require('../models/Like');
const Post = require('../models/Post');

const addLike = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!mongoose.isObjectIdOrHexString(postId)) {
            return res.status(400).json({
                message: 'Invalid post ID'
            });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: 'Post not found'
            });
        }

        const like = await Like.create({
            user: req.user._id,
            post: postId
        });

        return res.status(201).json({
            message: 'Post liked successfully',
            like
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'You have already liked this post'
            });
        }

        console.error('Add like error:', error);

        return res.status(500).json({
            message: 'Failed to add like'
        });
    }
};

const removeLike = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!mongoose.isObjectIdOrHexString(postId)) {
            return res.status(400).json({
                message: 'Invalid post ID'
            });
        }

        const deletedLike = await Like.findOneAndDelete({
            user: req.user._id,
            post: postId
        });

        if (!deletedLike) {
            return res.status(404).json({
                message: 'Like not found'
            });
        }

        return res.status(200).json({
            message: 'Like removed successfully'
        });

    } catch (error) {
        console.error('Remove like error:', error);

        return res.status(500).json({
            message: 'Failed to remove like'
        });
    }
};

const getPostLikes = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!mongoose.isObjectIdOrHexString(postId)) {
            return res.status(400).json({
                message: 'Invalid post ID'
            });
        }

        const likesCount = await Like.countDocuments({
            post: postId
        });

        return res.status(200).json({
            likesCount
        });

    } catch (error) {
        console.error('Get post likes error:', error);

        return res.status(500).json({
            message: 'Failed to get post likes'
        });
    }
};

const getMyLikedPosts = async (req, res) => {
    try {
        const likes = await Like.find({
            user: req.user._id,
        }).select('post')

        return res.status(200).json({
            postIds: likes.map((like) => String(like.post)),
        })
    } catch (error) {
        console.error('Get my likes error:', error)

        return res.status(500).json({
            message: 'Failed to get liked posts',
        })
    }
}

module.exports = { addLike, removeLike, getPostLikes, getMyLikedPosts };