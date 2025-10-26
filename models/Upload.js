import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  imageUrl: { type: String, required: true },
  caption: { type: String },
}, { timestamps: true });

export default mongoose.model("Upload", uploadSchema);
