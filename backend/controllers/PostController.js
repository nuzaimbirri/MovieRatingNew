const Post = require('../models/Post');
const User = require('../models/User');

exports.getDetailPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username profileImg')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username profileImg' },
        options: { sort: { createdAt: -1 } }
      })
      .populate('ratings.user', 'username profileImg');

    if (!post) {
      return res.status(404).json({ error: 'Film tidak ditemukan' });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text?.trim()) {
      return res.status(400).json({ error: 'Komentar tidak boleh kosong' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Film tidak ditemukan' });
    }

    const comment = {
      text,
      user: req.user._id,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    const populatedPost = await post.populate('comments.user', 'username profileImg');
    const newComment = populatedPost.comments[populatedPost.comments.length - 1];

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.addRating = async (req, res) => {
  try {
    const { value } = req.body;
    
    if (!value || value < 1 || value > 5) {
      return res.status(400).json({ error: 'Rating harus antara 1-5' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Film tidak ditemukan' });
    }

    const ratingIndex = post.ratings.findIndex(
      r => r.user.toString() === req.user._id.toString()
    );

    if (ratingIndex > -1) {
      post.ratings[ratingIndex].value = value;
    } else {
      post.ratings.push({ user: req.user._id, value });
    }

    // Hitung rata-rata rating
    const sum = post.ratings.reduce((acc, curr) => acc + curr.value, 0);
    post.avgRating = sum / post.ratings.length;

    await post.save();
    await post.populate('ratings.user', 'username profileImg');

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
