import { v2 as cloudinary } from "cloudinary";
import Upload from "../models/Upload.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (req, res) => {
  try {
    const file = req.body.image;
    const result = await cloudinary.uploader.upload(file, { folder: "lyf_uploads" });
    const upload = await Upload.create({
      userId: req.user,
      imageUrl: result.secure_url,
      caption: req.body.caption || "",
    });
    res.status(201).json(upload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
