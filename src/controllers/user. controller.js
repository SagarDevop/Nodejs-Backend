import { asyncHandler } from "../utils/asynHanndler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.models.js";
import { uploadCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async(userId) =>{
    const user = User.findById(userId)
   const accessToken = user.generateAccessToken()
   const refreshToken = user.generateRefreshToken()

   user.refreshToken = refreshToken
   user.save({validateBeforesave: false})

   return {accessToken, refreshToken}
}

export const registerUser = asyncHandler(async(req, res) => {
    const {fullname, username, email, password} = req.body;

    if(!fullname || !username || !email || !password){
        throw new ApiError(400, "your credential are empty") 
    }
    const existingUser = await User.findOne({ $or: [ { username: username }, { email: email } ] })

    if(existingUser){
        throw new ApiError(409, "user already exist")
        
    }

  const avatarLocalFilePath = req.files?.avatar[0]?.path
//   const coverImageLocalFilePath = req.files?.coverImage[0]?.path

let coverImageLocalFilePath;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ){
 coverImageLocalFilePath = req.files?.coverImage[0]?.path
}

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

export const loginUser = asyncHandler(async(req, res) =>{
    const{email, password, username} = req.body;

    if(!email || !username){
        throw new ApiError(401, "email  or username is not entered")
    }

    const existingUser = await User.findOne({ $or: [ { username: username }, { email: email } ] })

    if(existingUser){
        throw new ApiError(409, "user already exist")
        
    }

   const passwordValidCheck = await existingUser.isPasswordCorrect(password)

   if(!passwordValidCheck){
    throw new ApiError(401, "invalid password ");
    
   }

 const {refreshToken, accessToken} =  await generateAccessAndRefreshToken(user._id)

 const loggedInUser = await User.findById(user._id).select(
    "-password, -refreshToken"
 )

 const options = {
   httpOnly: true,
   secure: true 
 }

 return res
 .status(200)
 .cookie("accessToken", accessToken, options)
 .cookie("refreshToken", refreshToken, options)
 .json(
    new ApiResponse(
        200,
        {
            user: loggedInUser, accessToken, refreshToken
        },
        "User login successfully"
    )
 )


})

export const logoutUser = asyncHandler(async(req, res) =>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
   httpOnly: true,
   secure: true 
 }

  return res
 .status
 .clearCookie(refreshToken, options)
 .clearCookie(accessToken, options)
 .json(
    new ApiResponse(201,{}, "New user logout successfully ")
 )
 

})

