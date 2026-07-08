import { Router } from "express";
import { getMyProfile, updateMyProfile } from "../../controllers/site/profile.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = Router();

// Apply auth protector to all profile routes
router.use(protect);

router.get("/me", getMyProfile);
router.patch("/me", updateMyProfile);

export default router;
