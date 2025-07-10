const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");

// GET user profile
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json(null);
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});


// UPDATE user profile
router.put("/", auth, async (req, res) => {
  try {
    const { username, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { username, email },
      { new: true }
    ).select("-password");


    
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Update failed", error: err.message });
  }
});

module.exports = router;
