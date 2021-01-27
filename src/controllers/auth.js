const db = require("../models/User");
const OTPmodel = require("../models/OTPmodel");
const nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
     user: 'complaintlodgeriitr@gmail.com',
     pass: 'Kk1357924!!'
  }
});
function generateOTP(n){
  let s = 0;
  for(var i=0;i<n;i++){
    s = s*10 + Math.floor(Math.random()*10);
  }
  return parseInt(s);
}
exports.login = async (req, res, next) => {
    const { email, password,isStudent } = req.body;

  // make sure the email, pw is not empty
  if (!email) {
    return next({
      message: "Please fill your email",
      statusCode: 400,
    });
  }
  if (!password) {
    return next({
      message: "Please fill your password",
      statusCode: 400,
    });
  }


  // check if the user exists
  
  const user = await db.findOne({ email });

  if (!user) {
    return next({
      message: "The email is not yet registered to an accout",
      statusCode: 400,
    });
  }

  // if exists, make sure the password matches
  const match = await user.checkPassword(password);

  if (!match) {
    return next({ message: "The password does not match", statusCode: 400 });
  }
  const token = user.getJwtToken();

  // then send json web token as response
  res.status(200).json({ success: true,token: token });
};
exports.OTPVerify = async(req,res,next) =>{
  const {email} = req.body;
  
  
  const user = await db.findOne({email});
  if(user){
    return next({
      message:"This email is already registered",
      statusCode:400
    })
  }
  const ifOTP = await OTPmodel.findOne({email});
  if(ifOTP){
    ifOTP.remove();
  }
  const OTP = generateOTP(6);
  const expires=Date.now()+7200000;
  await OTPmodel.create({email,OTP,expires});
  const msg ={
    to:email,
    from:"complaintlodgeriitr@gmail.com",
    subject:"OTP for signup",
    text:"Hello "+email+",\nhere is the OTP for signup\n"+OTP+"\n\nThis OTP will expire in 2 hours\nThis is system generated mail.So kindly do not reply.\n\nRegards\n CLTIITR",
    
  };
  transporter.sendMail(msg).then(()=>{
    res.status(200).json({success:true,message:"Kindly check your email for OTP"});
  }).catch((error)=>{
    res.status(200).json({success:false,message:error.message});
  })
  

}
exports.signup = async (req, res, next) => {
  const { fullname, username, email, password,isStudent,hostel,institute_id,OTP } = req.body;
  const usercheck = await db.findOne({ email });
  const seccheck = await db.findOne({username});
  if(usercheck){
    return next({
      message: "This email is already registered to an accout",
      statusCode: 400,
    });
  }
  if(seccheck){
    return next({
      message: "This username is already registered to an accout",
      statusCode: 400,
    });
  }
  const OTPVerify = await OTPmodel.findOne({email:email,OTP:OTP});
  if(!OTPVerify){
    return next({
      message:"OTP did not match",
      statusCode:400,
    })    
  }
  const expired = await OTPmodel.findOne({email:email,expires:{$lt:Date.now()}});
  console.log(expired);
  if(expired){
    OTPVerify.remove();
     return next({       
       message:"Your OTP is expired now",
       statusCode:400,
     }) 
  }
  OTPVerify.remove();
  const user = await db.create({
    
     fullname, username, email, password ,hostel,institute_id,isStudent});

  const token = user.getJwtToken();

  res.status(200).json({ success: true,token: token });
};

exports.me = async (req, res, next) => {
  const { avatar, username,fullname, email, _id, website, bio,hostel,institude_id } = req.user;

  res
    .status(200)
    .json({
      success: true,
      data: { avatar, username, fullname, email, _id, website, bio,hostel,institude_id },
    });
};