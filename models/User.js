import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // 📸 Profile & Cover Photos
    avatar: { type: String, default: "" },
    coverPhoto: { type: String, default: "" },

    // 🧠 Bio
    bio: { type: String, default: "" },

    // 🌐 Social Links
    socials: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      hackerrank: { type: String, default: "" },
      youtube: { type: String, default: "" },
      twitter: { type: String, default: "" },
    },

    // 👥 Followers & Following
    followers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" } // Users who follow this user
    ],
    following: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" } // Users this user follows
    ],

    // 🧩 Role & Status
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 🔒 Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔑 Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
