const Document = require("../models/Document");

const getDashboardMetrics = async (req, res) => {
  try {
    const totalDocuments = await Document.countDocuments({ user: req.userId });

    const recentDocs = await Document.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const updatedDocs = recentDocs.map(doc => ({
      ...doc,
      fileUrl: `${req.protocol}://${req.get("host")}/${doc.filePath.replace(/\\/g, '/')}`,
    }));

    res.json({
      totalDocuments,
      recentDocs: updatedDocs,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

module.exports = { getDashboardMetrics };
