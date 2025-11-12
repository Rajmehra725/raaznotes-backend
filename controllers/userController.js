import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { cloudinary } from "../config/cloudinary.js";

/* ===========================================================
   ✅ Update Profile (name, bio, social links, avatar, cover)
   =========================================================== */
export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      bio,
      location,
      website,
      facebook,
      instagram,
      linkedin,
      github,
      hackerrank,
      twitter,
      youtube,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update text info
    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.location = location || user.location;
    user.website = website || user.website;
    user.socials = {
      facebook: facebook || user.socials?.facebook || "",
      instagram: instagram || user.socials?.instagram || "",
      linkedin: linkedin || user.socials?.linkedin || "",
      github: github || user.socials?.github || "",
      hackerrank: hackerrank || user.socials?.hackerrank || "",
      twitter: twitter || user.socials?.twitter || "",
      youtube: youtube || user.socials?.youtube || "",
    };

    // 🖼️ Avatar upload
    if (req.files?.avatar) {
      if (user.avatar?.includes("cloudinary.com")) {
        const parts = user.avatar.split("/");
        const public_id = parts.at(-1).split(".")[0];
        await cloudinary.uploader.destroy(`avatars/${public_id}`);
      }

      const uploadedAvatar = await cloudinary.uploader.upload(
        req.files.avatar[0].path,
        { folder: "avatars" }
      );
      user.avatar = uploadedAvatar.secure_url;
    }

    // 🖼️ Cover photo upload
    if (req.files?.coverPhoto) {
      if (user.coverPhoto?.includes("cloudinary.com")) {
        const parts = user.coverPhoto.split("/");
        const public_id = parts.at(-1).split(".")[0];
        await cloudinary.uploader.destroy(`coverPhotos/${public_id}`);
      }

      const uploadedCover = await cloudinary.uploader.upload(
        req.files.coverPhoto[0].path,
        { folder: "coverPhotos" }
      );
      user.coverPhoto = uploadedCover.secure_url;
    }

    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

/* ===========================================================
   🔍 Get Logged-in User Profile
   =========================================================== */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
};

/* ===========================================================
   🧾 Get All Users (Admin only)
   =========================================================== */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================================================
   🗑️ Delete User (Admin only)
   =========================================================== */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================================================
   🔁 Change User Role (Admin)
   =========================================================== */
export const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();
    res.json({ message: "Role updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================================================
   🚫 Block / Unblock User (Admin)
   =========================================================== */
export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({
      message: user.isBlocked ? "User blocked" : "User unblocked",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================================================
   ✅ Update Password
   =========================================================== */
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Password update failed", error: err.message });
  }
};

/* ===========================================================
   🧡 Follow / Unfollow User
   =========================================================== */
export const toggleFollow = async (req, res) => {
  try {
    const targetId = req.params.id;
    const currentUser = await User.findById(req.user._id);
    const targetUser = await User.findById(targetId);

    if (!targetUser) return res.status(404).json({ message: "User not found" });

    const isFollowing = currentUser.following.includes(targetId);

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(targetId);
      targetUser.followers.pull(req.user._id);
    } else {
      // Follow
      currentUser.following.push(targetId);
      targetUser.followers.push(req.user._id);

      // Optional: create notification
      targetUser.notifications.push({
        sender: req.user._id,
        type: "follow",
        message: `${currentUser.username} started following you`,
      });
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ===========================================================
   🔍 Get Profile by Username (public)
   =========================================================== */
export const getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ===========================================================
   💎 Toggle Verified (Admin)
   =========================================================== */
export const toggleVerified = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isVerified = !user.isVerified;
    await user.save();
    res.json({
      message: user.isVerified ? "User verified ✅" : "User unverified ❌",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================================================
   🤝 Suggested Users (People You May Know)
   =========================================================== */
export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const excludeIds = [...currentUser.following, req.user._id];
    const suggestions = await User.find({ _id: { $nin: excludeIds } })
      .select("name username avatar isVerified")
      .limit(5);

    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: "Failed to get suggestions", error: err.message });
  }
};
