import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // 👤 Basic Info
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // 📸 Profile & Cover Photos
    avatar: { type: String, default: "" },
    coverPhoto: { type: String, default: "" },

    // 🧠 Bio & About
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
    website: { type: String, default: "" },

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
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // 🧡 Posts & Saved
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],

    // 📖 Story Highlights (like Instagram)
    storyHighlights: [
      {
        title: { type: String },
        coverImage: { type: String },
        stories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Story" }],
      },
    ],

    // 🕒 Online Status
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },

    // 🔔 Notifications
    notifications: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        type: {
          type: String,
          enum: ["like", "comment", "follow", "message", "mention"],
        },
        post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
        message: { type: String },
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // 🧩 Role & Account Settings
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isBlocked: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false }, // ✅ Verified badge

    // 💬 Suggestions
    suggestedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
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
