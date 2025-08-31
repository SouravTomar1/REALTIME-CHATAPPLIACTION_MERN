import jwt from 'jsonwebtoken';
export const generateToken=(userID,res)=> {
      const token = jwt.sign({userID},process.env.JWT_SECRET,{
        expiresIn: "7d"
})
res.cookie("jwt",token,{
    maxAge: 7*24*60*60*1000,  //in milisecond
    httpOnly: true,//this can make cookie not accesible by js like document.cookkie so this is secure
    sameSite:"strict", // only send request in same origin or first-partyycontext
    secure:process.env.NODE_ENV !="development"
    // CSRF Cross-Site Request Forgery. means if we login in abnking site and do not logout and go to some third part website then that site can acces the jwt token of the banking site
});
return token;
}
