import express from 'express';
import {
    addCodePost,
    updateCodePost,
    getCodePostsBySignedInUser,
    deleteCodePostBySignedInUser
} from '../controllers/codePost';
import { authenticateUser, allowPermissionTo } from '../controllers/user';

const router = express.Router();

router
    .route('/')
    .get(
        authenticateUser,
        allowPermissionTo('user', 'admin'),
        getCodePostsBySignedInUser
    )
    .post(authenticateUser, allowPermissionTo('user', 'admin'), addCodePost);

router
    .route('/:codepostId')
    .put(authenticateUser, allowPermissionTo('user'), updateCodePost)
    .delete(
        authenticateUser,
        allowPermissionTo('user', 'admin'),
        deleteCodePostBySignedInUser
    );

export { router as codePostRoutes };
