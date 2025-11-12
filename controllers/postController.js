import Post from "../models/Post.js";
import User from "../models/User.js";
import { cloudinary } from "../config/cloudinary.js";

/* --------------------------------------------------------
   ✅ CREATE POST
-------------------------------------------------------- */
export const createPost = async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ message: "Unauthorized" });

    const { content, feelingType } = req.body;
    let mediaUrl = "";

    if (req.file?.path) mediaUrl = req.file.path;

    if (!content && !mediaUrl)
      return res.status(400).json({ message: "Please add text or media" });

    const post = await Post.create({
      author: req.user._id,
      content,
      feelingType,
      mediaUrl,
    });

    const populated = await Post.findById(post._id)
      .populate("author", "name profilePicture role")
      .populate("comments.user", "name profilePicture");

    req.app.get("io")?.emit("post-created", populated);
    res.status(201).json(populated);
  } catch (err) {
    console.error("❌ Create Post Error:", err);
    res.status(500).json({ message: "Create post failed", error: err.message });
  }
};

/* --------------------------------------------------------
   ✅ GET FEED
-------------------------------------------------------- */
export const getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("author", "name avatar role")
      .populate("comments.user", "name avatar");
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetch feed failed in" });
  }
};


/* --------------------------------------------------------
   ✅ GET POSTS BY USER
-------------------------------------------------------- */
export const getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("author", "name profilePicture role")
      .populate("comments.user", "name profilePicture");
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetch user's posts failed" });
  }
};

/* --------------------------------------------------------
   ✅ UPDATE POST
-------------------------------------------------------- */
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    post.content = req.body.content ?? post.content;
    post.mediaUrl = req.body.mediaUrl ?? post.mediaUrl;
    post.feelingType = req.body.feelingType ?? post.feelingType;

    await post.save();
    const populated = await Post.findById(post._id)
      .populate("author", "name profilePicture role")
      .populate("comments.user", "name profilePicture");

    req.app.get("io")?.emit("post-updated", populated);
    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* --------------------------------------------------------
   ✅ DELETE POST (+ Cloudinary media)
-------------------------------------------------------- */
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // Delete media from Cloudinary (if exists)
    if (post.mediaUrl?.includes("cloudinary.com")) {
      try {
        const parts = post.mediaUrl.split("/");
        const lastPart = parts[parts.length - 1];
        const public_id = lastPart.split(".")[0];
        await cloudinary.uploader.destroy(`lyf_media/${public_id}`, {
          resource_type: "auto",
        });
      } catch (cloudErr) {
        console.error("⚠️ Cloudinary delete failed:", cloudErr.message);
      }
    }

    await post.deleteOne();
    req.app.get("io")?.emit("post-deleted", { id: req.params.id });
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Post Error:", err);
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};

/* --------------------------------------------------------
   ❤️ LIKE / UNLIKE POST
-------------------------------------------------------- */
export const likePost = async (req, res) => {
  try {
    const userId = req.user?._id;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.includes(userId);
    post.likes = alreadyLiked
      ? post.likes.filter((id) => id.toString() !== userId.toString())
      : [...post.likes, userId];

    await post.save();
    const populated = await Post.findById(post._id)
      .populate("author", "name profilePicture role")
      .populate("comments.user", "name profilePicture");

    req.app
      .get("io")
      ?.emit("post-liked", { postId: post._id, likes: populated.likes });

    res.json(populated);
  } catch (err) {
    console.error("Like error:", err);
    res.status(500).json({ message: "Like operation failed" });
  }
};

/* --------------------------------------------------------
   💬 ADD COMMENT
-------------------------------------------------------- */
export const addComment = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Comment required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = { user: userId, text: text.trim(), createdAt: new Date() };
    post.comments.push(comment);
    await post.save();

    const populatedPost = await Post.findById(post._id).populate("comments.user", "name profilePicture");
    const newComment = populatedPost.comments[populatedPost.comments.length - 1];

    req.app.get("io")?.emit("comment-added", { postId: post._id, comment: newComment });
    res.status(201).json(newComment);
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Add comment failed" });
  }
};

/* --------------------------------------------------------
   ❌ DELETE COMMENT (NEWLY ADDED)
-------------------------------------------------------- */
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Only author of comment or post author can delete
    if (
      comment.user.toString() !== req.user._id.toString() &&
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.deleteOne();
    await post.save();

    req.app.get("io")?.emit("comment-deleted", { postId, commentId });
    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ message: "Delete comment failed" });
  }
};
