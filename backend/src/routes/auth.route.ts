import express from "express";
import * as authController from "../controller/auth.controller";

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/me", authController.getMe);
router.post("/logout", authController.logout);

export default router;
