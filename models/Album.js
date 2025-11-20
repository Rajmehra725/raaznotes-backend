import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
  albumId: { type: String, unique: true },
  name: { type: String, required: true },
  photos: [{ type: String }], // URLs
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Album", albumSchema);
