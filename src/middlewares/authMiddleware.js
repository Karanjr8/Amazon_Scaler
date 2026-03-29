const jwt = require("jsonwebtoken");

const getJwtSecret = () => process.env.JWT_SECRET || "dev-secret-key";

const requireAuth = (req, res, next) => {
  // STEP 3: AUTH VALIDATION (Session-based)
  if (req.session && req.session.user) {
    console.log("Session user found:", req.session.user.id);
    req.user = { userId: req.session.user.id, email: req.session.user.email };
    return next();
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    console.log("No session or Bearer token provided");
    return res.status(401).json({
      success: false,
      message: "Authentication token or session is required",
    });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.user = payload;
    return next();
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = {
  requireAuth,
};
