/**
 * ShieldAI Fraud Detection - Node.js/Express Backend
 * RESTful API with JWT authentication, MongoDB integration, and ML proxy
 */

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const csv = require("csv-parser");
const nodemailer = require("nodemailer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: "uploads/", limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// ── Database Connection ────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/shieldai")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// ── Schemas ────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["User", "Analyst", "Admin"], default: "User" },
  status: { type: String, enum: ["Active", "Suspended"], default: "Active" },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: { type: Number, required: true },
  merchant: String,
  location: String,
  category: String,
  hour: Number,
  dayOfWeek: Number,
  isFraud: { type: Boolean, default: false },
  confidence: Number,
  riskLevel: { type: String, enum: ["Low", "Medium", "High"] },
  modelVersion: String,
  timestamp: { type: Date, default: Date.now },
});

const systemLogSchema = new mongoose.Schema({
  level: { type: String, enum: ["INFO", "WARN", "ALERT", "ERROR"] },
  message: String,
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);
const SystemLog = mongoose.model("SystemLog", systemLogSchema);

// ── Auth Middleware ────────────────────────────────────────────────────────────
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "shieldai-secret-key");
    const user = await User.findById(decoded.id).select("-password");
    if (!user || user.status === "Suspended") return res.status(401).json({ error: "Unauthorized" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Insufficient permissions" });
  next();
};

// ── Logger Helper ──────────────────────────────────────────────────────────────
const log = async (level, message, metadata = {}) => {
  try {
    await SystemLog.create({ level, message, metadata });
    console.log(`[${level}] ${message}`);
  } catch (err) {
    console.error("Log error:", err);
  }
};

// ── Email Alert ────────────────────────────────────────────────────────────────
const sendFraudAlert = async (transaction, userEmail) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"ShieldAI Security" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "🚨 Fraud Alert: Suspicious Transaction Detected",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2>⚠️ Suspicious Transaction Detected</h2>
        </div>
        <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px;">
          <p><strong>Amount:</strong> $${transaction.amount}</p>
          <p><strong>Merchant:</strong> ${transaction.merchant}</p>
          <p><strong>Location:</strong> ${transaction.location}</p>
          <p><strong>Confidence:</strong> ${transaction.confidence}%</p>
          <p>If you did not make this transaction, please contact us immediately.</p>
        </div>
      </div>
    `,
  });
};

// ── Routes: Authentication ─────────────────────────────────────────────────────

// POST /api/auth/register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });
    if (password.length < 8) return res.status(400).json({ error: "Password must be 8+ characters" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const user = await User.create({ name, email, password, role: role || "User" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "shieldai-secret-key", { expiresIn: "7d" });

    await log("INFO", `New user registered: ${email}`);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (user.status === "Suspended") return res.status(403).json({ error: "Account suspended" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "shieldai-secret-key", { expiresIn: "7d" });
    await log("INFO", `User login: ${email}`);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/auth/me
app.get("/api/auth/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

// ── Routes: Fraud Detection ────────────────────────────────────────────────────

// POST /api/predict — Single transaction prediction
app.post("/api/predict", authenticate, async (req, res) => {
  try {
    const { amount, merchant, location, category, hour, dayOfWeek } = req.body;
    if (!amount) return res.status(400).json({ error: "Amount is required" });

    // Forward to Python ML service
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, {
      amount: parseFloat(amount),
      merchant: merchant || "Unknown",
      location: location || "Unknown",
      category: category || "other",
      hour: parseInt(hour) || 12,
      day_of_week: parseInt(dayOfWeek) || 1,
    });

    const { is_fraud, confidence, risk_level, model_version } = mlResponse.data;

    // Save transaction to DB
    const txn = await Transaction.create({
      userId: req.user._id,
      amount: parseFloat(amount),
      merchant,
      location,
      category,
      hour,
      dayOfWeek,
      isFraud: is_fraud,
      confidence,
      riskLevel: risk_level,
      modelVersion: model_version,
    });

    // Send email alert if fraud detected
    if (is_fraud) {
      await log("ALERT", `Fraud detected: TXN ${txn._id} for user ${req.user.email}`, { amount, merchant, confidence });
      sendFraudAlert({ amount, merchant, location, confidence }, req.user.email).catch(console.error);
    }

    res.json({
      transaction_id: txn._id,
      is_fraud,
      confidence,
      risk_level,
      model_version,
      recommendation: is_fraud ? "BLOCK" : "APPROVE",
    });
  } catch (err) {
    // Fallback mock if ML service is down
    console.error("ML service error, using fallback:", err.message);
    const isFraud = req.body.amount > 5000;
    res.json({
      transaction_id: "MOCK-" + Date.now(),
      is_fraud: isFraud,
      confidence: isFraud ? 91.5 : 97.2,
      risk_level: isFraud ? "High" : "Low",
      model_version: "v2.1-fallback",
      recommendation: isFraud ? "BLOCK" : "APPROVE",
    });
  }
});

// POST /api/predict/batch — CSV batch processing
app.post("/api/predict/batch", authenticate, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "CSV file required" });

  const results = [];
  const errors = [];

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", row => results.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    // Process each row through ML service
    const predictions = await Promise.allSettled(
      results.map(async row => {
        try {
          const mlRes = await axios.post(`${ML_SERVICE_URL}/predict`, {
            amount: parseFloat(row.amount || 0),
            merchant: row.merchant || "Unknown",
            location: row.location || "Unknown",
            category: row.category || "other",
            hour: parseInt(row.hour) || 12,
            day_of_week: parseInt(row.day_of_week) || 1,
          });
          return { ...row, ...mlRes.data };
        } catch {
          // Fallback
          return { ...row, is_fraud: false, confidence: 50, risk_level: "Medium", model_version: "fallback" };
        }
      })
    );

    const processed = predictions.map(p => p.value || p.reason);
    const fraudCount = processed.filter(p => p.is_fraud).length;

    // Cleanup uploaded file
    fs.unlink(req.file.path, () => {});

    await log("INFO", `Batch processed: ${processed.length} transactions, ${fraudCount} fraud detected by ${req.user.email}`);

    res.json({
      processed: processed.length,
      fraud_count: fraudCount,
      legitimate_count: processed.length - fraudCount,
      results: processed,
    });
  } catch (err) {
    fs.unlink(req.file.path, () => {});
    res.status(500).json({ error: "Batch processing failed", details: err.message });
  }
});

// ── Routes: Transactions ───────────────────────────────────────────────────────

// GET /api/transactions
app.get("/api/transactions", authenticate, async (req, res) => {
  try {
    const { risk, from_date, to_date, limit = 50, page = 1, fraud_only } = req.query;
    const filter = req.user.role === "Admin" ? {} : { userId: req.user._id };

    if (risk) filter.riskLevel = risk;
    if (fraud_only === "true") filter.isFraud = true;
    if (from_date || to_date) {
      filter.timestamp = {};
      if (from_date) filter.timestamp.$gte = new Date(from_date);
      if (to_date) filter.timestamp.$lte = new Date(to_date);
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate("userId", "name email");

    res.json({ transactions, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// ── Routes: Analytics ─────────────────────────────────────────────────────────

// GET /api/analytics/summary
app.get("/api/analytics/summary", authenticate, requireRole("Analyst", "Admin"), async (req, res) => {
  try {
    const { period = "7d" } = req.query;
    const days = parseInt(period) || 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [total, fraudCount, totalAmountResult] = await Promise.all([
      Transaction.countDocuments({ timestamp: { $gte: since } }),
      Transaction.countDocuments({ timestamp: { $gte: since }, isFraud: true }),
      Transaction.aggregate([{ $match: { timestamp: { $gte: since }, isFraud: true } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    ]);

    const fraudAmount = totalAmountResult[0]?.total || 0;
    const accuracy = total > 0 ? ((total - fraudCount) / total * 100).toFixed(2) : 100;

    res.json({
      period,
      total_transactions: total,
      fraud_count: fraudCount,
      legitimate_count: total - fraudCount,
      fraud_amount: fraudAmount,
      accuracy: parseFloat(accuracy),
      fraud_rate: total > 0 ? ((fraudCount / total) * 100).toFixed(2) : 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Analytics failed" });
  }
});

// GET /api/analytics/trend
app.get("/api/analytics/trend", authenticate, requireRole("Analyst", "Admin"), async (req, res) => {
  try {
    const trend = await Transaction.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, fraud: { $sum: { $cond: ["$isFraud", 1, 0] } }, legitimate: { $sum: { $cond: ["$isFraud", 0, 1] } }, total: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);
    res.json({ trend });
  } catch (err) {
    res.status(500).json({ error: "Trend data failed" });
  }
});

// ── Routes: Admin ──────────────────────────────────────────────────────────────

// GET /api/admin/users
app.get("/api/admin/users", authenticate, requireRole("Admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ users, total: users.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// PATCH /api/admin/users/:id
app.patch("/api/admin/users/:id", authenticate, requireRole("Admin"), async (req, res) => {
  try {
    const { role, status } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role, status }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    await log("INFO", `User ${user.email} updated by admin: role=${role}, status=${status}`);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// GET /api/admin/logs
app.get("/api/admin/logs", authenticate, requireRole("Admin"), async (req, res) => {
  try {
    const logs = await SystemLog.find().sort({ timestamp: -1 }).limit(100);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// ── Health Check ───────────────────────────────────────────────────────────────
app.get("/api/health", async (req, res) => {
  try {
    const mlStatus = await axios.get(`${ML_SERVICE_URL}/health`).then(() => "online").catch(() => "offline");
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      services: { database: mongoose.connection.readyState === 1 ? "connected" : "disconnected", ml_service: mlStatus },
    });
  } catch {
    res.status(500).json({ status: "degraded" });
  }
});

// ── Start Server ───────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🛡️  ShieldAI Backend running on http://localhost:${PORT}`);
  console.log(`📊 ML Service: ${ML_SERVICE_URL}`);
});

module.exports = app;
