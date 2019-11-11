import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            trim: true,
            required: [true, 'Please enter your name']
        },
        email: {
            type: String,
            trim: true,
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, 'Please provide valid email address'],
            required: [true, 'Please enter your email']
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false
        },
        gender: {
            type: String,
            required: true,
            enum: ['male', 'female', 'other'] // you can add as many as roles you like
        },
        password_confirm: {
            type: String,
            required: [true, 'Please confirm your password'],
            // only works with save & create (update will not trigger this)
            validate: {
                validator: function(el) {
                    return el === this.password;
                }
            }
        },
        role: {
            type: String,
            enum: ['user', 'admin'], // you can add as many as roles you like
            default: 'user'
        },
        password_changed_at: {
            type: Date
        },
        password_reset_token: String,
        password_reset_expiry: Date,
        created: {
            type: Date,
            default: Date.now
        },
        updated: { type: Date }
    },
    { strict: true }
);

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.password_confirm = undefined;
    next();
});

// methods
userSchema.methods.correctPassword = async function(hashedPass, plainPass) {
    const isCorrectPassword = await bcrypt.compare(plainPass, hashedPass);
    return isCorrectPassword;
};

userSchema.methods.isPasswordChangedAfterSignIn = function(JWTTimeStamp) {
    if (this.password_changed_at) {
        const changedPassTimeStamp = parseInt(
            this.password_changed_at.getTime() / 1000,
            10
        );
        return JWTTimeStamp < changedPassTimeStamp; // 10000 < 40000
    }

    return false;
};

userSchema.methods.generatePasswordToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.password_reset_token = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.password_reset_expiry = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

// pre middleware
// userSchema.pre("remove", function(next) {
//     Post.remove({ postedBy: this._id }).exec();
//     next();
// });

module.exports = mongoose.model('User', userSchema);
