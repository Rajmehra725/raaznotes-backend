import mongoose from "mongoose";

const feelingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  feelingText: { type: String, required: true },
  mood: { type: String, default: "neutral" },
}, { timestamps: true });

export default mongoose.model("Feeling", feelingSchema);
