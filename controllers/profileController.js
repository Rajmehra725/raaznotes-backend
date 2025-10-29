import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

// ✅ Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update profile details
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, location, socialLinks } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.location = location || user.location;
    user.socialLinks = socialLinks || user.socialLinks;

    const updated = await user.save();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};

// ✅ Upload or replace profile picture
export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If user already has an image, delete it from Cloudinary
    if (user.profilePicture.public_id) {
      await cloudinary.uploader.destroy(user.profilePicture.public_id);
    }

    // Upload new image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "lyf_profiles",
    });

    // Save Cloudinary details to user profile
    user.profilePicture = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    await user.save();
    res.json({ message: "Profile photo updated", profilePicture: user.profilePicture });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Photo upload failed" });
  }
};
