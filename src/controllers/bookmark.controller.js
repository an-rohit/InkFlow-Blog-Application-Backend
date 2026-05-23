import bookmarkModel from "../models/bookmark.model.js";
import postModel from "../models/post.model.js";

import {validatePostIdSchema} from "../validators/post.validator.js"

export const saveBookmark=async(req,res)=>{
    try {
        const user = req.user.id;
        const validationResult=await validatePostIdSchema.safeParseAsync(req.params);
if(!validationResult.success){
    return res.status(400).json({
        status:false,
        message:"post ID is Invalid"
    })
}
 const {id}=validationResult.data;
const post = await postModel.findById(id);

if(!post){
    return res.status(404).json({
        status:false,
        message:"Post Not Found "
    })
}

const bookmark=await bookmarkModel.findOne({
    user:user,
    post:id
});
if(bookmark){
    await bookmarkModel.findOneAndDelete({
        user,
        post:id
    });
    return res.status(200).json({
    status:true,
    message:"Bookmark removed"
})
}
await bookmarkModel.create({
    user,
    post:id
    })
return res.status(201).json({
        status:true,
        message:"Bookmark saved"
    })
 } catch (error) {
        console.error(error);
        return res.status(500).json({
            status:false,
            message:"Internal Server Error"
        })
    }
};;
export const getUserBookmark=async(req,res)=>{
    try {
        const user = req.user.id;
        const page=Number(req.query.page) || 1;
        const limit =Number(req.query.limit) || 10;


        const skip=(page-1)* limit ;

        if(!user){
            return res.status(403).json({
                status:false,
                message:"User is not Authorized"
            })
        }

        const userBookmarks=await bookmarkModel.find({user}).sort({createdAt:-1}).skip(skip).limit(limit)
        .populate({ path: "post", populate: { path: "author", select: "name email profileImage" } });

        const totalBookmarks=await bookmarkModel.countDocuments({user});
        const totalPages=Math.ceil(totalBookmarks/limit);

        return res.status(200).json({
            status:true,
            message:"Here are all your Bookmarked Posts",
            userBookmarks,

            pagination:{
                currentPage:page,
                totalBookmarks,
                totalPages,
                limit:limit,

            }
        })

        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status:false,
            message:"Internal Server Error "
        })
    }
}