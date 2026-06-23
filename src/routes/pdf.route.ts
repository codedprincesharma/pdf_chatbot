import express from "express";
import {upload} from "../middleware/multer";
import { uploadPdf } from "../controller/pdf.controller";


const router = express.Router();

router.post(
  "/upload",
  upload.single("pdf"),
  uploadPdf
);

export default router;

