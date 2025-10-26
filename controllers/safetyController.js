import Safety from "../models/Safety.js";

export const getSafetyTips = async (req, res) => {
  try {
    const tips = await Safety.find().sort({ createdAt: -1 });
    res.json(tips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addSafetyTip = async (req, res) => {
  try {
    const { title, content } = req.body;
    const tip = await Safety.create({ title, content });
    res.status(201).json(tip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
