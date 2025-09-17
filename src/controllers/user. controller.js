import { asyncHandler } from "../utils/asynHanndler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.models.js";
import { uploadCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'
const generateAccessAndRefreshToken = async(userId) =>{
    const user =await User.findById(userId)
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
    console.log(req.body)
    const{ email, password, username} = req.body;
    

    if(!(email || username)){ // here we are checking for both 
        throw new ApiError(401, "email  or username is not entered")
    }

    const existingUser = await User.findOne({ $or: [ { username: username }, { email: email } ] })

    if(!existingUser){
        throw new ApiError(409, "user already exist")
        
    }

   const passwordValidCheck = await existingUser.isPasswordCorrect(password)

   if(!passwordValidCheck){
    throw new ApiError(401, "invalid password ");
    
   }

 const {refreshToken, accessToken} =  await generateAccessAndRefreshToken(existingUser._id)

 const loggedInUser = await User.findById(existingUser._id).select(
    "-password -refreshToken"
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
   await User.findByIdAndUpdate(
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
 .status(200)
 .clearCookie("refreshToken", options)
 .clearCookie("accessToken", options)
 .json(
    new ApiResponse(201,{}, "New user logout successfully ")
 )
 

})

export const refreshAccessToken = asyncHandler(async(req, res) =>{
  const incomingRefreshTokrn =  req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshTokrn){
    throw new ApiError(400, "there is no refersh token present")
  }
 const verfiedToken = jwt.verify(incomingRefreshTokrn, process.env.REFRESH_TOKEN_SECRET)

 if(!verfiedToken){
    throw new ApiError(401, "invalid refresh token")
 }
  const user = await User.findById(verfiedToken._id)
  if(!user){
    throw new ApiError(401, "refersh token is expire")
 }
 if(incomingRefreshTokrn !== user.refreshToken){
    throw new ApiError(402, "token are not matchhed ")
 }

  const options = {
   httpOnly: true,
   secure: true 
 }
 const {accessToken, newrefreshToken} = await generateAccessAndRefreshToken(user._id)

 return res
 .status(200)
 .cookie("accessToken", accessToken)
 .cookie("refreshToken", refreshToken)
 .json(
    new ApiError(
        200,
        {newrefreshToken, accessToken},
        "access tokken refreshed"
    )
 )


})

