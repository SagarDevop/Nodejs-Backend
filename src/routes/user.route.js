import { Router } from "express";
import {registerUser} from '../controllers/user. controller.js'
import { upload } from "../middleware/multer.middelware.js";

const router = Router()

router.post("/register",upload.fields([
    {
        name: "avtar", // this is middelware which is handling file upload 
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]) , registerUser)








export default router