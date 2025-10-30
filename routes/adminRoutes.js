import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

/* =========================================================
   ✅ 1. Get All Users
   ========================================================= */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("name email createdAt");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* =========================================================
   ✅ 2. Get Single User by ID
   ========================================================= */
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* =========================================================
   ✅ 3. Add New User
   ========================================================= */
router.post("/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully", newUser });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* =========================================================
   ✅ 4. Update User
   ========================================================= */
router.put("/user/:id", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const updateData = { name, email };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* =========================================================
   ✅ 5. Delete User
   ========================================================= */
router.delete("/user/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
