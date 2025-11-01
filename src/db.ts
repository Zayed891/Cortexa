
import mongoose from "mongoose";


const userSchema =new mongoose.Schema({
    email : {type:String, required:true, unique:true},
    password : {type: String, required: true},
    firstName : {type:String, required: true},
    lastName : {type: String, required:true},
});

const contentTypes = ['image','video','article','audio','youtube','twitter'];

const contentSchema = new mongoose.Schema({
    link : {type:String, required: true},
    type: {type: String, enum:contentTypes, required: true},
    title : {type : String},
    tags : [{type: mongoose.Types.ObjectId, ref: 'Tag'}],
    userId : {type: mongoose.Types.ObjectId, ref : 'User', required:true},
});

const tagSchema = new mongoose.Schema({
    title : {type : String, required: true, unique:true},
});

const linkSchema = new mongoose.Schema({
    hash : {type:String},
    userId : {type:mongoose.Types.ObjectId, ref: 'User', required: true},
});


export const userModel = mongoose.model('User',userSchema);
export const contentModel = mongoose.model('Content',contentSchema);
export const tagModel = mongoose.model('Tag',tagSchema);
export const linkModel = mongoose.model('Link',linkSchema);