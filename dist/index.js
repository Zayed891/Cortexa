"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = __importDefault(require("zod"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("./db");
const config_1 = require("./config/config");
const auth_1 = require("./auth/auth");
const mongoose_1 = __importDefault(require("mongoose"));
const utils_1 = require("./utils");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post('/api/v1/signup', async (req, res) => {
    const userSchema = zod_1.default.object({
        email: zod_1.default.email(),
        password: zod_1.default.string().min(8).max(20),
        firstName: zod_1.default.string().min(5).max(10),
        lastName: zod_1.default.string().min(5).max(10),
    });
    const parsedResult = userSchema.safeParse(req.body);
    if (!parsedResult.success) {
        res.status(411).json({
            msg: "Please input correct credentials",
            errors: parsedResult.error,
        });
        return;
    }
    const { email, password, firstName, lastName } = parsedResult.data;
    try {
        const alreadyExist = await db_1.userModel.findOne({ email });
        if (alreadyExist) {
            res.status(403).json({
                message: "User already exists",
            });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 5);
        await db_1.userModel.create({
            email: email,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName,
        });
        res.status(200).json({
            message: "User Signed up successfully",
        });
    }
    catch (e) {
        res.status(500).json({ message: "Internal Server Error", error: e });
    }
});
app.post("/api/v1/signin", async (req, res) => {
    const requiredBody = zod_1.default.object({
        email: zod_1.default.email(),
        password: zod_1.default.string().min(8).max(20),
    });
    const parsedResult = requiredBody.safeParse(req.body);
    if (!parsedResult.success) {
        res.status(411).json({
            message: "Enter the correct credentials",
            error: parsedResult.error,
        });
        return;
    }
    const { email, password } = parsedResult.data;
    try {
        const user = await db_1.userModel.findOne({ email });
        if (!user) {
            res.status(401).json({
                message: "Please sign up!",
            });
            return;
        }
        const correctCredentials = await bcrypt_1.default.compare(password, user.password);
        if (!correctCredentials) {
            res.status(411).json({
                message: "Please input the correct credentials",
            });
            return;
        }
        const authorization = jsonwebtoken_1.default.sign({
            id: user._id,
        }, config_1.JWT_SECRET);
        res.status(200).json({
            message: "You have successfully signed up!",
            authorization,
        });
    }
    catch (e) {
        res.status(500).json({
            message: "Internal Server Error",
            error: e,
        });
    }
});
app.post("/api/v1/content", auth_1.userAuth, async (req, res) => {
    const contentSchema = zod_1.default.object({
        link: zod_1.default.string(),
        type: zod_1.default.string(),
        title: zod_1.default.string(),
    });
    const parsedResult = contentSchema.safeParse(req.body);
    if (!parsedResult.success) {
        res.status(411).json({
            message: "Wrong Inputs",
            error: parsedResult.error,
        });
        return;
    }
    //@ts-ignore
    const userId = req.id;
    const { link, type, title } = parsedResult.data;
    try {
        const newContent = await db_1.contentModel.create({
            link: link,
            type: type,
            title: title,
            tags: [],
            userId: userId
        });
        res.status(200).json({
            message: "Content Created Successfully",
            contentId: newContent._id,
        });
    }
    catch (e) {
        res.status(500).json({
            message: "Internal Server Error",
            error: e,
        });
    }
});
app.get("/api/v1/content", auth_1.userAuth, async (req, res) => {
    try {
        //@ts-ignore
        const userId = req.id;
        const contents = await db_1.contentModel.find({
            userId: userId,
        }).populate("userId", "email");
        res.status(200).json({
            contents: contents,
        });
    }
    catch (e) {
        res.status(500).json({
            message: "Internal Error",
            error: e,
        });
    }
});
app.delete("/api/v1/content", auth_1.userAuth, async (req, res) => {
    const contentId = req.body.contentId;
    try {
        const response = await db_1.contentModel.deleteMany({
            _id: contentId,
            //@ts-ignore
            userId: req.id,
        });
        if ((!response.acknowledged) && (response.deletedCount == 0)) {
            res.status(411).json({
                message: "No content found to delete",
            });
            return;
        }
        res.status(200).json({
            message: "Deleted",
        });
    }
    catch (e) {
        res.status(500).json({
            message: "Internal Error",
            error: e,
        });
    }
});
app.post("/api/v1/brain/share", auth_1.userAuth, async (req, res) => {
    const isShare = req.body.share;
    if (isShare === "false") {
        const reponse = await db_1.linkModel.findOneAndDelete({
            //@ts-ignore
            userId: req.id
        });
        return res.status(200).json({
            message: "Deleted the link"
        });
    }
    const link = await db_1.linkModel.findOne({
        //@ts-ignore
        userId: req.id
    });
    if (link) {
        res.status(200).json({
            hash: link.hash
        });
        return;
    }
    const hash = (0, utils_1.random)(10);
    await db_1.linkModel.create({
        hash,
        //@ts-ignore
        userId: req.id
    });
    res.status(200).json({
        hash
    });
});
app.get("/api/v1/brain/:shareLink", async (req, res) => {
    const hash = req.params.shareLink;
    try {
        const link = await db_1.linkModel.findOne({
            hash
        });
        if (!link) {
            res.status(411).json({
                message: "Incorrect input",
            });
            return;
        }
        const content = await db_1.contentModel.findOne({
            userId: link.userId,
        });
        const user = await db_1.userModel.findOne({
            _id: link.userId,
        });
        if (!user) {
            res.status(411).json({
                message: "User not found, shouldn't happen ideally",
            });
            return;
        }
        res.status(200).json({
            content,
            //@ts-ignore
            username: user.email,
        });
    }
    catch (e) {
        res.status(500).json({
            message: "Sorry! Internal Error",
            error: e,
        });
    }
});
async function main() {
    try {
        await mongoose_1.default.connect(config_1.MONGO_URL);
        app.listen(3000, () => {
            console.log("Server is running on port 3000");
        });
    }
    catch (e) {
        console.log("Error starting server", e);
    }
}
main();
//# sourceMappingURL=index.js.map