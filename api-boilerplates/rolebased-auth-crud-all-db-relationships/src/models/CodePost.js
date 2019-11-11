import mongoose from 'mongoose';

const codePostSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            maxlength: 100,
            required: [true, 'Please enter your title']
        },
        description: {
            type: String,
            trim: true,
            required: [true, 'Please enter your description']
        },
        image: {
            type: String
        },
        code_url: {
            type: String
        },
        category: {
            type: [String],
            enum: [
                'frontend',
                'backend',
                'devops',
                'general',
                'web',
                'mobile',
                'other'
            ],
            default: 'other',
            required: [true, 'Provide at least 1 category for code post']
        },
        level: {
            type: [String],
            enum: ['beginner', 'intermediate', 'advanced', 'all'],
            default: 'all',
            required: [true, 'Provide level for code post']
        },
        creator: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, "Code post can't be created without creator id"]
        },
        created: {
            type: Date,
            default: Date.now
        },
        updated: { type: Date }
    },
    { strict: true }
);

module.exports = mongoose.model('CodePost', codePostSchema);
