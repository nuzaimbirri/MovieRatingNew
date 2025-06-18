import express from "express"
import { protectRoute } from "../middleWare/protectRoute.js";
import { commentOnPost, createPost, deletePost, getAllPosts, getFollowingPosts, getLikedPosts, getUserPosts, likeUnlikePost, ratePost,getPostDetail, getMovieRecommendations, getPostsByMovieTitle } from "../controllers/post.controller.js";

const router = express.Router();

router.get("/all",protectRoute,getAllPosts)
router.get("/following",protectRoute,getFollowingPosts)
router.get("/likes/:id",protectRoute,getLikedPosts)
router.get("/user/:username",protectRoute,getUserPosts)
router.post("/create",protectRoute,createPost)
router.post("/like/:id",protectRoute,likeUnlikePost)
router.post("/comment/:id",protectRoute,commentOnPost)
router.post("/rate/:id", protectRoute, ratePost)
router.delete("/:id",protectRoute,deletePost)
router.get("/detail/:id", protectRoute, getPostDetail)
router.get("/movies", getMovieRecommendations);
router.get("/searchByMovie", protectRoute, getPostsByMovieTitle);


export default router