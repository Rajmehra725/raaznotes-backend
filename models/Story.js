import mongoose from "mongoose";

const StorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, default: "" },
  mediaUrl: { type: String, default: "" },
  // createdAt will be used for TTL
  createdAt: { type: Date, default: Date.now, index: { expires: 60 * 60 * 24 } } // 24 hours
});

export default mongoose.model("Story", StorySchema);
