import { Router } from "express";
import {registerUser, loginUser, logoutUser} from '../controllers/user. controller.js'
import { upload } from "../middleware/multer.middelware.js";
import {verifyJwt} from "../middleware/auth.middelware.js"

const router = Router()

router.post("/register",upload.fields([
    {
        name: "avatar", // this is middelware which is handling file upload 
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]) , registerUser)

router.post("/login", loginUser)

router.post("logout",verifyJwt, logoutUser)









export default router