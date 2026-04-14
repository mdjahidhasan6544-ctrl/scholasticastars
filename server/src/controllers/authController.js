import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { User } from "../models/User.js";
import { sendError, sendSuccess } from "../utils/response.js";

function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    studentId: user.studentId,
    phone: user.phone || "",
    institution: user.institution || "",
    classLevel: user.classLevel || "",
    address: user.address || "",
    role: user.role,
    isVerifiedStudent: user.isVerifiedStudent,
    status: user.status
  };
}

function parseExpiryToMs(expiry) {
  if (!expiry) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const raw = `${expiry}`.trim();
  const match = raw.match(/^(\d+)([smhd])$/i);

  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return value * multipliers[unit];
}

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: parseExpiryToMs(process.env.JWT_EXPIRY || "7d")
  };
}

function signToken(user) {
  return jwt.sign(
    {
      id: user._id.toString()
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRY || "7d"
    }
  );
}

export async function register(req, res, next) {
  try {
    const { name, email, studentId, password } = req.body;

    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { studentId: studentId.trim() }
      ]
    });

    if (existingUser) {
      return sendError(res, "Email or student ID already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      studentId,
      passwordHash,
      role: "student",
      isVerifiedStudent: false,
      status: "pending"
    });

    return sendSuccess(
      res,
      {
        message: "Registration successful. Await admin verification.",
        user: sanitizeUser(user)
      },
      201
    );
  } catch (error) {
    return next(error);
  }
}

export async function resolveLoginUser(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return sendError(res, "Invalid email or password", 401);
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return sendError(res, "Invalid email or password", 401);
    }

    if (user.status === "banned") {
      return sendError(res, "Account is blocked", 403);
    }

    if (user.status === "temp_banned") {
      return sendError(res, "Device limit reached. Contact admin.", 403, {
        code: "DEVICE_LIMIT"
      });
    }

    req.loginUser = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const user = req.loginUser;

    if (!user) {
      return sendError(res, "Login context missing", 500);
    }

    const token = signToken(user);
    res.cookie("token", token, getCookieOptions());

    return sendSuccess(res, {
      message: "Login successful",
      user: sanitizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
}

export function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  });

  return sendSuccess(res, {
    message: "Logged out successfully"
  });
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, "Session is no longer valid", 401);
    }

    return sendSuccess(res, {
      user: sanitizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
}
