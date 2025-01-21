import express from "express";
const router = express.Router();
import { addData } from "../controllers/index.js";

router.post("/addData", addData);
// router.get("/search", searchData);

export default router;