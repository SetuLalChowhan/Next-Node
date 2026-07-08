import { Router } from "express";
import authRouter from "./auth.router.js";
import adminUserManagementRouter from "./admin/user-management.router.js";
import siteProfileRouter from "./site/profile.router.js";

const apiRouter = Router();

// Mount sub-routers with clean, semantic prefixes
apiRouter.use("/auth", authRouter);
apiRouter.use("/admin", adminUserManagementRouter);
apiRouter.use("/profile", siteProfileRouter);

export default apiRouter;
