import Post from "../models/post.model.js"
import User from "../models/user.model.js"
import Notiffication from "../models/notification.model.js"
import {v2 as cloudinary} from 'cloudinary';

export const createPost = async (req,res)=>{
  try {
    const {text, movieTitle, genre, director, synopsis} = req.body
    let {img} = req.body
    const userId = req.user._id
    const user = await User.findById(userId)
    if(!user) return res.status(404).json({error:"User not found"})
    if((!text && !img) || !movieTitle || !genre || !director || !synopsis){
      return res.status(400).json({error:"Lengkapi semua data film dan minimal text atau gambar!"})
    }
    if(img){
      const uploadResponse = await cloudinary.uploader.upload(img)
      img = uploadResponse.secure_url
    }
    const nePost = new Post({
      user: userId,
      text,
      img,
      movieTitle,
      genre,
      director,
      synopsis
    })
    await nePost.save()
    res.status(201).json(nePost)
  } catch (error) {
    console.log("error in the createPost func in post controller", error.message)
    res.status(500).json({error: "internal server error"})
  }
}

export const likeUnlikePost = async (req,res)=>{
  try {
    const userId = req.user._id
    const {id:postId} = req.params

    const post = await Post.findById(postId)
    if(!post) return res.status(404).json({error:"Post is not found"})
    
    const likedThePost = await post.likes.includes(userId)

    if(likedThePost){
      // unlike
      await Post.updateOne({_id:postId},{$pull:{likes:userId}})
      await User.updateOne({_id:userId},{$pull:{likedPosts:postId}})

      // When we unlike a post we remove the userId from the likes array in the post
      const updatedLikes = post.likes.filter((id)=> id.toString() !== userId.toString())
      res.status(200).json(updatedLikes)
    }else{
      //like
      post.likes.push(userId)
      await User.updateOne({_id:userId},{$push:{likedPosts:postId}})
      await post.save()

      // send notification
      const notification = new Notiffication({
        from: userId,
        to: post.user,
        type: "like"
      })
      await notification.save()

      const updatedLikes = post.likes
      res.status(200).json(updatedLikes)
    }


  } catch (error) {
    console.log("error in the likeUnlikePost func in post controller", error.message)
    res.status(500).json({error: "internal server error"})
  }
}

export const commentOnPost = async (req,res)=>{
  try {
    const {text} = req.body
    const postId = req.params.id
    const userId = req.user._id

    if(!text) return res.status(400).json({error:"Text field is required"})

    const post = await Post.findById(postId)


    if(!post) return res.status(404).json({error:"Post is not found"})

    const comment = {user:userId, text}

    post.comments.push(comment)

    await post.save()
    // const updatedComments = post.comments
    const updatedPosts = await Post.findById(postId).populate({
      path: "user",
      select: "-password"
    })
    .populate({
      path: "comments.user",
      select: "-password"
    })

    res.status(200).json(updatedPosts)

  } catch (error) {
    console.log("error in the commentOnPost func in post controller", error.message)
    res.status(500).json({error: "internal server error"})
  }
}

export const deletePost = async (req,res)=>{
  try {
    const post = await Post.findById(req.params.id)
    console.log(post)
    if(!post) return res.status(404).json({error:"Post not found"})

    if(post.user.toString() !== req.user._id.toString()){
      return res.status(401).json({error:"You are not autharized to delete this post"})
    }

    if(post.img){
      const imgId = post.img.split("/").pop().split(".")[0]
      await cloudinary.uploader.destroy(imgId)  
    }

    await Post.findByIdAndDelete(req.params.id)
    res.status(200).json({message: "Post deleted successfully"})

  } catch (error) {
    console.log("error in the deletePost func in post controller", error.message)
    res.status(500).json({error: "internal server error"})
  }
}

export const getAllPosts = async (req,res)=>{
  try {
    const posts = await Post.find().sort({ createdAt: -1})
    .populate({
      path: "user",
      select: "-password"
    })
    .populate({
      path: "comments.user",
      select: "-password"
    })


    if(posts.length === 0 ){
      return res.status(200).json([])
    }

    res.status(200).json(posts)
  } catch (error) {
    console.log("error in the getAllPosts func in post controller", error.message)
    res.status(500).json({error: "internal server error"})
  }
}

