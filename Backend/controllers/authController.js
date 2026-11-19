const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { email, fullName, username, password } = req.body;

        if (
            typeof email !== 'string' ||
            typeof fullName !== 'string' ||
            typeof username !== 'string' ||
            typeof password !== 'string'
        ) {
            return res.status(400).json({
                message: 'All fields must be strings'
            });
        }

        if (
            !email.trim() ||
            !fullName.trim() ||
            !username.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters long'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                message: 'Invalid email format'
            });
        }
        const normalizedUsername = username.trim();

        const existingUser = await User.findOne({
            $or: [
                { email: normalizedEmail },
                { username: normalizedUsername }
            ]
        });

        if (existingUser) {
            if (existingUser.username === normalizedUsername) {
                return res.status(409).json({
                    field: 'username',
                    message: 'This username is already taken.'
                });
            }

            return res.status(409).json({
                field: 'email',
                message: 'This email is already registered.'
            });
        }

        const newUser = new User({
            email: normalizedEmail,
            fullName: fullName.trim(),
            username: normalizedUsername,
            password
        });

        await newUser.save();

        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
                username: newUser.username
            }
        });

    } catch (error) {
        console.error('Registration error:', error);

        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];

            if (field === 'username' || field === 'email') {
                return res.status(409).json({
                    field,
                    message: field === 'username'
                        ? 'This username is already taken.'
                        : 'This email is already registered.'
                });
            }

            return res.status(409).json({
                message: 'Email or username already exists'
            });
        }

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (
            typeof identifier !== 'string' ||
            typeof password !== 'string'
        ) {
            return res.status(400).json({
                message: 'Username or email and password must be strings'
            });
        }

        if (!identifier.trim() || !password) {
            return res.status(400).json({
                message: 'Username or email and password are required'
            });
        }

        const normalizedIdentifier = identifier.trim().toLowerCase();

        const user = await User.findOne({
            $or: [
                { email: normalizedIdentifier },
                { username: normalizedIdentifier }
            ]
        });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid username/email or password'
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid username/email or password'
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                username: user.username
            }
        });

    } catch (error) {
        console.error('Login error:', error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

const getMe = async (req, res) => {
    return res.status(200).json({
        user: req.user
    });
};

module.exports = { register, login, getMe };