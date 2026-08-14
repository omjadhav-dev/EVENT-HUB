const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        })
    }
}

// const asyncHandler = (requestHandler) => async (req, res, next) => {
//     Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error))
// }

export default asyncHandler