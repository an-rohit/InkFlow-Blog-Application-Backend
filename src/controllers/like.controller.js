import likeModel from "../models/like.model.js";
import postModel from "../models/post.model.js";
import userModel  from "../models/user.model.js";

import { postIdSchema } from "../validators/comment.validator.js";


export  const toggleLike= async(req,res)=>{
    try {
        const validationResult=await postIdSchema.safeParseAsync(req.params);

        if(!validationResult.success){
            return res.status(400).json({
                status:false,
                message:"Post Id is Invalid!!"
            })
        }

        const {id}=validationResult.data;

        const post =await postModel.findById(id);

        if(!post){
            return res.status(404).json({
                status:false,
                message:"Post Does Not Exist ! "
            })
        }

       

        const existingLike = await likeModel.findOne({ user: req.user.id, post: id });

        if (existingLike) {
            await likeModel.findByIdAndDelete(existingLike._id);
            const likeCount = await likeModel.countDocuments({ post: id });
            return res.status(200).json({
                status: true,
                message: "You disliked this post!",
                likeCount,
            });
        }

        await likeModel.create({
            user: req.user.id,
            post: id,
        });

        const likeCount = await likeModel.countDocuments({ post: id });
        return res.status(200).json({
            status: true,
            message: "You liked this post!",
            likeCount,
        });
} catch (error) {
        console.error(error);
        return res.status(500).json({
            status:false,
            message:"Internal Server Error "
        })
        
    }
};

export const getLikeCount=async(req,res)=>{
    try {
        const validationResult=await postIdSchema.safeParseAsync(req.params);

        if(!validationResult.success){
            return res.status(400).json({
                status:false,
                message:"Post Id is Invalid"
            })
        }

        const {id} = validationResult.data;
        const post = await postModel.findById(id);

        if(!post){
            return res.status(404).json({
                status:false,
                message:"Post Does Not Exist !"
            })
        }

        const likeCount=await likeModel.countDocuments({post:id});

        return res.status(200).json({
            status:true,
            message:"Total Likes are : ",
            likeCount
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status:false,
            message:"Internal Server Error"
        })
        
    }
};

export const checkUserLikedPost=async(req,res)=>{
    try {
        const validationResult=await postIdSchema.safeParseAsync(req.params);

        if(!validationResult.success){
            return res.status(400).json({
                status:false,
                message:"Post ID is Invalid ! "
            })
        }

        const {id}= validationResult.data;

        const post = await postModel.findById(id);

        if(!post){
            return res.status(404).json({
                status:false,
                message:"Post does not Exists "
            })
        }

        const UserLikedPost=await likeModel.findOne({user:req.user.id,post:id})

        return res.status(200).json({
            status:true,
            liked: !!UserLikedPost // !!=> used to create any value into boolean
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status:false,
            message:"Internal Server Error"
        })
        
    }
};

export const getAllLikedPosts=async(req,res)=>{
    try {
       const myLikedPosts=await likeModel.find({user: req.user.id}).populate({ path: "post", populate: { path: "author", select: "name email profileImage" } });

       //Find all Like documents where user equals logged-in user,
       // then replace post id with actual post data.

      return res.status(200).json({
        status:true,
        message:"Your Liked Posts",
        myLikedPosts,
       
      })


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status:false,
            message:"Internal Server Error "
        })
        
    }
}
