import CodePost from '../models/CodePost';
import Review from '../models/Review';
import { asyncMiddleware } from '../utils/asyncMiddleware';
import { ErrorResponse } from '../utils/globalErrorHandler';
import 'colors';
import CommonFeatures from '../utils/commonFeatures';

export const addCodePost = asyncMiddleware(async (req, res, next) => {
    const userId = req.user._id;

    if (!userId) {
        return next(
            new ErrorResponse("Login session expired or user don't exists", 400)
        );
    }

    const codePost = await CodePost.create({ ...req.body, creator: userId });

    res.status(201).json({
        success: true,
        data: codePost
    });
});

export const updateCodePost = asyncMiddleware(async (req, res, next) => {
    const userId = req.user._id;
    const codepostId = req.params.codepostId;

    let codePost = await CodePost.findById(codepostId);

    if (!codePost || !codepostId) {
        return next(new ErrorResponse('code post not found', 400));
    }

    // Make sure user is codePost's owner
    if (!codePost.creator.equals(userId) && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${userId} is not authorized to update this code post`,
                401
            )
        );
    }

    codePost = await CodePost.findOneAndUpdate({ _id: codepostId }, req.body, {
        new: true,
        runValidators: true
    });

    res.status(201).json({
        success: true,
        data: codePost
    });
});

export const getCodePostsBySignedInUser = asyncMiddleware(
    async (req, res, next) => {
        const userId = req.user._id;

        if (!userId) {
            return next(
                new ErrorResponse(
                    "Login session expired or user don't exists",
                    400
                )
            );
        }

        const codePostFeatures = new CommonFeatures(
            CodePost.find({ creator: userId }),
            req.query
        )
            .select()
            .paginate()
            .filter()
            .sort();

        const codePosts = await codePostFeatures.query;

        if (codePosts.length <= 0 || !codePosts) {
            return next(
                new ErrorResponse('No code posts found for this user', 404)
            );
        }

        res.status(201).json({
            success: true,
            data: codePosts
        });
    }
);

export const deleteCodePostBySignedInUser = asyncMiddleware(
    async (req, res, next) => {
        // 1) find the codePost by id
        const codepostId = req.params.codepostId;
        const userId = req.user._id;

        const codePost = await CodePost.findOne({ _id: codepostId });

        if (!codePost && !codepostId) {
            return next(new ErrorResponse("Can't found code post", 400));
        }

        // 2) does codePost belongs to currently loggegIn user
        if (!codePost.creator.equals(userId) && req.user.role !== 'admin') {
            return next(
                new ErrorResponse(`Not authorized to delete code post`, 401)
            );
        }

        // 3) delete the all the review and upvotes from DB
        await Review.deleteMany({
            code_post: codePost._id
        });

        // 4) delete the codePost
        await codePost.remove();

        res.status(200).json({
            success: true,
            data: {
                message: `Code post with id: ${codePost._id} deleted successfully`
            }
        });
    }
);
