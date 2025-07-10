const Document = require("../models/Document");
const path = require("path");
const fs = require("fs");

const uploadDocument = async (req, res) => {
  try {
    const { name } = req.body;
    const filePath = req.file.path;

    const newDoc = new Document({
      user: req.userId,
      name,
      filePath,
    });

    await newDoc.save();
    res.status(201).json({ msg: "Document uploaded successfully", document: newDoc });
  } catch (err) {
    res.status(500).json({ msg: "Failed to upload", error: err.message });
  }
};








const getDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ user: req.userId }).sort({ createdAt: -1});

    const baseUrl = `${req.protocol}://${req.get("host")}`; // auto uses IP or domain
    const updatedDocs = docs.map(doc => ({
      ...doc._doc,
      fileUrl: `${baseUrl}/${doc.filePath.replace(/\\/g, '/')}`,
    }));

    res.json(updatedDocs);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching documents", error: err.message });
  }
};










const getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.userId });
    if (!doc) return res.status(404).json({ msg: "Document not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching document", error: err.message });
  }
};

const updateDocument = async (req, res) => {
  try {
    const { name } = req.body;
    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { name },
      { new: true }
    );
    if (!doc) return res.status(404).json({ msg: "Document not found" });
    res.json({ msg: "Updated", document: doc });
  } catch (err) {
    res.status(500).json({ msg: "Error updating", error: err.message });
  }
};




const deleteDocument = async (req, res) => {
  try {
    console.log("DELETE request:", req.params.id, "User:", req.userId);

    const doc = await Document.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!doc) {
      console.warn("❌ Document not found or unauthorized");
      return res.status(404).json({ msg: "Document not found" });
    }

    fs.unlinkSync(doc.filePath); // remove file from disk
    console.log("✅ Deleted file:", doc.filePath);
    res.json({ msg: "Deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err.message);
    res.status(500).json({ msg: "Error deleting", error: err.message });
  }
};








module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
};
