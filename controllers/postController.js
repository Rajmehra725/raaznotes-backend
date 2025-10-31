import Post from "../models/Post.js";
import User from "../models/User.js";

// create post
export const createPost = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    const { content, feelingType } = req.body;

    // ✅ handle file upload
    let mediaUrl = "";
    if (req.file) {
      // Local URL — later replace with Cloudinary
      mediaUrl = `/uploads/${req.file.filename}`;
    }

    if (!content && !mediaUrl) {
      return res.status(400).json({ message: "Please add text or media" });
    }

    const post = await Post.create({
      author: req.user._id,
      content,
      feelingType,
      mediaUrl,
    });

    const populated = await Post.findById(post._id).populate(
      "author",
      "name profilePicture role"
    );

    const io = req.app.get("io");
    if (io) io.emit("post-created", populated);

    res.status(201).json(populated);
  } catch (err) {
    console.error("❌ Create Post Error:", err);
    res.status(500).json({ message: "Create post failed", error: err.message });
  }
};


// get feed (all posts)
export const getFeed = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate("author", "name profilePicture role");
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetch feed failed" });
  }
};

// get posts by user
export const getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId }).sort({ createdAt: -1 }).populate("author", "name profilePicture role");
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetch user's posts failed" });
  }
};

// update post (author or admin)
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    // only author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }
    post.content = req.body.content ?? post.content;
    post.mediaUrl = req.body.mediaUrl ?? post.mediaUrl;
    post.feelingType = req.body.feelingType ?? post.feelingType;
    await post.save();
    const populated = await Post.findById(post._id).populate("author","name profilePicture role");
    req.app.get("io").emit("post-updated", populated);
    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};

// delete post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }
    await post.remove();
    req.app.get("io").emit("post-deleted", { id: req.params.id });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
};
