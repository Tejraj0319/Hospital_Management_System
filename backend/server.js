// Cloudinary is a cloud-based media management platform that allows developers and businesses to manage, optimize, and deliver images, videos, and other media files across web and mobile applications. 
// It provides APIs and tools for uploading, storing, manipulating, and delivering media content, making it easier to handle complex media workflows.


import app from './app.js';
import cloudinary from "cloudinary"

cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,

})

app.listen(process.env.PORT,()=>{console.log(`Server is running on port.....${process.env.PORT}`)}) 