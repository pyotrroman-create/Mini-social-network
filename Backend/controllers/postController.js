const Post = require('../models/Post');
const mongoose = require('mongoose');
const validateImage = require('../utils/validateImage');
const Like = require('../models/Like');
const Comment = require('../models/Comment');

const createPost = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'Post image is required'
            });
        }


        const { caption } = req.body;

        if (
            typeof caption !== 'string' ||
            caption.trim().length === 0 ||
            caption.trim().length > 2200
        ) {
            return res.status(400).json({
                message: 'Caption is required and must be 1–2200 characters'
            });
        }
        if (!validateImage(req.file)) {
            return res.status(400).json({
                message: 'Invalid image format'
            });
        }

        const imageBase64 = req.file.buffer.toString('base64');

        const post = await Post.create({
            author: req.user._id,
            image: `data:${req.file.mimetype};base64,${imageBase64}`,
            caption: caption?.trim() || ''
        });

        return res.status(201).json({
            message: 'Post created successfully',
            post
        });

    } catch (error) {
        console.error('Create post error:', error);

        return res.status(500).json({
            message: 'Failed to create post'
        });
    }
};

const getPostById = async (req, res) => {
    try {

        if (!mongoose.isObjectIdOrHexString(req.params.id)) {
            return res.status(400).json({
                message: 'Invalid post ID'
            });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: 'Post not found'
            });
        }

        return res.status(200).json({
            post
        });

    } catch (error) {
        console.error('Get post error:', error);

        return res.status(500).json({
            message: 'Failed to get post'
        });
    }
};

const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isObjectIdOrHexString(userId)) {
            return res.status(400).json({
                message: 'Invalid user ID'
            });
        }

        const posts = await Post.find({
            author: userId
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            posts
        });

    } catch (error) {
        console.error('Get user posts error:', error);

        return res.status(500).json({
            message: 'Failed to get user posts'
        });
    }
};

const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            posts
        });

    } catch (error) {
        console.error('Get all posts error:', error);

        return res.status(500).json({
            message: 'Failed to get posts'
        });
    }
};

const updatePost = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isObjectIdOrHexString(id)) {
            return res.status(400).json({
                message: 'Invalid post ID'
            });
        }

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                message: 'Post not found'
            });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'You can only edit your own posts'
            });
        }

        const { caption } = req.body;

        if (caption === undefined && !req.file) {
            return res.status(400).json({
                message: 'Caption or image is required'
            });
        }

        if (caption !== undefined) {
            if (
                typeof caption !== 'string' ||
                caption.trim().length === 0 ||
                caption.trim().length > 2200
            ) {
                return res.status(400).json({
                    message: 'Caption must be a string of up to 2200 characters'
                });
            }

            post.caption = caption.trim();
        }

        if (req.file) {
            if (!validateImage(req.file)) {
                return res.status(400).json({
                    message: 'Invalid image format'
                });
            }

            const imageBase64 = req.file.buffer.toString('base64');

            post.image = `data:${req.file.mimetype};base64,${imageBase64}`;
        }

        await post.save();

        return res.status(200).json({
            message: 'Post updated successfully',
            post
        });

    } catch (error) {
        console.error('Update post error:', error);

        return res.status(500).json({
            message: 'Failed to update post'
        });
    }
};


const deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isObjectIdOrHexString(id)) {
            return res.status(400).json({
                message: 'Invalid post ID'
            });
        }

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                message: 'Post not found'
            });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'You can only delete your own posts'
            });
        }

        await Like.deleteMany({ post: post._id });
        await Comment.deleteMany({ post: post._id });
        await post.deleteOne();

        return res.status(200).json({
            message: 'Post deleted successfully'
        });

    } catch (error) {
        console.error('Delete post error:', error);

        return res.status(500).json({
            message: 'Failed to delete post'
        });
    }
};


const getExplorePosts = async (req, res) => {
    try {
        const count = await Post.countDocuments()

        if (count === 0) {
            return res.status(200).json({ posts: [] })
        }

        const posts = await Post.aggregate([
            { $sample: { size: count } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author',
                },
            },
            { $unwind: '$author' },
            {
                $project: {
                    image: 1,
                    'author._id': 1,
                    'author.username': 1,
                    'author.fullName': 1,
                    'author.profileImage': 1,
                },
            },
        ])

        return res.status(200).json({ posts })
    } catch (error) {
        console.error('Get explore posts error:', error)

        return res.status(500).json({
            message: 'Failed to get explore posts',
        })
    }
}

module.exports = {
    createPost, getPostById, getUserPosts, getAllPosts, updatePost, deletePost, getExplorePosts
};