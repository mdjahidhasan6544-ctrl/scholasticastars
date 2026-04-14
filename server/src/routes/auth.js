import { Router } from "express";
import { body } from "express-validator";

import {
  login,
  logout,
  me,
  register,
  resolveLoginUser
} from "../controllers/authController.js";
import { deviceGuard } from "../middleware/deviceGuard.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router();

router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("studentId")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Student ID is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
    body("deviceFingerprint")
      .custom((value) => value && typeof value === "object" && Object.keys(value).length > 0)
      .withMessage("Device fingerprint is required")
  ],
  validateRequest,
  resolveLoginUser,
  deviceGuard,
  login
);

router.post("/logout", logout);
router.get("/me", verifyJWT, me);

export default router;
