const mongoose = require('mongoose');
const Follow = require('../models/Follow');
const User = require('../models/User');

const followUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isObjectIdOrHexString(userId)) {
            return res.status(400).json({
                message: 'Invalid user ID'
            });
        }

        if (userId === req.user._id.toString()) {
            return res.status(400).json({
                message: 'You cannot follow yourself'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const follow = await Follow.create({
            follower: req.user._id,
            following: userId
        });

        return res.status(201).json({
            message: 'User followed successfully',
            follow
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'You are already following this user'
            });
        }

        console.error('Follow user error:', error);

        return res.status(500).json({
            message: 'Failed to follow user'
        });
    }
};

const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isObjectIdOrHexString(userId)) {
            return res.status(400).json({
                message: 'Invalid user ID'
            });
        }

        const follow = await Follow.findOneAndDelete({
            follower: req.user._id,
            following: userId
        });

        if (!follow) {
            return res.status(404).json({
                message: 'Follow not found'
            });
        }

        return res.status(200).json({
            message: 'User unfollowed successfully'
        });

    } catch (error) {
        console.error('Unfollow user error:', error);

        return res.status(500).json({
            message: 'Failed to unfollow user'
        });
    }
};

const getUserFollowers = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isObjectIdOrHexString(userId)) {
            return res.status(400).json({
                message: 'Invalid user ID'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const followers = await Follow.find({
            following: userId
        }).populate('follower', '-password -email');

        return res.status(200).json({ followers });

    } catch (error) {
        console.error('Get user followers error:', error);

        return res.status(500).json({
            message: 'Failed to get user followers'
        });
    }
};

const getUserFollowing = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isObjectIdOrHexString(userId)) {
            return res.status(400).json({
                message: 'Invalid user ID'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const following = await Follow.find({
            follower: userId
        }).populate('following', '-password -email');

        return res.status(200).json({ following });

    } catch (error) {
        console.error('Get user following error:', error);

        return res.status(500).json({
            message: 'Failed to get user following'
        });
    }
};

module.exports = { followUser, unfollowUser, getUserFollowers, getUserFollowing };
