import {asyncHandler} from "../utils/asynHanndler.js"

export const registerUser = asyncHandler(async(req, res) => {
    res.status(200).json({
        message: "ok"
    })
})

