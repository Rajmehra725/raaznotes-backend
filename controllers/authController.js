import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const JWT_EXPIRES = "7d";
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    // ❌ remove hashing here
    const user = await User.create({ name, email, password });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error("❌ Registration error:", err.message);
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "All fields required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // password field exclude
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};
// 🟠 UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user" });
  }
};

// 🔴 DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
// 👤 GET USER PROFILE (Public)
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .select("-password")
      .populate("followers", "name avatar")
      .populate("following", "name avatar");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

// ➕ FOLLOW USER
export const followUser = async (req, res) => {
  try {
    const { id } = req.params; // jis user ko follow karna hai
    const currentUserId = req.user.id;

    if (id === currentUserId)
      return res.status(400).json({ message: "You cannot follow yourself" });

    const targetUser = await User.findById(id);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser)
      return res.status(404).json({ message: "User not found" });

    if (targetUser.followers.includes(currentUserId))
      return res.status(400).json({ message: "Already following" });

    targetUser.followers.push(currentUserId);
    currentUser.following.push(id);

    await targetUser.save();
    await currentUser.save();

    res.status(200).json({ message: "User followed successfully" });
  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).json({ message: "Failed to follow user" });
  }
};

// ➖ UNFOLLOW USER
export const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params; // jis user ko unfollow karna hai
    const currentUserId = req.user.id;

    const targetUser = await User.findById(id);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser)
      return res.status(404).json({ message: "User not found" });

    targetUser.followers = targetUser.followers.filter(
      (followerId) => followerId.toString() !== currentUserId
    );
    currentUser.following = currentUser.following.filter(
      (followingId) => followingId.toString() !== id
    );

    await targetUser.save();
    await currentUser.save();

    res.status(200).json({ message: "User unfollowed successfully" });
  } catch (err) {
    console.error("Unfollow error:", err);
    res.status(500).json({ message: "Failed to unfollow user" });
  }
};
// In userController.js
export const verifyToken = async (req, res) => {
  try {
    // req.user comes from auth middleware
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    res.status(200).json({
      message: "Token valid",
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(500).json({ message: "Token verification failed" });
  }
};
