const mongoose = require('mongoose');
const User = require('../models/User');
const validateImage = require('../utils/validateImage');

const getMe = async (req, res) => {
    try {
        const user = req.user;

        return res.status(200).json({
            user: {
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                bio: user.bio,
                website: user.website,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);

        return res.status(500).json({
            message: 'Failed to retrieve current user'
        });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isObjectIdOrHexString(id)) {
            return res.status(400).json({
                message: 'Invalid user ID'
            });
        }

        const user = await User.findById(id).select('-password -email');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        return res.status(200).json({
            user
        });
    } catch (error) {
        console.error('Get user profile error:', error);

        return res.status(500).json({
            message: 'Failed to retrieve user profile'
        });
    }
};


const updateMyProfile = async (req, res) => {
    try {
        const { username, website, bio } = req.body;

        if (
            username === undefined &&
            website === undefined &&
            bio === undefined
        ) {
            return res.status(400).json({
                message: 'No profile fields provided'
            });
        }

        const user = req.user;

        if (username !== undefined) {
            if (
                typeof username !== 'string' ||
                !/^[a-zA-Z0-9._]{1,30}$/.test(username.trim())
            ) {
                return res.status(400).json({
                    message: 'Username must contain 1–30 letters, numbers, dots or underscores'
                });
            }

            user.username = username.trim().toLowerCase();
        }

        if (website !== undefined) {
            if (typeof website !== 'string' || website.trim().length > 2048) {
                return res.status(400).json({
                    message: 'Invalid website'
                });
            }

            const value = website.trim();

            if (value) {
                try {
                    const url = new URL(value);

                    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.')) {
                        throw new Error('Invalid URL');
                    }
                } catch {
                    return res.status(400).json({
                        message: 'Website must be a valid http or https URL'
                    });
                }
            }

            user.website = value;
        }

        if (bio !== undefined) {
            if (
                typeof bio !== 'string' ||
                bio.trim().length > 150
            ) {
                return res.status(400).json({
                    message: 'Bio must be a string of up to 150 characters'
                });
            }

            user.bio = bio.trim();
        }

        await user.save();

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                bio: user.bio,
                website: user.website,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        if (error.code === 11000 && error.keyPattern?.username) {
            return res.status(409).json({
                message: 'Username is already taken'
            });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: error.message
            });
        }

        console.error('Update profile error:', error);

        return res.status(500).json({
            message: 'Failed to update profile'
        });
    }
};


const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'Profile image is required'
            });
        }

        if (!validateImage(req.file)) {
            return res.status(400).json({
                message: 'Invalid image format'
            });
        }

        const imageBase64 = req.file.buffer.toString('base64');

        req.user.profileImage =
            `data:${req.file.mimetype};base64,${imageBase64}`;

        await req.user.save();

        return res.status(200).json({
            message: 'Avatar updated successfully',
            profileImage: req.user.profileImage
        });
    } catch (error) {
        console.error('Update avatar error:', error);

        return res.status(500).json({
            message: 'Failed to update avatar'
        });
    }
};

const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;

        if (typeof q !== 'string' || !q.trim()) {
            return res.status(400).json({
                message: 'Search query is required'
            });
        }

        const search = q
            .trim()
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const users = await User.find({
            username: {
                $regex: search,
                $options: 'i'
            }
        }).select('-password -email');

        return res.status(200).json({ users });
    } catch (error) {
        console.error('Search users error:', error);

        return res.status(500).json({
            message: 'Failed to search users'
        });
    }
};

module.exports = {
    getMe,
    getUserProfile,
    updateMyProfile,
    updateAvatar,
    searchUsers
};