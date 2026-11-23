const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    image: {
        type: String,
        required: true
    },

    caption: {
        type: String,
        default: '',
        trim: true,
        maxlength: 2200
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', postSchema);