import Feeling from "../models/Feeling.js";

export const addFeeling = async (req, res) => {
  try {
    const { feelingText, mood } = req.body;
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    const newFeeling = await Feeling.create({
      userId: req.user._id,
      feelingText,
      mood
    });
    res.status(201).json(newFeeling);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Feeling जोड़ने में त्रुटि हुई!", error: error.message });
  }
};

export const getFeelings = async (req, res) => {
  try {
    // if admin, optionally return all feelings; if user, return only user's feelings
    if (req.user.role === "admin") {
      const all = await Feeling.find().sort({ createdAt: -1 });
      return res.json(all);
    }
    const feelings = await Feeling.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(feelings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Feelings लोड करने में त्रुटि हुई!", error: error.message });
  }
};

export const deleteFeeling = async (req, res) => {
  try {
    const feeling = await Feeling.findById(req.params.id);
    if (!feeling) return res.status(404).json({ message: "Not found" });

    // allow delete if owner or admin
    if (req.user.role !== "admin" && !feeling.userId.equals(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await feeling.remove();
    res.json({ message: "Feeling हटाई गई!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Feeling delete करने में त्रुटि हुई!", error: error.message });
  }
};
