import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity cannot be less than 1"],
    },

    priceAtBooking: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    cancelledAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true }
);

// Prevent duplicate booking
bookingSchema.index({ buyerId: 1, productId: 1 }, { unique: true });

export default mongoose.model("Booking", bookingSchema);
