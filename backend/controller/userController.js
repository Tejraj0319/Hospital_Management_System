import {catchAsyncErrors} from '../middleware/catchAsyncErrors.js'
import ErrorHandler from '../middleware/errorMiddleware.js'
import { User } from '../models/userSchema.js'
import { generateToken } from '../utiles/jwtToken.js'
import cloudinary from "cloudinary"; 



// PATIENT REGISTRATION AND TOKEN GENERATION
export const patientRegister = catchAsyncErrors(async(req,res,next)=>{
    const {firstName,lastName,email,phone,password,gender,dob,nic,role} = req.body
    if(!firstName || !lastName || !email || !phone || !password || !gender || !dob || !nic || !role){
        return next(new ErrorHandler("Please fill full form!",400))
    }
    let user = await User.findOne({email})
    if(user){
        return next(new ErrorHandler("User Alrady registered!",400))
    }
    user = await User.create({firstName,lastName,email,phone,password,gender,dob,nic,role});
    generateToken(user,"User registered!",200,res)
})



// LOGIN AND TOKEN GENERATION
export const login = catchAsyncErrors(async(req,res,next)=>{
    const {email,password,confirmPassword,role} = req.body;

    if(!email || !password || !confirmPassword || !role){
        return next(new ErrorHandler("please provide all details!",400))
    }
    if(password !== confirmPassword){
        return next(new ErrorHandler("password and confirm password do not match",400))
    }
    const user = await User.findOne({email}).select("+password")
    if(!user){
        return next(new ErrorHandler("Invalid email or password",400))
    }
    const isPasswordMatched = await user.comparePassword(password)
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password",400))
    }
    if(role !== user.role){
        return next(new ErrorHandler("User with this role Not Found!",400))
    }
    generateToken(user,"User Logged In!",200,res)
})



// NEW ADMIN REGISTRATION
export const addNewAdmin = catchAsyncErrors(async(req,res,next)=>{
    const {firstName,lastName,email,phone,password,gender,dob,nic} = req.body
    if(!firstName || !lastName || !email || !phone || !password || !gender || !dob || !nic){
        return next(new ErrorHandler("Please fill full form!",400))
    }
    const isRegistered  = await User.findOne({email});
    if(isRegistered){
        return next(new ErrorHandler(`${isRegistered.role} with this email already exist!`))
    }
    const admin = await User.create({firstName,lastName,email,phone,password,gender,dob,nic,role:"Admin"})
    res.status(200).json({
        success:true,
        message:"New Admin Is Registered!"
    })
})



export const getAllDoctors = catchAsyncErrors(async(req,res,next)=>{
    const doctors = await User.find({role:"Doctor"})
    res.status(200).json({
        success:true,
        doctors
    })
})



export const getUserDetails = catchAsyncErrors(async(req,res,next)=>{
    const user = req.user;
    res.status(200).json({
        success:true,
        user
    })
})


export const logoutAdmin = catchAsyncErrors(async(req,res,next)=>{
    res.status(200).cookie("adminToken","",{
        httpOnly:true,
        expires:new Date(Date.now())
    }).json({
        success:true,
        message:"Admin logged out successfully!"
    })
})

export const logoutPatient = catchAsyncErrors(async(req,res,next)=>{
    res.status(200).cookie("patientToken","",{
        httpOnly:true,
        expires:new Date(Date.now())
    }).json({
        success:true,
        message:"Patient logged out successfully!"
    })
})



export const addNewDoctor = catchAsyncErrors(async(req,res,next)=>{
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Doctor Avatar Required!", 400));
      }
      const { docAvatar } = req.files;
      const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
      if (!allowedFormats.includes(docAvatar.mimetype)) {
        return next(new ErrorHandler("File Format Not Supported!", 400)); 
      }
    const {firstName,lastName,email,phone,password,gender,dob,nic,doctorDepartment} = req.body
    if(!firstName || !lastName || !email || !phone || !password || !gender || !dob || !nic || !doctorDepartment){
        return next(new ErrorHandler("Please Provede Full Details About Doctor!",400))
    } 
    const isRegistered = await User.findOne({email})
    if(isRegistered){
        return next(new ErrorHandler(`${isRegistered.role} already registered with this email!`,400))
    }
    const cloudinaryResopnse = await cloudinary.uploader.upload(
        docAvatar.tempFilePath
    )
    if(!cloudinaryResopnse || cloudinaryResopnse.error){
        console.error("cloudinary Error: ", cloudinaryResopnse.error || "Unknown cloudinary error");
    }
    const doctor = await User.create({firstName,lastName,email,phone,password,gender,dob,nic,doctorDepartment,role:"Doctor",docAvatar:{
        public_id:cloudinaryResopnse.public_id,
        url:cloudinaryResopnse.secure_url
    }})
    res.status(200).json({
        success:true,
        message:"New Doctor Registered",
        doctor
    })
})



