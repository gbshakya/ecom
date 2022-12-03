const User = require('../models/user')
const BigPromise = require('../middlewares/bigpromise')
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const fileUpload = require('express-fileupload')
const cloudinary = require('cloudinary')
const mailHelper = require('../utils/emailHelper')
const crypto = require('crypto')

exports.signup =  BigPromise(async (req,res,next) =>{

    if(!req.files){
        return next(new CustomError("Photo is required",400))
    }
    const {name, email ,  password} = req.body;
    
    if(!email || !name  || !password){
        return next(new CustomError('Name , Email and Password are required',400))
    }


    let file = req.files.photo
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath,{
        folder:"user",
        width:"150",
        crop:"scale"
    })
   


    

    const user = await User.create({
        name,
        email,
        password,
        photo:{
            id: result.public_id,
            secure_url: result.secure_url
        }
    })

    cookieToken(user,res);
    
})

exports.login = BigPromise(async(req,res,next) =>{
    console.log("From Login")
    const {email , password} = req.body

    //check for presence of email and password

    if(!email || !password){
        return next(new CustomError("please provide email and password",400))
    }


    //get user from db
    const user = await User.findOne({email}).select("+password")
    //if user not found in db
    if(!user){
        return next(new CustomError("You are not registered",400))
    }
    // match the pw
    const isPasswordCorrect = await user.IsvalidPassword(password)
    //if pw do not match
    if(!isPasswordCorrect){
        return next(new CustomError("Email or pw is not corrext.",400))
    }
    //token is send if all is good
    cookieToken(user ,res);



})

exports.logout = BigPromise(async(req,res,next) =>{
    console.log("From Logout")
    res.cookie('token',null,{
        expires: new Date(Date.now()),
        httpOnly : true
    })

    res.status(200).json({
        succes : true,
        message : "Logout Success"
    })
})


exports.forgotPassword = BigPromise(async(req, res , next) =>{
    console.log(req)
    const {email} = req.body

    const user = await User.findOne({email})

    if(!user){
        return next(new CustomError("Please enter the email", 400))
    }


    const forgotToken = user.getForgotPasswordToken()

    await user.save({
        validateBeforeSave: false
    })

    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`

    const message = `Copy paste this link in your Url and hit enter \n\n ${myUrl}`

    try{
        await mailHelper({
            email: user.email,
            subject:"Ecommerce reset Password",
            message
        })

        res.status(200).json({
            success: true,
            message: " Message sent successfully"
        })

    }catch(error){
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined
        await user.save({validateBeforeSave : false})

        return next(new CustomError(error.message, 500))
    }

})

exports.passwordReset = BigPromise(async(req, res, next) =>{
    const token = req.params.token

    const encryToken = crypto.createHash('sha256')
    .update(token)
    .digest('hex')

    const user = await User.findOne({
        encryToken,
        forgotPasswordExpiry: {$gt: Date.now()}})
    
    if(!user){
        return next(new CustomError('Token is invalid or expired', 400))

    }

    if(req.body.password != req.body.confirmPassword){
        return next(new CustomError('Passwords do not match', 400))
    }
    
    user.password = req.body.password
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    await user.save()

    //send a Json respoinse or send a token

    cookieToken(user , res)

     
})


exports.getLoggedInUserDetails = BigPromise(async(req, res, next) =>{
    console.log(req)
    console.log(req.user)
    const user  = await User.findById(req.user.id)
    res.status(200).json({
        succes: true,
        user
    })  

})


exports.changePassword = BigPromise(async(req,res,next) =>{

    console.log(req)
    const userId = req.user.id

    const user = await User.findById(userId).select("+password")

    const IsCorrectOldPassword = await user.IsvalidPassword(req.body.oldPassword)

    if(!IsCorrectOldPassword){
        return next(new CustomError('Old password is incorrect', 400)) }

    user.password = req.body.password

    await user.save()
    cookieToken(user, res)

})


exports.updateUserDetails = BigPromise(async(req,res,next) =>{

    if(!req.body.name || !req.body.email){
        return next(new CustomError("please provide name and email",400))
    }

    const newData = {
        name: req.body.name,
        email : req.body.email

    }

    if(req.files){
        const user = await User.findById(req.user.id)

        const imageId = user.photo.id

        const resp = await cloudinary.v2.uploader.destroy(imageId)

        const result = await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath,{
            folder:"users",
            width: 150,
            crop: "scale"
        })



        newData.photo = {
            id: result.public_id,
            secure_url: result.secure_url
        }
    }
    const user = await User.findByIdAndUpdate(req.user.id, newData ,{
        new:true,
        runValidators:true,
        useFindAndModify : false
    })


    res.status(200).json({
        success: true,
    })

})


exports.adminAllUser = BigPromise(async (req,res,next) =>{
    const users = await User.find()
    res.status(200).json({
        success: true,
        users
    })
})


exports.managerAllUser = BigPromise(async(req,res,next) =>{
    const users = await User.find({role : "user"})

    users.forEach((user) =>{
        user.role = undefined,
        user.createdAt = undefined
    })
    console.log(users)
   
    res.status(200).json({
        succes: true,
        users
    })
})

exports.adminGetSingleUSer = BigPromise(async(req , res, next) =>{
    const user = await User.findById(req.params.id)
    if(!user){
        next(new CustomError("No User Found", 400))
    }
    res.status(200).json({
        success: true,
        user
    })
})

exports.adminUpdateOneUser = BigPromise(async(req,res,next) =>{
    const newdata = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }



    const user = await User.findByIdAndUpdate(req.params.id , newData ,{
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        succes:true
    })

})


exports.adminDeleteUser = BigPromise(async(req,res,next) =>{
    const user = await User.findById(req.params.id)
    if(!user){
        next(new CustomError("No User Found", 400))
    }

    const imageId = user.photo.id

    await cloudinary.v2.uploader.destroy(imageId)
    user.remove()
    res.status(200).json({
        succes: true
    })
})