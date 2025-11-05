import User from "../models/User.js";

export const followUser = async (req, res) => {
  try {
    const { id } = req.params; // user to follow
    const currentUser = await User.findById(req.user._id);
    const targetUser = await User.findById(id);

    if (!targetUser) return res.status(404).json({ message: "User not found" });
    if (currentUser._id.equals(id))
      return res.status(400).json({ message: "You cannot follow yourself" });

    if (currentUser.following.includes(id))
      return res.status(400).json({ message: "Already following this user" });

    currentUser.following.push(id);
    targetUser.followers.push(currentUser._id);

    await currentUser.save();
    await targetUser.save();

    res.json({ message: "✅ Followed successfully", following: currentUser.following });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = await User.findById(req.user._id);
    const targetUser = await User.findById(id);

    if (!targetUser) return res.status(404).json({ message: "User not found" });

    currentUser.following = currentUser.following.filter(
      (uid) => uid.toString() !== id
    );
    targetUser.followers = targetUser.followers.filter(
      (uid) => uid.toString() !== req.user._id.toString()
    );

    await currentUser.save();
    await targetUser.save();

    res.json({ message: "❌ Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFollowersFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("followers", "name email avatar")
      .populate("following", "name email avatar");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      followers: user.followers,
      following: user.following,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
