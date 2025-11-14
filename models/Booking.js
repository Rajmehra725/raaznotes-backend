import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  quantity: Number,
  status: { type: String, default: "Booked" },
  bookedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Booking", bookingSchema);
