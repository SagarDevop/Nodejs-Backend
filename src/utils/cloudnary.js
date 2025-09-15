import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API, 
        api_secret: process.env.CLOUDINARY_API_SCERET // Click 'View API Keys' above to copy your API secret
    });


const uploadCloudinary = async(localfilepath) =>{
    try {
        if(!localfilepath) return null
        const uploadResult = await cloudinary.uploader
       .upload(localfilepath,{
        resource_type:"auto"
       })
       console.log("your file is uploaded",uploadCloudinary.url)
       return uploadCloudinary
    } catch (error) {
        fs.unlinkSync(localfilepath)
        return null
        
    }

}

export {uploadCloudinary}