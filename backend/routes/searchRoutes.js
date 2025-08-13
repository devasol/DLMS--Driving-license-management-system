import express from "express";
import { performGlobalSearch } from "../controllers/searchController.js";

const router = express.Router();

// Global search endpoint
router.get("/", performGlobalSearch);

export default router;
