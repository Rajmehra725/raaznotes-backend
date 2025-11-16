import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

// ⭐ Prevent one user from reviewing same product twice
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// ⭐ Auto populate user details on all finds (optional)
reviewSchema.pre(/^find/, function (next) {
  this.populate("user", "name email");
  next();
});

export default mongoose.model("Review", reviewSchema);
