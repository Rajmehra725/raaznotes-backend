import multer from "multer";
import path from "path";

// Temporary local storage (Cloudinary upload later)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "video/mp4",
    "audio/mpeg",
    "audio/wav",
    "audio/mp3",
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type"), false);
};

export const upload = multer({ storage, fileFilter });
