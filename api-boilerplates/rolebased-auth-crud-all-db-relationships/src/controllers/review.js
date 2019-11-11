import Review from '../models/Review';
import CodePost from '../models/CodePost';
import { asyncMiddleware } from '../utils/asyncMiddleware';
import { ErrorResponse } from '../utils/globalErrorHandler';
import CommonFeatures from '../utils/commonFeatures';

export const addCodePostReview = asyncMiddleware(async (req, res, next) => {
    const userId = req.user._id;
    const codepostId = req.params.codepostId;

    const codePost = await CodePost.findOne({ _id: codepostId })
        .select('_id')
        .lean();

    console.log(codePost, 'codePost');

    if (!userId) {
        return next(
            new ErrorResponse("Login session expired or user don't exists", 400)
        );
    }

    if (!codePost) {
        return next(new ErrorResponse("Can't found code post", 400));
    }

    const review = await Review.create({
        ...req.body,
        user: userId,
        code_post: codepostId
    });

    res.status(201).json({
        success: true,
        data: review
    });
});

export const getCodePostAllReviews = asyncMiddleware(async (req, res, next) => {
    const userId = req.user._id;
    const codepostId = req.params.codepostId;

    const codePost = await CodePost.findOne({ _id: codepostId })
        .select('_id')
        .lean();

    if (!userId) {
        return next(
            new ErrorResponse("Login session expired or user don't exists", 400)
        );
    }

    if (!codePost && !codepostId) {
        return next(new ErrorResponse("Can't found code post", 400));
    }

    const reviewFeatures = new CommonFeatures(
        find({
            code_post: codepostId
        }),
        req.query
    )
        .select()
        .paginate()
        .sort()
        .filter();

    const reviews = await reviewFeatures.query;

    res.status(201).json({
        success: true,
        data: reviews
    });
});

export const updateCodePostReview = asyncMiddleware(async (req, res, next) => {
    const userId = req.user._id;
    const reviewId = req.params.reviewId;

    let review = await Review.findById(reviewId);

    if (!review) {
        return next(
            new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
        );
    }

    // Make sure review belongs to user or user is admin
    if (!review.user.equals(userId) && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not authorized to update review`, 401));
    }

    review = await Review.findByIdAndUpdate(reviewId, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: review
    });
});

export const deleteCodePostReview = asyncMiddleware(async (req, res, next) => {
    const reviewId = req.params.reviewId;
    const userId = req.user._id;

    const review = await Review.findOne({ _id: reviewId });

    if (!review && !reviewId) {
        return next(new ErrorResponse("Can't found review", 400));
    }

    // 2) does codePost belongs to currently loggegIn user
    if (!review.user.equals(userId) && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not authorized to delete review`, 401));
    }

    await review.remove();

    res.status(200).json({
        success: true,
        data: {
            message: `Code post with id: ${review._id} deleted successfully`
        }
    });
});
