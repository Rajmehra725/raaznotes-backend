import User from "../models/User.js";
import cloudinary from "../utils/cloudinary.js";
import bcrypt from "bcryptjs";

// ✅ Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// ✅ Get single user
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// ✅ Create user
export const addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const newUser = await User.create({ name, email, password, role });
    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

// ✅ Update user (with Cloudinary image upload)
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = { ...req.body };

    // अगर नई image upload करनी हो
    if (req.file) {
      const user = await User.findById(userId);
      if (user.profilePicture.public_id) {
        await cloudinary.uploader.destroy(user.profilePicture.public_id);
      }
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "user_profiles",
      });
      updateData.profilePicture = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    // अगर password change करना हो
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

// ✅ Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete image from Cloudinary (if exists)
    if (user.profilePicture.public_id) {
      await cloudinary.uploader.destroy(user.profilePicture.public_id);
    }

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};
