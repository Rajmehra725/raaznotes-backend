import Post from "../models/Post.js";
import User from "../models/User.js";

// create post
export const createPost = async (req, res) => {
  try {
    const { content, feelingType, mediaUrl } = req.body;
    const author = req.user._id;
    const post = await Post.create({ author, content, feelingType, mediaUrl });
    // populate for response
    const populated = await Post.findById(post._id).populate("author", "name profilePicture role");
    // emit via socket
    const io = req.app.get("io");
    io.emit("post-created", populated);
    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Create post failed" });
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
