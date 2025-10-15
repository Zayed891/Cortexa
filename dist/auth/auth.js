"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const userAuth = (req, res, next) => {
    try {
        const token = req.headers['authorization'];
        if (!token) {
            res.status(411).json({
                message: "Please sign up!",
            });
            return;
        }
        const payload = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        if (!payload) {
            res.status(411).json({
                message: "Please sign in again!",
            });
            return;
        }
        //@ts-ignore
        req.id = payload.id; // remember --> you have to override type of Request object of express.
        next();
    }
    catch (e) {
        res.status(411).json({
            message: "Internal Server Error",
            error: e,
        });
    }
};
exports.userAuth = userAuth;
//# sourceMappingURL=auth.js.map