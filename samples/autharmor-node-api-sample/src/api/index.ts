import express from "express";

import auth from "./auth";
import greeting from "./greeting";

const router = express.Router();

router.use("/auth", auth);
router.use("/greeting", greeting);

export default router;
