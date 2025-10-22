const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const Note = require("./models/note");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

dotenv.config();
const app = express();

// ✅ Middleware
app.use(express.json());

// ✅ CORS Configuration
app.use(
  cors({
    origin: [
      "https://raaznotes-frontend.onrender.com", // Render frontend URL
      "http://localhost:3000" // Local frontend
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
  .then(() => console.log("✅ MongoDB connected raaz mehra"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Multer + Cloudinary setup for file uploads
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "RaazNotes",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});
const upload = multer({ storage });

// ✅ Upload route
app.post("/api/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: "Image upload failed" });
    }
    res.json({
      imageUrl: req.file.path,
      message: "Image uploaded successfully!",
    });
  } catch (err) {
    console.error("Image upload error:", err);
    res.status(500).json({ error: "Server error during upload" });
  }
});

// ✅ Notes Routes (unchanged)
app.get("/api/notes", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error("GET /api/notes error:", error);
    res.status(500).json({ error: "Error fetching notes" });
  }
});

app.post("/api/notes", async (req, res) => {
  try {
    const note = new Note(req.body);
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error("POST /api/notes error:", error);
    res.status(500).json({ error: "Error creating note" });
  }
});

app.put("/api/notes/:id", async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedNote);
  } catch (error) {
    console.error("PUT /api/notes/:id error:", error);
    res.status(500).json({ error: "Error updating note" });
  }
});

app.delete("/api/notes/:id", async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted successfully!" });
  } catch (error) {
    console.error("DELETE /api/notes/:id error:", error);
    res.status(500).json({ error: "Error deleting note" });
  }
});

// ✅ Default route
app.get("/", (req, res) => {
  res.send("📝 Raaz Notes Backend is running successfully!");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
// ✅ Cloudinary connection test route
app.get("/api/check-cloudinary", async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    res.json({ success: true, message: "Cloudinary connected successfully!", result });
  } catch (err) {
    console.error("❌ Cloudinary connection error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
