import News from "../models/News.js";
import cloudinary from "../config/cloudinary.js"; // Cloudinary config
import streamifier from "streamifier";

// ✅ Get all news
export const getAllNews = async (req, res) => {
  try {
    const news = await News.find()
      .sort({ createdAt: -1 })
      .populate("author", "name email");
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Helper: Upload file buffer to Cloudinary
const uploadToCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "news_images" },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// ✅ Create news
export const createNews = async (req, res) => {
  try {
    const { title, description, location, category, tags } = req.body;
    let imageUrl = "";

    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    const news = await News.create({
      title,
      description,
      location,
      category,
      tags: tags ? tags.split(",").map(t => t.trim()) : [],
      imageUrl,
      author: req.user._id,
    });

    res.status(201).json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update news
export const updateNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: "News not found" });

    // Only author can update
    if (news.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const { title, description, location, category, tags } = req.body;

    news.title = title || news.title;
    news.description = description || news.description;
    news.location = location || news.location;
    news.category = category || news.category;
    news.tags = tags ? tags.split(",").map(t => t.trim()) : news.tags;

    if (req.file) {
      news.imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    await news.save();
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete news
export const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: "News not found" });

    if (news.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await news.remove();
    res.json({ message: "News deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Like / Unlike news
export const toggleLike = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: "News not found" });

    const userId = req.user?._id?.toString();
    if (!news.likes) news.likes = [];

    if (userId && news.likes.includes(userId)) {
      news.likes = news.likes.filter(id => id !== userId); // unlike
    } else if (userId) {
      news.likes.push(userId);
    }

    await news.save();
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Add comment
export const addComment = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: "News not found" });

    const comment = {
      user: req.user?._id || null, // optional for public
      comment: req.body.comment,
      createdAt: new Date(),
    };

    if (!news.comments) news.comments = [];
    news.comments.push(comment);

    await news.save();
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Share news
export const shareNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: "News not found" });

    news.shareCount = news.shareCount ? news.shareCount + 1 : 1;
    await news.save();

    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
