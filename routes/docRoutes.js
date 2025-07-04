const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const verifyToken = require("../middleware/authMiddleware");
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} = require("../controllers/docController");

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

// All routes require token
router.post("/", verifyToken, upload.single("file"), uploadDocument);
router.get("/", verifyToken, getDocuments);
router.get("/:id", verifyToken, getDocumentById);
router.put("/:id", verifyToken, updateDocument);
router.delete("/:id", verifyToken, deleteDocument);

module.exports = router;
