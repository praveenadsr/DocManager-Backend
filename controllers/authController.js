const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};



const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("🔑 Login request for:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found");
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password mismatch");
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    console.log("✅ Authenticated user:", user._id.toString());

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    console.log("🪪 JWT Token payload:", jwt.decode(token));

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("💥 Login error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};







const logout = async (req, res) => {
  try {
    // (Optional: if using cookies, clear them here)
    res.status(200).json({ msg: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Logout failed", error: err.message });
  }
};

module.exports = { register, login, logout };
