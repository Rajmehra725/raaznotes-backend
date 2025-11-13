const News = require("../models/News");

// Get all news
exports.getAllNews = async (req, res) => {
  try {
    const news = await News.find()
      .populate("author", "name")
      .populate("comments.user", "name")
      .sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create news
exports.createNews = async (req, res) => {
  const { title, description, imageUrl, location, category, tags } = req.body;
  try {
    const news = new News({
      title,
      description,
      imageUrl,
      location,
      category,
      tags,
      author: req.user._id
    });
    await news.save();
    await news.populate("author", "name");
    res.status(201).json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update news
exports.updateNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: "News not found" });

    if (news.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    Object.assign(news, req.body, { updatedAt: new Date() });
    await news.save();
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete news
exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: "News not found" });

    if (news.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await news.remove();
    res.json({ message: "News deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Like / Unlike
exports.toggleLike = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: "News not found" });

    const index = news.likes.indexOf(req.user._id);
    if (index === -1) news.likes.push(req.user._id);
    else news.likes.splice(index, 1);

    await news.save();
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add comment
exports.addComment = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: "News not found" });

    news.comments.push({ user: req.user._id, comment: req.body.comment });
    await news.save();
    await news.populate("comments.user", "name");
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Share news (increment share count)
exports.shareNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: "News not found" });

    news.shareCount += 1;
    await news.save();
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
