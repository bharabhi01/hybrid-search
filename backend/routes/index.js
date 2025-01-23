import express from "express";
const router = express.Router();
import { addData, searchData } from "../controllers/index.js";

router.post("/addData", addData);
router.post("/search", searchData);

export default router;