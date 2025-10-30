import Story from "../models/Story.js";
import User from "../models/User.js";

export const createStory = async (req, res) => {
  try {
    const { text, mediaUrl } = req.body;
    const user = req.user._id;
    const story = await Story.create({ user, text, mediaUrl });
    const pop = await Story.findById(story._id).populate("user", "name profilePicture");
    req.app.get("io").emit("story-created", pop);
    res.json(pop);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Create story failed" });
  }
};

export const getStories = async (req, res) => {
  try {
    // only active stories (TTL handles deletion) — return latest first
    const stories = await Story.find().sort({ createdAt: -1 }).populate("user", "name profilePicture");
    res.json(stories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetch stories failed" });
  }
};
