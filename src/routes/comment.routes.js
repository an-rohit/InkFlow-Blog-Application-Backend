import express from "express";
import { UserAuthMidlleware } from "../middlewares/auth.middleware.js";
import { comments , getPostComments,updateComment,deleteComment} from "../controllers/comment.controller.js";

const router =express.Router();



router.post("/post/:id/comment",UserAuthMidlleware,comments);

router.get("/post/:id/comment", getPostComments);

router.put("/comment/:id",UserAuthMidlleware,updateComment);

router.delete("/comment/:id",UserAuthMidlleware,deleteComment);


export default router;
