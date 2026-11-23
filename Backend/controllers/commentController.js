const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Post = require('../models/Post');

const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { text } = req.body;

        if (!mongoose.isObjectIdOrHexString(postId)) {
            return res.status(400).json({
                message: 'Invalid post ID'
            });
        }

        if (typeof text !== 'string' || text.trim().length === 0) {
            return res.status(400).json({
                message: 'Comment text is required'
            });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: 'Post not found'
            });
        }

        const comment = await Comment.create({
            user: req.user._id,
            post: postId,
            text: text.trim()
        });

        return res.status(201).json({
            message: 'Comment added successfully',
            comment
        });

    } catch (error) {
        console.error('Add comment error:', error);

        return res.status(500).json({
            message: 'Failed to add comment'
        });
    }
};

const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!mongoose.isObjectIdOrHexString(postId)) {
            return res.status(400).json({
                message: 'Invalid post ID'
            });
        }


        const comments = await Comment.find({
            post: postId
        })
            .populate('user', 'username profileImage')
            .sort({ createdAt: -1 });
        return res.status(200).json({
            comments
        });

    } catch (error) {
        console.error('Get comments error:', error);

        return res.status(500).json({
            message: 'Failed to get comments'
        });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        if (!mongoose.isObjectIdOrHexString(commentId)) {
            return res.status(400).json({
                message: 'Invalid comment ID'
            });
        }

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                message: 'Comment not found'
            });
        }

        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'You can only delete your own comments'
            });
        }

        await comment.deleteOne();

        return res.status(200).json({
            message: 'Comment deleted successfully'
        });

    } catch (error) {
        console.error('Delete comment error:', error);

        return res.status(500).json({
            message: 'Failed to delete comment'
        });
    }
};

module.exports = { addComment, getPostComments, deleteComment };