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

// ============= MULTER STORAGE (IMAGES + VIDEOS) =============
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "lyf_media",
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "gif",
      "mp4",
      "mov",
      "mkv",
      "webm",
    ],
    resource_type: "auto", // auto image or video
    public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`,
  }),
});

// ============= MULTER UPLOAD HANDLER =============
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
});

// ========= EXPORTS =========
export const uploadSingle = upload.single("image"); // 1 file
export const uploadMultiple = upload.array("images", 10); // up to 10 files

export { cloudinary, upload };
export default cloudinary;
