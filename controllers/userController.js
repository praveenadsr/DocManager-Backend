const User = require('../models/User');

const User = require('../models/User');

exports.getUser = async (req, res) => {
  try {
    console.log("🔍 Fetching user profile for ID:", req.user.id);

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      console.log("❌ No user found in DB");
      return res.status(404).json({ msg: "User not found" });
    }

    console.log("✅ User profile found:", user);
    res.json(user);
  } catch (err) {
    console.error("💥 Error fetching profile:", err.message);
    res.status(500).json({ msg: "Failed to fetch user profile" });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const { username, email } = req.body;
    const updates = { username, email };

    if (req.file) {
      updates.profilePicture = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select('-password');

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to update user profile' });
  }
};
