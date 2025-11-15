import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config();

// ============= CLOUDINARY CONFIG =============
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ============= MULTER CLOUDINARY STORAGE =============
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "lyf_media",
      allowed_formats: [
        "jpg",
        "png",
        "jpeg",
        "webp",
        "mp4",
        "mov",
        "mkv",
        "webm",
      ],
      resource_type: "auto", // auto detect image/video
      public_id: `${Date.now()}-${file.originalname}`, // unique name
    };
  },
});

// ============= MULTER UPLOAD HANDLER =============
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
});

export { cloudinary, upload };
export default cloudinary;
