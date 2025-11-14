import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  description: String,
  price: Number,
  category: String,
  images: [String], // multiple photos
  stock: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Product", productSchema);
