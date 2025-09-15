import {asyncHandler} from "../utils/asynHanndler.js"
export { ApiError} from "../utils/ApiErrors.js"
import {User} from "../models/user.models.js"
import { ApiError } from "./user. controller.js";
import {uploadCloudinary} from "../utils/cloudnary.js"
import {ApiResponse} from "../utils/ApiResponse.js"


export const registerUser = asyncHandler(async(req, res) => {
    const {fullname, username, email, password} = req.body;

    if(!fullname || !username || !email || !password){
        throw new ApiError(400, "your credential are empty") 
    }
    const existingUser =await User.findOne({
        $or: [
            {username}, {email}
        ]
    })

    if(existingUser){
        throw  new ApiError (409, "user already exist")
    }

  const avatarLocalFilePath = req.files?.avatar[0]?.path
  const coverImageLocalFilePath = req.files?.coverImage[0]?.path

  if(!avatarLocalFilePath){
    throw new ApiError(400,  "there is avtar image is missing ")
  }

 const avatar = await uploadCloudinary(avatarLocalFilePath)
 const coverImage =  await uploadCloudinary(coverImageLocalFilePath)

 if(!avatar){
    throw new ApiError(530, "unable to upload image in cloudinary")
 }

const user =  await User.create({
    fullname,
    username: username.toLowerCase(),
    avatar: avatar.url,
    email,
    password,
    coverImage: coverImage?.url || ""

 })

const createdUser =  await User.findById(user._id).select(
    "-password -refreshToken"
 )

 if(!createdUser){
    throw new ApiError(500, "something went wrong that's why user cant be inserted in db")
 }

 return res.status(201).json(
    new ApiResponse(
        200, createdUser, "user register successfully"
    )
 )

})

