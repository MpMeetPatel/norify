import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a title for the review'],
        maxlength: 100
    },
    text: {
        type: String,
        required: [true, 'Please add some text']
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please add a rating between 1 and 10']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    code_post: {
        type: mongoose.Schema.ObjectId,
        ref: 'CodePost',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
});

ReviewSchema.index({ code_post: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
