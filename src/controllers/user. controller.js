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

export const updatePassword = asyncHandler(async(req, res) =>{
  const {oldPassword, newPassword, confirmPassword} = req.body;

  if(!(newPassword === confirmPassword)){
    throw new ApiError(401, "put same  password in new and confirm password")
  }

 const user = await User.findById(req.user._id)
const verifiedPassword =  await user.isPasswordCorrect(oldPassword)

if(!verifiedPassword){
  throw new ApiError(401, "old password has some error")
}

user.password = newPassword

user.save({validateBeforesave: false})

return res
 .status(200)
 .json(new ApiResponse(200, {}, "password changed"))
})

export const getCurrentUser = asyncHandler(async(req, res) =>{
  return res
  .status(200)
  .json(
    200, req.user, "user fetched successfully"
  )
})

export const updateUserDetail = asyncHandler(async(req, res) =>{
  const {fullname, email} = req.body;

  if(!fullname || !email){
    throw new ApiError(401, "required credentials are missing")
  }

 const user = await User.findByIdAndUpdate(req.user._id, {
    $set: {
      fullname,
      email
    },
    
  },
  {new: true}
).select("-password")

  return res
  .status(200)
  .json(
    new ApiResponse(200, user, "detailed are updated successfully")
  )
})

export const updateUserAvatar = asyncHandler(async(req, res) =>{
  const avatarLocalFilePath = req.file.path;

  if(!avatarLocalFilePath){
    throw new ApiError(400,  "unable  to get local file path ..")
  }

  const avatar = await uploadCloudinary(avatarLocalFilePath)

  if(!avatar.url){
    throw new ApiError(400,  "unable  to get local file in cloudinary ..")
  }
 const user = await User.findByIdAndUpdate(req.user._id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    {new:true}
  ).select("-password")

  return res
  .status(200)
  .json(
    new ApiResponse(200, user, "cover image updated ")
  )


})

export const updateUserCoverImage = asyncHandler(async(req, res) =>{
  const coverImageLocalFilePath = req.file.path;

  if(!coverImageLocalFilePath){
    throw new ApiError(400, "unable to get local path of cover image")
  }

  const coverImage = uploadCloudinary(coverImageLocalFilePath)

  if(!coverImage.url){
    throw new ApiError(400, "unable to get cloudinary path of cover image")
  }

  const user = await User.findByIdAndUpdate(req.user._id,
    {
      $set: {
        coverImage: coverImage.url
      }
    },{new: true}
  ).select("-password")

  return res
  .status(200)
  .json(
    new ApiResponse(200, user, "coverimage of user is updated successfully")
  )

})

