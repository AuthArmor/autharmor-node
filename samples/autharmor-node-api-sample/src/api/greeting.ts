import express from "express";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

type GreetingRequest = {};

type GreetingResponse = {
    message: string;
};

router.get<GreetingRequest, GreetingResponse>("/", authMiddleware, (req, res) => {
    res.json({ message: `Hello, ${req.authTokenData!.username}!` });
});

export default router;
