import express from "express";
import { upload } from "../middleware/multer";
import { uploadPdf, getPdfs } from "../controller/pdf.controller";


const router = express.Router();

router.post(
  "/upload",
  upload.single("pdf"),
  uploadPdf
);

router.get(
  "/list",
  getPdfs
);

export default router;