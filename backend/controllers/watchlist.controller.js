import User from "../models/user.model.js";
import Post from "../models/post.model.js";

// Get watchlist
const getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "watchlist",
        select: "movieTitle img genre avgRating year director synopsis"
      });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ watchlist: user.watchlist || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle watchlist (add/remove)
const toggleWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { postId } = req.body;
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!postId) return res.status(400).json({ error: "postId is required" });

    const idx = user.watchlist.findIndex(id => id.toString() === postId);
    if (idx === -1) {
      user.watchlist.push(postId);
    } else {
      user.watchlist.splice(idx, 1);
    }
    await user.save();
    await user.populate({
      path: "watchlist",
      select: "movieTitle img genre avgRating year director synopsis"
    });
    res.status(200).json({ watchlist: user.watchlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle like (love)
const toggleLike = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({ error: "postId is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      // Add like
      post.likes.push(userId);
    } else {
      // Remove like
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    res.status(200).json({ likes: post.likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { getWatchlist, toggleWatchlist, toggleLike };
