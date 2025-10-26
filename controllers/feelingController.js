import Feeling from "../models/Feeling.js";
import mongoose from "mongoose";

// ✅ Temporary test userId
const TEST_USER_ID = new mongoose.Types.ObjectId();

export const addFeeling = async (req, res) => {
  try {
    const { feelingText, mood } = req.body;
    const newFeeling = await Feeling.create({ userId: TEST_USER_ID, feelingText, mood });
    res.status(201).json(newFeeling);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Feeling जोड़ने में त्रुटि हुई!", error: error.message });
  }
};

export const getFeelings = async (req, res) => {
  try {
    const feelings = await Feeling.find({ userId: TEST_USER_ID }).sort({ createdAt: -1 });
    res.json(feelings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Feelings लोड करने में त्रुटि हुई!", error: error.message });
  }
};

export const deleteFeeling = async (req, res) => {
  try {
    await Feeling.findByIdAndDelete(req.params.id);
    res.json({ message: "Feeling हटाई गई!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Feeling delete करने में त्रुटि हुई!", error: error.message });
  }
};
