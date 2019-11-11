import express from 'express';
import {
    signUpUser,
    signInUser,
    forgotPassword,
    resetPassword,
    authenticateUser,
    allowPermissionTo,
    getAllUsers,
    signUpUsers
} from '../controllers/user';

const router = express.Router();

router.post('/signup', signUpUser);
router.post(
    '/signup-multiple',
    authenticateUser,
    allowPermissionTo('admin'),
    signUpUsers
);
router.post('/signin', signInUser);
router.post('/forgot-password', forgotPassword);

router.patch('/reset-password/:resetToken', resetPassword);

router.get('/', authenticateUser, allowPermissionTo('admin'), getAllUsers);

export { router as userRoutes };
