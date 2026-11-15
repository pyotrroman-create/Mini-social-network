const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 2 * 1024 * 1024
    },

    fileFilter: (req, file, callback) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return callback(
                new Error('Only JPEG, PNG and WebP images are allowed')
            );
        }

        callback(null, true);
    }
});

const uploadAvatar = (req, res, next) => {
    upload.single('profileImage')(req, res, (error) => {
        if (!error) {
            return next();
        }

        if (error instanceof multer.MulterError) {
            return res.status(400).json({
                message: error.code === 'LIMIT_FILE_SIZE'
                    ? 'Image must not exceed 2 MB'
                    : 'Invalid image upload'
            });
        }

        return res.status(400).json({
            message: error.message
        });
    });
};

module.exports = uploadAvatar;