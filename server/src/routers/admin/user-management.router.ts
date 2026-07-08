import { Router } from "express";
import { getAllUsers, deleteUser } from "../../controllers/admin/user-management.controller.js";
import { protect, adminGuard } from "../../middlewares/auth.middleware.js";

const router = Router();

// Apply auth protectors to all administrative routes in this sub-router
router.use(protect);
router.use(adminGuard);

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

export default router;
