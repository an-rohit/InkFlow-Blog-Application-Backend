import express from "express";


import { UserAuthMidlleware } from "../middlewares/auth.middleware.js";
import { toggleLike,getLikeCount,checkUserLikedPost,getAllLikedPosts } from "../controllers/like.controller.js";



const router =express.Router();


router.post("/post/:id/like",UserAuthMidlleware,toggleLike);
router.get("/post/:id/likes/count", getLikeCount);
router.get("/post/:id/liked", UserAuthMidlleware, checkUserLikedPost);
router.get("/post/liked/me",UserAuthMidlleware,getAllLikedPosts);


export default router;