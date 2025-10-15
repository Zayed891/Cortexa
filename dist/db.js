"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkModel = exports.tagModel = exports.contentModel = exports.userModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
});
const contentTypes = ['image', 'video', 'article', 'audio'];
const contentSchema = new mongoose_1.default.Schema({
    link: { type: String, required: true },
    type: { type: String, enum: contentTypes, required: true },
    title: { type: String },
    tags: [{ type: mongoose_1.default.Types.ObjectId, ref: 'Tag' }],
    userId: { type: mongoose_1.default.Types.ObjectId, ref: 'User', required: true },
});
const tagSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true, unique: true },
});
const linkSchema = new mongoose_1.default.Schema({
    hash: { type: String },
    userId: { type: mongoose_1.default.Types.ObjectId, ref: 'User', required: true },
});
exports.userModel = mongoose_1.default.model('User', userSchema);
exports.contentModel = mongoose_1.default.model('Content', contentSchema);
exports.tagModel = mongoose_1.default.model('Tag', tagSchema);
exports.linkModel = mongoose_1.default.model('Link', linkSchema);
//# sourceMappingURL=db.js.map