export const getLikedPosts = async (req,res)=>{
  const userId = req.params.id
  try {
    const user = await User.findById(userId)
    if(!user) return res.status(404).json({error:"User not found"})

    const likedPosts = await Post.find({_id: {$in:user.likedPosts}})
    .sort({ createdAt: -1})
    .populate({
      path: "user",
      select: "-password"
    })
    .populate({
      path: "comments.user",
      select: "-password"
    })

    res.status(200).json(likedPosts)

  } catch (error) {
    console.log("error in the getLikedPosts func in post controller", error.message)
    res.status(500).json({error: "internal server error"})
  }
}

export const getFollowingPosts = async (req,res)=>{
  try {
    const userId = req.user._id
    const user = await User.findById(userId)

    if(!user) return res.status(404).json({error:"User not found"})
    
    const followeing = user.followeing

    const feedPosts = await Post.find({user: {$in: followeing}})    
    .sort({ createdAt: -1})
    .populate({
      path: "user",
      select: "-password"
    })
    .populate({
      path: "comments.user",
      select: "-password"
    })

    res.status(200).json(feedPosts)
  } catch (error) {
    console.log("error in the getFollowingPosts func in post controller", error.message)
    res.status(500).json({error: "internal server error"})
  }
}

export const getUserPosts = async (req,res)=>{
  try {
    const {username} = req.params 
    const user = await User.findOne({username})
    if(!user) return res.status(404).json({error:"User not found"})
    
    const userPosts = await Post.find({user: {$in:user._id}})
    .sort({ createdAt: -1})
    .populate({
      path: "user",
      select: "-password"
    })
    .populate({
      path: "comments.user",
      select: "-password"
    })

    res.status(200).json(userPosts)

  } catch (error) {
    console.log("error in the getUserPosts func in post controller", error.message)
    res.status(500).json({error: "internal server error"})
  }
}

export const ratePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;
    const { value } = req.body;
    if (!value || value < 1 || value > 5) {
      return res.status(400).json({ error: "Rating harus 1-5" });
    }
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post tidak ditemukan" });
    // Cek apakah user sudah pernah memberi rating
    const existing = post.ratings.find(r => r.user.toString() === userId.toString());
    if (existing) {
      existing.value = value;
    } else {
      post.ratings.push({ user: userId, value });
    }
    // Hitung rata-rata
    const total = post.ratings.reduce((sum, r) => sum + r.value, 0);
    post.avgRating = total / post.ratings.length;
    await post.save();
    res.json({ avgRating: post.avgRating });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPostDetail = async (req, res) => {
  try {
    const postId = req.params.id;
    
    const post = await Post.findById(postId)
      .populate({ 
        path: 'user', 
        select: 'username fullname profileImg' 
      })
      .populate({ 
        path: 'comments.user', 
        select: 'username fullname profileImg' 
      })
      .populate({
        path: 'likes',
        select: 'username fullname profileImg'
      })
      .populate({
        path: 'ratings.user',
        select: 'username fullname profileImg'
      })
      .lean();

    if (!post) {
      return res.status(404).json({ error: 'Post tidak ditemukan' });
    }

    // Menghitung ulang rata-rata rating
    if (post.ratings && post.ratings.length > 0) {
      const total = post.ratings.reduce((sum, r) => sum + r.value, 0);
      post.avgRating = (total / post.ratings.length).toFixed(1);
    }

    res.status(200).json(post);
  } catch (error) {
    console.error('Error in getPostDetail:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Mendapatkan daftar judul film unik yang pernah diupdate user
export const getMovieRecommendations = async (req, res) => {
  try {
    // Ambil 20 film terbaru berdasarkan post
    const movies = await Post.find({}, { movieTitle: 1, genre: 1, _id: 0 })
      .sort({ createdAt: -1 })
      .limit(20);
    // Filter agar judul tidak duplikat
    const unique = [];
    const seen = new Set();
    for (const m of movies) {
      if (!seen.has(m.movieTitle)) {
        unique.push(m);
        seen.add(m.movieTitle);
      }
    }
    res.json(unique);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil rekomendasi film' });
  }
};

export const getPostsByMovieTitle = async (req, res) => {
  try {
    const { movieTitle } = req.query;
    if (!movieTitle) {
      return res.status(400).json({ error: 'movieTitle query is required' });
    }
    // Ubah regex agar partial match dan case-insensitive
    const posts = await Post.find({ movieTitle: { $regex: movieTitle, $options: 'i' } })
      .sort({ createdAt: -1 })
      .populate({ path: 'user', select: '-password' })
      .populate({ path: 'comments.user', select: '-password' });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};