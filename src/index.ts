
import express, { response } from "express";
import z from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { contentModel, linkModel, userModel } from "./db";
import { JWT_SECRET, MONGO_URL } from "./config/config";
import { userAuth } from "./auth/auth";
import cors from "cors";

import mongoose from "mongoose";
import { random } from "./utils";

const app = express();

app.use(express.json());
app.use(cors());


app.post('/api/v1/signup', async (req, res) => {
    const userSchema = z.object({
        email: z.email(),
        password: z.string().min(8).max(20),
        firstName: z.string().min(5).max(10),
        lastName: z.string().min(5).max(10),
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
        const alreadyExist = await userModel.findOne({ email });

        if (alreadyExist) {
            res.status(403).json({
                message: "User already exists",
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 5);

        await userModel.create({
            email: email,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName,
        });

        res.status(200).json({
            message: "User Signed up successfully",
        });
    } catch (e) {
        res.status(500).json({ message: "Internal Server Error", error: e });
    }
})

app.post("/api/v1/signin", async (req, res) => {
    const requiredBody = z.object({
        email: z.email(),
        password: z.string().min(8).max(20),
    })

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
        const user = await userModel.findOne({ email });

        if (!user) {
            res.status(401).json({
                message: "Please sign up!",
            })
            return;
        }

        const correctCredentials = await bcrypt.compare(password, user.password);

        if (!correctCredentials) {
            res.status(411).json({
                message: "Please input the correct credentials",
            });
            return;
        }

        const authorization = jwt.sign({
            id: user._id,
        }, JWT_SECRET as string);

        res.status(200).json({
            message: "You have successfully signed up!",
            authorization,
        })

    } catch (e) {
        res.status(500).json({
            message: "Internal Server Error",
            error: e,
        })
    }
})

app.post("/api/v1/content", userAuth, async (req, res) => {
    const contentSchema = z.object({
        link: z.string(),
        type: z.string(),
        title: z.string(),
    });

    const parsedResult = contentSchema.safeParse(req.body);

    if (!parsedResult.success) {
        res.status(411).json({
            message: "Wrong Inputs",
            error: parsedResult.error,
        })
        return;
    }

    //@ts-ignore
    const userId = req.id;

    const { link, type, title } = parsedResult.data;

    try {
        const newContent = await contentModel.create({
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
    } catch (e) {
        res.status(500).json({
            message: "Internal Server Error",
            error: e,
        })
    }

})

app.get("/api/v1/content", userAuth, async (req, res) => {
    try {
        //@ts-ignore
        const userId = req.id;
        const contents = await contentModel.find({
            userId: userId,
        }).populate("userId", "email");

        res.status(200).json({
            contents: contents,
        })

    } catch (e) {
        res.status(500).json({
            message: "Internal Error",
            error: e,
        })
    }

})

app.delete("/api/v1/content", userAuth, async (req, res) => {
    const contentId = req.body.contentId;

    try {
        const response = await contentModel.deleteMany({
            _id: contentId,
            //@ts-ignore
            userId: req.id,
        })

        if ((!response.acknowledged) && (response.deletedCount == 0)) {
            res.status(411).json({
                message: "No content found to delete",
            })
            return;
        }

        res.status(200).json({
            message: "Deleted",
        })
    } catch (e) {
        res.status(500).json({
            message: "Internal Error",
            error: e,
        })
    }
});


app.post("/api/v1/brain/share", userAuth, async (req, res) => {

    const isShare = req.body.share;
    try {
        if (isShare === "false") {
            const reponse = await linkModel.findOneAndDelete({
                //@ts-ignore
                userId: req.id
            })

            return res.status(200).json({
                message: "Deleted the link" 
            })
        }

        const link = await linkModel.findOne({
            //@ts-ignore
            userId: req.id
        });

        if (link) {
            res.status(200).json({
                hash: link.hash
            });
            return;
        }

        const hash = random(10);

        await linkModel.create({
            hash,
            //@ts-ignore
            userId: req.id
        });

        res.status(200).json({
            hash
        })
    } catch (e) {
        res.status(500).json({
            message : "Sorry Internal Error",
            error : e,   
        })
    }
});

app.get("/api/v1/brain/:shareLink", async (req, res) => {
    const hash = req.params.shareLink;

    try {
        const link = await linkModel.findOne({
            hash
        })

        if (!link) {
            res.status(411).json({
                message: "Incorrect input",
            })
            return;
        }

        const content = await contentModel.find({
            userId: link.userId,
        });

        const user = await userModel.findOne({
            _id: link.userId,
        });

        if (!user) {
            res.status(411).json({
                message: "User not found, shouldn't happen ideally",
            })
            return;
        }

        res.status(200).json({
            content,
            //@ts-ignore
            username: user.email,
        });
    } catch (e) {
        res.status(500).json({
            message: "Sorry! Internal Error",
            error: e,
        })
    }

})


async function main() {
    try {
        await mongoose.connect(MONGO_URL);

        app.listen(3000, () => {
            console.log("Server is running on port 3000");
        })
    } catch (e) {
        console.log("Error starting server", e);
    }
}

main();