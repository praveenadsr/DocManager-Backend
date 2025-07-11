const Document = require("../models/Document");
const path = require("path");
const fs = require("fs");

const uploadDocument = async (req, res) => {
  try {
    console.log("📥 Upload request received");

    const { name } = req.body;
    console.log("📝 Document Name:", name);

    if (!req.file) {
      console.warn("⚠️ No file uploaded");
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const filePath = req.file.path;
    const userId = req.user?.id;
    console.log("👤 User ID from token:", userId);

    if (!userId) return res.status(401).json({ msg: "Unauthorized" });

    const newDoc = new Document({
      user: userId,
      name,
      filePath,
    });

    await newDoc.save();
    console.log("✅ Document saved:", newDoc._id);

    res.status(201).json({ msg: "Document uploaded successfully", document: newDoc });
  } catch (err) {
    console.error("❌ Upload failed:", err.message);
    res.status(500).json({ msg: "Failed to upload", error: err.message });
  }
};

const getDocuments = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log("📄 Fetching all documents for user:", userId);

    const docs = await Document.find({ user: userId }).sort({ createdAt: -1 });
    console.log("📦 Total documents found:", docs.length);

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const updatedDocs = docs.map(doc => ({
      ...doc._doc,
      fileUrl: `${baseUrl}/${doc.filePath.replace(/\\/g, '/')}`,
    }));

    res.json(updatedDocs);
  } catch (err) {
    console.error("❌ Error fetching documents:", err.message);
    res.status(500).json({ msg: "Error fetching documents", error: err.message });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const docId = req.params.id;
    console.log("📄 Fetching document ID:", docId, "User:", userId);

    const doc = await Document.findOne({ _id: docId, user: userId });

    if (!doc) {
      console.warn("⚠️ Document not found");
      return res.status(404).json({ msg: "Document not found" });
    }

    console.log("✅ Document found:", doc._id);
    res.json(doc);
  } catch (err) {
    console.error("❌ Error fetching document:", err.message);
    res.status(500).json({ msg: "Error fetching document", error: err.message });
  }
};

const updateDocument = async (req, res) => {
  try {
    const userId = req.user?.id;
    const docId = req.params.id;
    const { name } = req.body;

    console.log("✏️ Updating document ID:", docId, "User:", userId);
    console.log("🔁 New name:", name);

    const doc = await Document.findOneAndUpdate(
      { _id: docId, user: userId },
      { name },
      { new: true }
    );

    if (!doc) {
      console.warn("⚠️ Document not found");
      return res.status(404).json({ msg: "Document not found" });
    }

    console.log("✅ Document updated:", doc._id);
    res.json({ msg: "Updated", document: doc });
  } catch (err) {
    console.error("❌ Error updating document:", err.message);
    res.status(500).json({ msg: "Error updating", error: err.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const userId = req.user?.id;
    const docId = req.params.id;
    console.log("🗑️ Deleting document ID:", docId, "User:", userId);

    const doc = await Document.findOneAndDelete({ _id: docId, user: userId });

    if (!doc) {
      console.warn("⚠️ Document not found or unauthorized");
      return res.status(404).json({ msg: "Document not found" });
    }

    fs.unlinkSync(doc.filePath);
    console.log("✅ File removed from disk:", doc.filePath);

    res.json({ msg: "Deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting document:", err.message);
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
