import dotenv from "dotenv";
dotenv.config();
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Chat from "../models/Chat.js";

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: "5d" });
};

export const userReg = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(200)
        .json({ success: false, message: "User already exists" });
    }

    const user = await User.create({ name, email, password });
    const token = generateAccessToken(user._id);

    res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const userLogin = async (req, res) => {
  const { email, password } = req.body; // ✅ fixed (was using "name" instead of "email")

  try {
    const userExists = await User.findOne({ email }); // ✅ fixed (was lowercase "user")
    if (userExists) {
      const isMatch = await bcrypt.compare(password, userExists.password);
      if (isMatch) {
        const token = generateAccessToken(userExists._id);
        return res.json({
          success: true,
          token,
          message: "User logs in",
        });
      }
    }
    return res.json({ success: false, message: "Invalid email/password" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = req.user; // coming from protect middleware
    return res.json({ success: true, user });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const getPublishedImage = async (req,res)=>{
  try {
    const publishedImageMessages = await Chat.aggregate([
      {$unwind : '$message'},
      {
        $match :{
          "messages.isImage" : true,
          "messages.isPublished" : true
        }
      },{
        $project :{
          _id : 0,
          imageUrl : '$messages.content',
          userName : "$userName"
        }
      }
    ])
    res.json({success:true, images : publishedImageMessages.reverse()})
  } catch (error) {
    res.json({success:false, message: error.message})
  }
}
