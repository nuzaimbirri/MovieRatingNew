import express from "express";
import { protectRoute } from "../middleWare/protectRoute.js";
import { getWatchlist, toggleWatchlist, toggleLike } from "../controllers/watchlist.controller.js";

const router = express.Router();

// Routes
router.get("/", protectRoute, getWatchlist);
router.post("/toggle", protectRoute, toggleWatchlist);
router.post("/like", protectRoute, toggleLike);

export default router;
