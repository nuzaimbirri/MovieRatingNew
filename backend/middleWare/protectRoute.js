import User from "../models/user.model.js";
import jwt from "jsonwebtoken"

export const protectRoute = async (req,res,next)=>{
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.log("JWT_SECRET environment variable is not set");
    return res.status(500).json({ message: "Server misconfiguration: JWT_SECRET not set" });
  }
  try {
    const token = req.cookies.jwt
    if(!token){
      return res.status(401).json({error: "unauthorized: no token provided"})
    }

    const decoded = jwt.verify(token, secret)
    if(!decoded){
      return res.status(401).json({error: "Invalid token"})
    }

    const user = await User.findById(decoded.userId).select("-password")
    if(!user){
      return res.status(404).json({error: "user not found"})
    }
    req.user = user
    next();
  } catch (error) {
    console.log("error in the protectRoute func in middleWare file", error.message)
    res.status(500).json({error: "internal server error"})
  }
}