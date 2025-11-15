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

    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// =============================
// 🔥 Virtual Field (Optional)
// For easily getting total price inside booking
// =============================
// bookingSchema.virtual("totalPrice").get(function () {
//   return this.quantity * this.productId.price;
// });

export default mongoose.model("Booking", bookingSchema);
