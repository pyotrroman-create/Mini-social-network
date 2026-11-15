const mongoose = require('mongoose');
const User = require('../models/User');

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
        const { fullName, bio } = req.body;

        if (fullName === undefined && bio === undefined) {
            return res.status(400).json({
                message: 'No profile fields provided'
            });
        }

        const user = req.user;

        if (fullName !== undefined) {
            if (typeof fullName !== 'string' || !fullName.trim()) {
                return res.status(400).json({
                    message: 'Full name must be a non-empty string'
                });
            }

            user.fullName = fullName.trim();
        }

        if (bio !== undefined) {
            if (typeof bio !== 'string' || bio.trim().length > 500) {
                return res.status(400).json({
                    message: 'Bio must be a string of up to 500 characters'
                });
            }

            user.bio = bio.trim();
        }

        await user.save();

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                username: user.username,
                fullName: user.fullName,
                bio: user.bio,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
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

        const imageSignatures = {
            'image/jpeg': (buffer) =>
                buffer.length >= 3 &&
                buffer.subarray(0, 3).equals(
                    Buffer.from([0xFF, 0xD8, 0xFF])
                ),

            'image/png': (buffer) =>
                buffer.length >= 8 &&
                buffer.subarray(0, 8).equals(
                    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
                ),

            'image/webp': (buffer) =>
                buffer.length >= 12 &&
                buffer.toString('ascii', 0, 4) === 'RIFF' &&
                buffer.toString('ascii', 8, 12) === 'WEBP'
        };

        const isValidImage = imageSignatures[req.file.mimetype];

        if (!isValidImage || !isValidImage(req.file.buffer)) {
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

module.exports = { getUserProfile, updateMyProfile, updateAvatar };