import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  comment: String,
  rating: Number,
}, { timestamps: true });

export default mongoose.model("Review", reviewSchema);
