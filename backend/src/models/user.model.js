import mongoose from 'mongoose';

const userSchema= new mongoose.Schema(
    {
        email:{
            type:String,
            required:true,
            unique:true,
        },
        fullName:{
            type:String,
            unique:true,
            required:true,
        },
        password:{
            type:String,
            required:true,
            minlength:6,
    },
    profilePic:
    {
        type:String,
        default:"",
    },
},
{timestamps:true}  //this is used to take the data on the date and time the user is created or updatedd

);
const User= mongoose.model("User",userSchema);

export default User;