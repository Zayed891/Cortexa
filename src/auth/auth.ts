import jwt from "jsonwebtoken";
import { Request,Response, NextFunction, RequestHandler } from "express";
import { JWT_SECRET } from "../config/config";

export const userAuth: RequestHandler = (req,res,next) =>{
    try{
        const token = req.headers['authorization'];
        
        if(!token){
            res.status(411).json({
                message : "Please sign up!",
            })
            return;
        }

        const payload = jwt.verify(token as string, JWT_SECRET) ;

        if(!payload){
            res.status(411).json({
                message : "Please sign in again!",
            })
            return;
        }
        //@ts-ignore
        req.id = payload.id; // remember --> you have to override type of Request object of express.
        next();

    }catch(e){
        res.status(411).json({
            message : "Internal Server Error",
            error : e,
        })
    }
}

