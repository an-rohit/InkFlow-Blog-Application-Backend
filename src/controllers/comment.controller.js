import commentModel from "../models/comment.model.js";
import userModel from "../models/user.model.js";
import postModel from "../models/post.model.js";
import { commentIdSchema, commentPostBodySchema, postIdSchema } from "../validators/comment.validator.js";




export const comments=async(req ,res)=>{
    try {
       const  validationResult=await postIdSchema.safeParseAsync(req.params);
       
       if(!validationResult.success){
        return res.status(400).json({
            status:false,
            message:"Post Id is not valid "
            
        })
       }
       const {id} =validationResult.data;

       const validationData=await commentPostBodySchema.safeParseAsync(req.body);

       if(!validationData.success){
        return res.status(400).json({
            status:false,
            message:"write the Comment again !!!"
        })
       }
       const {content}=validationData.data;

       const post = await postModel.findById(id);

       if(!post){
        return res.status(404).json({
            status:false,
            message:"Post does not Exist !!!"
        })
       }

       const user =req.user.id;

      const commentData=await commentModel.create({
        content,
        author:user,
        post:id,
      });

      return res.status(201).json({
        status:true,
        message:"comment added Successfully !!",
        commentData,
      })

        
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status:false,
        message:"Internal Server Error"
      })

        
    }
};

export const getPostComments=async(req,res)=>{
    try {
        const validationResult= await postIdSchema.safeParseAsync(req.params);

    if(!validationResult.success){
        return res.status(400).json({
            status:false,
            message:"Post ID Invalid !!"
        })
    }
    const {id}=validationResult.data;

    const postExist=await postModel.findById(id);
    if(!postExist){
        return res.status(404).json({
            status:false,
            message:"Post Does not Exist!"
        })
    }
  
    //pagination introduction 
    const page=Number(req.query.page) || 1;
    const limit=Number(req.query.limit) || 10;
    //skip formula 
    const skip=(page-1) * limit;

    const postComment = await commentModel.find({post:id}).sort({createdAt:-1}).skip(skip).limit(limit).populate("author","name profileImage");

    const totalItems=await commentModel.countDocuments({post:id});
    const totalPages= Math.ceil(totalItems/limit);


    if(postComment.length===0){
        return res.status(404).json({
            status:false,
            message:"Post Does not have any Comment!"
        })
    }

    return res.status(200).json({
        status:true,
        message:"HEre all your comments",
        postComment,

        pagination:{
            currentPage:page,
            totalItems,
            totalPages,
            limit
        }
    })

 } catch (error) {
        console.error(error);
        return res.status(500).json({
            status:false,
            message:"Internal Server Error !!"
        })
        
    }

};


export const updateComment=async(req,res)=>{
    try {
        const validationResult=await commentIdSchema.safeParseAsync(req.params);

        if(!validationResult.success){
            return res.status(400).json({
                status:false,
                message:"Comment Id is Invalid !"
            })
        }
       
        const {id} = validationResult.data;

        const validationData = await commentPostBodySchema.safeParseAsync(req.body);

        if(!validationData.success){
            return res.status(400).json({
                status:false,
                message:"Write the Content Properly !!!"
            })
        }

        const {content}= validationData.data;

        const comment=await commentModel.findById(id);

        if(!comment){
            return res.status(404).json({
                status:false,
                message:"Comment not found !!!"
            })
        }

        if(comment.author.toString()!==req.user.id){
        return res.status(403).json({
            status:false,
            message:"You are not authorized to update the comment"
        })
            
        }

       comment.content=content;
       await comment.save();


        return res.status(200).json({
            status:true,
            message:"Comment Updated Successfully !!!"
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status:false,
            message:"Internal Server Error !!!"
        })
        
    }
};

export const deleteComment=async(req,res)=>{
    try {
        const validationResult=await commentIdSchema.safeParseAsync(req.params);

        if(!validationResult.success){
            return res.status(400).json({
                status:false,
                message:"Invalid Comment Id"
            })
        }

        const {id} = validationResult.data;

        const comment=await commentModel.findById(id);

        if(!comment){
            return res.status(404).json({
                status:false,
                message:"There is no such comment"
            })
        }

        if(comment.author.toString()!==req.user.id){
            return res.status(403).json({
                status:false,
                message:"You are not authorized !!"
            })
        }

        await commentModel.findByIdAndDelete(id);

        return res.status(200).json({
            status:true,
            message:"Comment Deleted Successfully !! "
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status:false,
            message:"Internal Server Error"
        })
        
    }
}