import { Router } from "express";
import {
  register,
  login,
  googleLogin,
  verifyEmail,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  resendOtp,
  resendVerificationOtp,
  resendForgotOtp,
  refreshTokenHandler,
  logout,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyEmailSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
  googleLoginSchema,
  resendOtpSchema,
} from "../validations/auth.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/google-login", validate(googleLoginSchema), googleLogin);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/verify-reset-otp", validate(verifyResetOtpSchema), verifyResetOtp);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.post("/resend-otp", validate(resendOtpSchema), resendOtp);
router.post("/resend-verification-otp", resendVerificationOtp);
router.post("/resend-forgot-otp", resendForgotOtp);
router.post("/refresh-token", refreshTokenHandler);
router.post("/logout", logout);

export default router;
