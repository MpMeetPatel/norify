import express from 'express';
import {
    addCodePostReview,
    getCodePostAllReviews,
    updateCodePostReview,
    deleteCodePostReview
} from '../controllers/review';
import { authenticateUser, allowPermissionTo } from '../controllers/user';

const router = express.Router();

router
    .route('/:reviewId')
    .put(authenticateUser, allowPermissionTo('user'), updateCodePostReview)
    .delete(
        authenticateUser,
        allowPermissionTo('user', 'admin'),
        deleteCodePostReview
    );

router
    .route('/:codepostId')
    .get(
        authenticateUser,
        allowPermissionTo('user', 'admin'),
        getCodePostAllReviews
    )
    .post(authenticateUser, allowPermissionTo('user'), addCodePostReview);

export { router as reviewRoutes };
