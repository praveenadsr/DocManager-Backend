const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getDashboardMetrics } = require("../controllers/dashboardController");

router.get("/metrics", auth, getDashboardMetrics);

module.exports = router;
