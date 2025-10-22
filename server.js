const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const Note = require("./models/note");

dotenv.config();
const app = express();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS Configuration
app.use(
  cors({
    origin: [
      "https://raaznotes-frontend.onrender.com", // Frontend (Render)
      "http://localhost:3000", // Localhost dev
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected (Raaz Mehra)"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Cloudinary Storage Setup
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "RaazNotes",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

// ✅ Upload Route
app.post("/api/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      console.log("❌ No file received");
      return res.status(400).json({ error: "Image upload failed!" });
    }

    // ✅ Some Cloudinary versions return `path`, some return `secure_url`
    const imageUrl = req.file.path || req.file.secure_url;

    if (!imageUrl) {
      console.log("⚠️ Cloudinary upload missing URL:", req.file);
      return res.status(400).json({ error: "Cloudinary URL missing" });
    }

    console.log("✅ Image uploaded:", imageUrl);

    res.status(200).json({
      success: true,
      imageUrl,
      message: "Image uploaded successfully!",
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: "Server error during upload" });
  }
});


// ✅ Check Cloudinary Connection
app.get("/api/check-cloudinary", async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    res.json({ success: true, message: "Cloudinary connected successfully!", result });
  } catch (err) {
    console.error("❌ Cloudinary connection error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Notes Routes
app.get("/api/notes", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error("❌ GET /api/notes error:", error);
    res.status(500).json({ error: "Error fetching notes" });
  }
});

app.post("/api/notes", async (req, res) => {
  try {
    const note = new Note(req.body);
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error("❌ POST /api/notes error:", error);
    res.status(500).json({ error: "Error creating note" });
  }
});

app.put("/api/notes/:id", async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedNote);
  } catch (error) {
    console.error("❌ PUT /api/notes/:id error:", error);
    res.status(500).json({ error: "Error updating note" });
  }
});

app.delete("/api/notes/:id", async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted successfully!" });
  } catch (error) {
    console.error("❌ DELETE /api/notes/:id error:", error);
    res.status(500).json({ error: "Error deleting note" });
  }
});

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("📝 Raaz Notes Backend is running successfully!");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
