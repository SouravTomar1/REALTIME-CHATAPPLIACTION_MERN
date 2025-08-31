import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import cloudinary from '../libs/cloudinary.js';
import { generateToken } from '../libs/utils.js';

export const signup=async (req,res) =>
{
  console.log("Signup request body:", req.body);
  const {fullName,email,password}=req.body
  try{
    
    if(!fullName || !email || !password)
      {
      console.log("Request body:", req.body);
    return res.status(400).json({message:"all fields are required" });
    }
     if(password.length<6)
     {
        return res.status(400).json({message:"password should be more than 6 word at least" });
     }
     const user = await User.findOne({email})
     if(user) return res.status(400).json({message:"Email already exist" })

    const salt=await bcrypt.genSalt(10); //this is used bcz  if two people havve same password thaen there hashed string will be same so salt add some random word at the beginning

    const hashedPassword=await bcrypt.hash(password,salt); //combines the pass and salt to prodeuce the hashed value
    
    const newuser=new User({
        fullName,
        email,
        password:hashedPassword
    })
  if(newuser)
  {
    generateToken(newuser._id,res)
    await newuser.save();
    res.status(201).json(
        {
            _id:newuser._id,
            fullName:newuser.fullName,
            email:newuser.email,
            profilePic:newuser.profilePic,
        }
    )
  }
  else{
    return res.status(400).json({message:"Failed to create user" })
  }
   }
   catch (error) {
    console.log("error in the signup controller", error);
    res.status(500).json({ message: "internal server error" });
}

};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) return res.status(400).json({ message: "invalid credential" });

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "invalid credential" });

    generateToken(existingUser._id, res);

    res.status(200).json({
      _id: existingUser._id,
      fullName: existingUser.fullName,
      email: existingUser.email,
      profilePic: existingUser.profilePic,
    });

  } catch (error) {
    console.log("error in the login controller", error);
    res.status(500).json({ message: "internal server error" });
  }
};


export const logout=(req,res) =>
{
   try{
 res.cookie("jwt","",{maxAge:0});//maxAge is the age of the cookie which is terminated after logout
 res.status(200).json({message:"logged out successfully"})
   }
   catch(error)
   {
     console.log("error in the logout controller",error);
     res.status(500).json({message:"internal server error"});
   }
};

export const updateuser= async (req,res) =>{
  try{
       const {profilePic}=req.body;
       const userID=req.user._id;

       if(!profilePic) return res.status(400).json({message:"profilePic is required"});

      const uploadresponse= await cloudinary.uploader.upload(profilePic)
      const updateuser=await User.findByIdAndUpdate(userID,{profilePic:uploadresponse.secure_url},{new:true})
      res.status(200).json(updateuser);
  }
  catch(error)
  {
    console.log("error in the updateuser controller",error);
    res.status(500).json({message:"internal server error"});
  }
 };

export const checkAuth = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in the checkAuth controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
