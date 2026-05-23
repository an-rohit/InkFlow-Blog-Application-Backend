import express from "express";

import {UserAuthMidlleware} from "../middlewares/auth.middleware.js";
import { saveBookmark,getUserBookmark } from "../controllers/bookmark.controller.js";

const router = express.Router();


router.patch("/post/:id/bookmark",UserAuthMidlleware,saveBookmark);
router.get("/post/bookmarks/me",UserAuthMidlleware,getUserBookmark);

export default router;