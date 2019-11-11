import { asyncMiddleware } from '../utils/asyncMiddleware';
import { generateUserToken } from '../utils/generateToken';
import { sendEmail } from '../utils/sendMail';
import { ErrorResponse } from '../utils/globalErrorHandler';
import { promisify } from 'util';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import CommonFeatures from '../utils/commonFeatures';

export const signUpUser = asyncMiddleware(async (req, res) => {
    // create is class/function constructor method
    // save/insert is instace method
    const newUser = await User.create({
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        password_confirm: req.body.password_confirm,
        gender: req.body.gender
    });

    res.status(201).send({
        status: 'success',
        data: {
            user: newUser
        }
    });
});

export const signUpUsers = asyncMiddleware(async (req, res) => {
    // create is class/function constructor method
    // save/insert is instace method
    const newUsers = await User.create(req.body); // don't use insertMany here just bcz of performance, we want to run pre('save') middleware over here SO !

    res.status(201).send({
        status: 'success',
        data: {
            users: newUsers
        }
    });
});

export const signInUser = asyncMiddleware(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorResponse(`enter email and password`, 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(user.password, password))) {
        return next(new ErrorResponse(`Invalid email or password`, 401));
    }

    const token = await generateUserToken(user._id);

    return res.status(200).send({
        status: 'success',
        token
    });
});

export const forgotPassword = asyncMiddleware(async (req, res, next) => {
    // 1) get user based on email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse(`user not found`, 404));
    }

    // 2) generate passwordReset Token;
    const resetToken = user.generatePasswordToken();
    await user.save({ validateBeforeSave: false });

    // 3) send it to use via mail
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/user/reset-password/${resetToken}`;

    const message = `forgot password ? please reset your password using this link: ${resetURL}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'reset password(in 10 min token will be expires)',
            message: message
        });
        return res.send({ msg: 'Token send to email !' });
    } catch (error) {
        // make sure if sending mail fail, then empty the password_reset_token & password_reset_expiry
        user.password_reset_token = undefined;
        user.password_reset_expiry = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorResponse(`Internal server error`, 500));
    }
});

export const resetPassword = asyncMiddleware(async (req, res, next) => {
    // 1) Get user based on the token
    const hashRecievedResetToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

    const user = await User.findOne({
        password_reset_token: hashRecievedResetToken,
        password_reset_expiry: { $gt: Date.now() }
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new ErrorResponse(`Token is invalid or expired`, 400));
    }

    user.password = req.body.password;
    user.password_confirm = req.body.password_confirm;
    user.password_reset_token = undefined;
    user.password_reset_expiry = undefined;

    await user.save();

    // 3) Update changedPasswordAt property for the user
    ///////  ==> // this is done automatically as user schema has instace method for preSave doc

    // 4) Log the user in, send JWT(Generate new token and send it to user)
    const token = await generateUserToken(user._id);

    return res.status(200).send({
        status: 'success',
        token
    });
});

export const allowPermissionTo = (...roles) => {
    // roles = ["user","manager","admin", ...etc] , role="user" || "manager" || "admin"
    // roles = ["user","manager"] , role="user" || "manager"
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorResponse(
                    `user don't have permision to perform this task`,
                    403
                )
            );
        }
        next();
    };
};

export const authenticateUser = asyncMiddleware(async (req, res, next) => {
    // 1) check authToken is provided in header
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return next(
            new ErrorResponse("you're not logged in, please login !", 401)
        );
    }

    // 2) varify token
    const decoded = await promisify(jwt.verify)(token, process.env.SECRET);

    // 3) Check user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new ErrorResponse("token expired or user doesn't exists", 401)
        );
    }

    // 4) check password is changes after

    if (currentUser.isPasswordChangedAfterSignIn(decoded.iat)) {
        return next(
            new ErrorResponse(
                "you've changed password !, Enter latest password",
                400
            )
        );
    }

    req.user = currentUser;

    next();
});

export const getAllUsers = asyncMiddleware(async (req, res, next) => {
    const usersFeatures = new CommonFeatures(User.find(), req.query)
        .select()
        .paginate()
        .sort();

    const users = await usersFeatures.query;

    return res.status(200).send({
        status: 'success',
        users: users
    });
});
