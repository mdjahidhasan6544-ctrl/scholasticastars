import { Router } from "express";
import { body } from "express-validator";

import {
  changePassword,
  getCourseDetail,
  getCourses,
  getLesson,
  getLiveClasses,
  getProfile,
  updateProfile,
  submitPayment
} from "../controllers/studentController.js";
import { requireVerified } from "../middleware/requireVerified.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router();

router.use(verifyJWT, requireVerified);

router.get("/courses", getCourses);
router.get("/courses/:id", getCourseDetail);
router.get("/lessons/:id", getLesson);
router.get("/live-classes", getLiveClasses);
router.get("/profile", getProfile);
router.patch(
  "/profile",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone")
      .optional({ checkFalsy: true })
      .isLength({ min: 6, max: 20 })
      .withMessage("Phone number must be 6 to 20 characters"),
    body("institution").optional().isString(),
    body("classLevel").optional().isString(),
    body("address").optional().isString()
  ],
  validateRequest,
  updateProfile
);
router.post(
  "/profile/change-password",
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters")
  ],
  validateRequest,
  changePassword
);

router.post(
  "/payments",
  [
    body("courseId").isMongoId().withMessage("Valid course is required"),
    body("method")
      .isIn(["bkash", "nagad", "rocket"])
      .withMessage("Valid payment method is required"),
    body("transactionId")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Transaction ID is required"),
    body("phoneNumber")
      .trim()
      .isLength({ min: 6, max: 20 })
      .withMessage("Phone number is required"),
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than zero")
  ],
  validateRequest,
  submitPayment
);

export default router;
