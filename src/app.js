const express = require("express");
const cors = require("cors");
const session = require("express-session");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const cartRoutes = require("./routes/cartRoutes");
const debugRoutes = require("./routes/debugRoutes");

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps or curl)
    if (!origin) return callback(null, true);
    const allowedPatterns = [
      /^http:\/\/localhost:\d+$/,
      /\.vercel\.app$/
    ];
    if (allowedPatterns.some(pattern => pattern.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "amazon-clone-dev-secret",
  resave: false,
  saveUninitialized: false, // Step 3 Requirement
  cookie: {
    secure: false, // set to true if using https
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: "lax",
  }
}));

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/debug", debugRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

module.exports = app;
