import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"


const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        minLength:[3,"first name must contain at least 3 characters!"]
    },
    lastName:{
        type:String,
        required:true,
        minLength:[3,"last name must contain at least 3 characters!"]
    },
    email:{
        type:String,
        required:true,
        validate:[validator.isEmail,"Please provide valid email"]
    },
    phone:{
        type:String,
        required:true,
        minLength:[10,"Phone no must contain 10 digits"],
        maxLength:[10,"Phone no must contain 10 digits"]
    },
    nic:{
        type:String,
        required:true,
        minLength:[5,"NIC must contain 5 digits"],
        maxLength:[5,"NIC must contain 5 digits"]
    },
    dob:{
        type:Date, 
        required:[true,"DoB is required!"] 
    },
    gender:{
        type:String,
        required:true,
        enum:["Male","Female"]
    },
    password:{
        type:String,
        minLength:[8,"Password must contain 8 charachters!"],
        required:true,
        select:false
    },
    role:{
        type:String,
        required:true,
        enum:["Admin","Patient","Doctor"]
    },
    doctorDepartment:{
        type:String,
    },
    docAvatar:{
        public_id: String,
        url: String
    },
})


// to bcrypt password
userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next()
    }
    this.password = await bcrypt.hash(this.password,10)
});

// to verify password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password)
}

// to genetate token after login
userSchema.methods.generateJsonWebToken = function(){
    return jwt.sign({id: this._id},process.env.JWT_SECRET_KEY,{
        expiresIn: process.env.JWT_EXPIRES
    })
}


export const User = mongoose.model("User",userSchema)