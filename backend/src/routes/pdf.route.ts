import express from "express";
import { upload } from "../middleware/multer";
import { uploadPdf, getPdfs } from "../controller/pdf.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.post(
  "/upload",
  authMiddleware as any,
  upload.single("pdf"),
  uploadPdf
);

router.get(
  "/list",
  authMiddleware as any,
  getPdfs
);

export default router;