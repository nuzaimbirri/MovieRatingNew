import User from "../models/user.model.js";
import Post from "../models/post.model.js";

// Get watchlist
const getWatchlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .populate({
        path: "watchlist",
        select: "movieTitle img genre avgRating year director synopsis"
      });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ watchlist: user.watchlist || [] });
  } catch (err) {
    console.error("Error in getWatchlist:", err);
    res.status(500).json({ error: err.message });
  }
};

// Toggle watchlist (add/remove)
const toggleWatchlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({ error: "postId is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const postIndex = user.watchlist.indexOf(postId);

    if (postIndex === -1) {
      // Add to watchlist
      user.watchlist.push(postId);
    } else {
      // Remove from watchlist
      user.watchlist.splice(postIndex, 1);
    }

    await user.save();
    await user.populate("watchlist");

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
