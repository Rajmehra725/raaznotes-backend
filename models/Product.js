import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

   slug: {
  type: String,
  unique: true,
  lowercase: true,
  index: true,
}
,

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

 category: {
  type: String,
  required: true,
  index: true,
},

    stock: {
      type: Number,
      default: 1,
    },

    images: [
      {
        type: String, // cloudinary URLs
      },
    ],

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    rating: {
      type: Number,
      default: 0,
    },

    reviewsCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true, // soft delete / hide
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
