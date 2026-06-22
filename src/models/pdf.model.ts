import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    vectorCollectionId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PDF = mongoose.model("PDF", pdfSchema);

export default PDF;