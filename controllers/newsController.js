import News from "../models/News.js";

// ✅ Create News
export const createNews = async (req, res) => {
  try {
    const { title, description, location, category, tags } = req.body;

    // Debug logs
    console.log("REQ.BODY:", req.body);
    console.log("REQ.FILE:", req.file);

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const news = await News.create({
      title,
      description,
      location: location || "",
      category: category || "",
      tags: tags ? tags.split(",").map(t => t.trim()) : [],
      imageUrl: req.file?.path || "",
      author: req.user._id
    });

    res.status(201).json(news);
  } catch (err) {
    console.error("CREATE NEWS ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

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

// ✅ Update News
export const updateNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: "News not found" });

    if (news.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const { title, description, location, category, tags } = req.body;

    news.title = title || news.title;
    news.description = description || news.description;
    news.location = location || news.location;
    news.category = category || news.category;
    news.tags = tags ? tags.split(",").map(t => t.trim()) : news.tags;
    news.imageUrl = req.file?.path || news.imageUrl;

    await news.save();
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete News
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

// ✅ Like / Unlike
export const toggleLike = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: "News not found" });

    const userId = req.user?._id.toString();
    if (!news.likes) news.likes = [];

    if (userId && news.likes.includes(userId)) {
      news.likes = news.likes.filter(id => id !== userId);
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

// ✅ Add Comment
export const addComment = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: "News not found" });

    const comment = {
      user: req.user?._id || null,
      comment: req.body.comment,
      createdAt: new Date(),
    };

    news.comments = news.comments || [];
    news.comments.push(comment);

    await news.save();
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Share News
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
