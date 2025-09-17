import {asyncHandler} from "../utils/asynHanndler.js"
import {ApiError} from "../utils/ApiErrors.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"


export const verifyJwt = asyncHandler(async(req, res, next) =>{
try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(401, "unauthorized request")
        }
         const verfiedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
         const user = await User.findById(verfiedToken?._id).select("-password -accessToken")
    
         if(!user){
            throw new ApiError(401, "innvalid user token ")
         }
    
         req.user = user
         next()
} catch (error) {
    throw new ApiError(401, error.message || "invalid access token ")
    
}

     

})