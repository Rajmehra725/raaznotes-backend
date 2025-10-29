import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // ✅ Profile section
    bio: { type: String, default: "" },
    location: { type: String, default: "" },

    // ✅ Cloudinary image fields
    profilePicture: {
      url: { type: String, default: "" }, // image URL from Cloudinary
      public_id: { type: String, default: "" }, // used to update/delete image
    },

    // ✅ Optional social links
    socialLinks: {
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
