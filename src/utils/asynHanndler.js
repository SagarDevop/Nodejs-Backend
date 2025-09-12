// const asyncHandler = (fn) => async(req, res, next)=> {
//     try {
//         await fn(req, res, next);
        
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({message: 'Internal Server Error'});
//     }

// }

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).
    catch((err) => next(err));
}

export { asyncHandler };