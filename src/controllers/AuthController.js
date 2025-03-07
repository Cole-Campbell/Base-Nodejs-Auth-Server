import express from "express";
import { isUserValid, login, logout, refreshToken } from "../middleware/verify.user.middleware.js";

export const AuthRoutes = express.Router();

AuthRoutes.post("/login", [isUserValid, login]);
AuthRoutes.post("/token", [refreshToken])
AuthRoutes.delete("/logout", [logout])
