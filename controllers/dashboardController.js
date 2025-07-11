const Document = require("../models/Document");

const getDashboardMetrics = async (req, res) => {
  const userId = req.user?.id;
  console.log("📊 Dashboard metrics requested by user:", userId);

  if (!userId) {
    return res.status(401).json({ msg: "Unauthorized: Missing user ID" });
  }

  try {
    const totalDocuments = await Document.countDocuments({ user: userId });
    console.log("🧾 Total documents for user:", totalDocuments);

    const recentDocs = await Document.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    console.log("📄 Recent documents fetched:", recentDocs.length);

    const updatedDocs = recentDocs.map(doc => {
      const fileUrl = `${req.protocol}://${req.get("host")}/${doc.filePath.replace(/\\/g, '/')}`;
      console.log(`🔗 File URL for "${doc.name}": ${fileUrl}`);
      return {
        ...doc,
        fileUrl,
      };
    });

    res.json({
      totalDocuments,
      recentDocs: updatedDocs,
    });
  } catch (err) {
    console.error("❌ Error in getDashboardMetrics:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

module.exports = { getDashboardMetrics };
