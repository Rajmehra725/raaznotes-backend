import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Basic Details
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }, // Hashed password

    // Role
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // Profile Info
    bio: { type: String, default: "" },
    location: { type: String, default: "" },

    // Profile Picture (Cloudinary)
    profilePicture: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },

    // Social Links
    socialLinks: {
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
    },

    // Account Status (Optional but useful for admin)
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ✅ Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
export default mongoose.model("User", userSchema);
