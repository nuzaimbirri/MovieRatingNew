import jwt from "jsonwebtoken"

export const genrateTokenAndSetCookie = (userId,res)=>{
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is not set");
    }
    const token = jwt.sign({userId}, secret, {
      expiresIn: "15d"
    })

    res.cookie("jwt",token,{
      maxAge: 15*24*60*60*1000,   // 15 days in milliseconds
      httpOnly: true,             // prevent XSS attacks cross-site scripting attacks
      sameSite: "strict",         // CSRF attacks cross-site request forgery attacks
      secure: process.env.NODE_ENV !== "development"
    })

  } catch (error) {
    console.log("error in genrate token func", error.message)
  }
}