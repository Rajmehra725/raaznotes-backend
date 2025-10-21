const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const Note = require("./models/note");

dotenv.config();

const app = express();

// ✅ Middleware
app.use(express.json());

// ✅ CORS Configuration (Render + Localhost)
app.use(cors({
  origin: [
    "https://raaznotes-frontend.onrender.com", // Render frontend URL
     // Local frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Routes
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

// ✅ Default route for Render health check
app.get("/", (req, res) => {
  res.send("📝 Raaz Notes Backend is running successfully!");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
