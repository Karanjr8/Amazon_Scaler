const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const getJwtSecret = () => process.env.JWT_SECRET || "dev-secret-key";

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.createUser({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ userId: user.id, email: user.email }, getJwtSecret(), {
      expiresIn: "1d",
    });

    // STEP 4: Set session
    req.session.user = { id: user.id, email: user.email };
    console.log("[signup] Session created for user:", user.id);

    return res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await userModel.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, getJwtSecret(), {
      expiresIn: "1d",
    });

    // STEP 4: Set session
    req.session.user = { id: user.id, email: user.email };
    console.log("[login] Session created for user:", user.id);

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await userModel.getUserByEmail(req.user.email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Could not log out" });
    }
    res.clearCookie("connect.sid");
    return res.status(200).json({ success: true, message: "Logged out" });
  });
};

module.exports = {
  signup,
  login,
  getMe,
  logout,
};
