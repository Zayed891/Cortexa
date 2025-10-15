import express, { response } from "express";
import z from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { contentModel, userModel } from "./db";
import { JWT_SECRET } from "./config/config";
import { userAuth } from "./auth/auth";

const app = express();

app.use(express.json());

app.post('/api/v1/signup', async(req,res)=>{
    const userSchema = z.object({
        email : z.string().min(3).max(8),
        password : z.string().min(8).max(20),
        firstName : z.string().min(5).max(10),
        lastName : z.string().min(5).max(10),
    });

    const parsedResult = userSchema.safeParse(req.body);

    if(!parsedResult.success){
        res.status(411).json({
            msg : "Please input correct credentials",
            errors : parsedResult.error,
        });
        return;
    }

    const {email,password,firstName,lastName} = parsedResult.data ;

    try{
        const alreadyExist = await userModel.findOne({email});

        if(alreadyExist){
            res.status(403).json({
                message : "User already exists",
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password,5);

        await userModel.create({
            email : email,
            password: hashedPassword,
            firstName : firstName,
            lastName :lastName,
        });

        res.status(200).json({
            message : "User Signed up successfully",
        });
    }catch(e){
        res.status(500).json({message : "Internal Server Error", error : e});
    }
})

app.post("/api/v1/signin" , async(req,res)=>{
    const requiredBody = z.object({
        email : z.string().min(3).max(10),
        password : z.string().min(8).max(20),
    })

    const parsedResult = requiredBody.safeParse(req.body);

    if(!parsedResult.success){
        res.status(411).json({
            message : "Enter the correct credentials",
            error : parsedResult.error,
        });
        return;
    }

    const {email ,password} = parsedResult.data ;

    try{
        const user = await userModel.findOne({email});

        if(!user){
            res.status(401).json({
                message : "Please sign up!",
            })
            return;
        }

        const correctCredentials = await bcrypt.compare(password,user.password);

        if(!correctCredentials){
            res.status(411).json({
                message : "Please input the correct credentials",
            })
        }

        const authorization = jwt.sign({
            id: user._id,
        },JWT_SECRET);

        response.status(200).json({
            message : "You have successfully signed up!",
            authorization,
        })

    }catch(e){
        res.status(500).json({
            message : "Internal Server Error",
            error : e,
        })
    }
})

app.post("/api/v1/content", userAuth, async(req,res)=>{
    const contentSchema = z.object({
        link : z.string(),
        type : z.string(),
        title : z.string(),
    });

    const parsedResult = contentSchema.safeParse(req.body);

    if(!parsedResult.success){
        res.status(411).json({
            message : "Wrong Inputs",
            error : parsedResult.error,
        })
        return;
    }

    //@ts-ignore
    const userId = req.id ;

    const {link,type,title} = parsedResult.data;

    try {
        const newContent = await contentModel.create({
            link : link,
            type : type,
            title : title,
            tags : [],
            userId : userId
        });

        res.status(200).json({
            message : "Content Created Successfully",
            contentId : newContent._id,
        });
    }catch(e){
        res.status(500).json({
            message : "Internal Server Error",
            error : e,
        })
    }

})

app.get("/api/v1/content" , userAuth, async(req,res)=>{
    try{
      //@ts-ignore
      const userId = req.id;
      const contents = await contentModel.find({
        userId : userId,
      }).populate("userId", "email");

      res.status(200).json({
        contents : contents,
      })

    }catch(e){
        res.status(500).json({
            message : "Internal Error",
            error : e,
        })
    }

})

app.delete("/api/v1/content", userAuth, async(req,res)=>{
    const contentId = req.body.contentId;

    try{
        const response = await contentModel.deleteMany({
        contentId,
        //@ts-ignore
        userId : req.id,
    })

    if((!response.acknowledged) && (response.deletedCount==0)){
        res.status(411).json({
            message : "No content found to delete",
        })
        return;
    }

    res.status(200).json({
        message : "Deleted",
    })
    }catch (e){
        res.status(500).json({
            message : "Internal Error",
            error : e,
        })
    }
})



