/**
 * ShieldAI — Database Schema & Seed Script
 * Supports MongoDB (via Mongoose) with optional PostgreSQL notes
 */

// ── MongoDB Schema Definitions ─────────────────────────────────────────────────

const mongoose = require("mongoose");

/**
 * USERS Collection
 * Stores account info, hashed passwords, and role-based permissions
 */
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true, minlength: 60 }, // bcrypt hash
  role: { type: String, enum: ["User", "Analyst", "Admin"], default: "User" },
  status: { type: String, enum: ["Active", "Suspended", "Pending"], default: "Active" },
  phone: String,
  lastLogin: Date,
  loginCount: { type: Number, default: 0 },
  apiKey: { type: String, sparse: true, unique: true }, // for API access
  emailVerified: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  alertPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    minRiskLevel: { type: String, enum: ["Low", "Medium", "High"], default: "High" },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

/**
 * TRANSACTIONS Collection
 * Stores every analyzed transaction with prediction results
 */
const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  
  // Raw transaction data
  amount: { type: Number, required: true },
  currency: { type: String, default: "USD", maxlength: 3 },
  merchant: { type: String, default: "Unknown" },
  merchantCategory: String,
  location: String,
  country: { type: String, maxlength: 2 }, // ISO 3166-1 alpha-2
  latitude: Number,
  longitude: Number,
  ipAddress: String,
  deviceId: String,
  cardLast4: String,
  
  // Time features
  hour: { type: Number, min: 0, max: 23 },
  dayOfWeek: { type: Number, min: 1, max: 7 },
  category: {
    type: String,
    enum: ["retail", "food", "travel", "online", "atm", "entertainment", "healthcare", "utilities", "other"],
    default: "other",
  },
  
  // ML prediction results
  isFraud: { type: Boolean, default: false, index: true },
  confidence: { type: Number, min: 0, max: 100 },
  riskLevel: { type: String, enum: ["Low", "Medium", "High"], index: true },
  fraudScore: { type: Number, min: 0, max: 1 }, // raw probability
  modelVersion: String,
  processingTimeMs: Number,
  featuresUsed: Number,
  
  // Outcome tracking
  status: { type: String, enum: ["Approved", "Blocked", "Pending Review", "Reversed"], default: "Approved" },
  reviewed: { type: Boolean, default: false },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewedAt: Date,
  reviewNotes: String,
  alertSent: { type: Boolean, default: false },
  
  timestamp: { type: Date, default: Date.now, index: true },
});

// Compound indexes for analytics queries
TransactionSchema.index({ userId: 1, timestamp: -1 });
TransactionSchema.index({ isFraud: 1, timestamp: -1 });
TransactionSchema.index({ riskLevel: 1, isFraud: 1 });

/**
 * SYSTEM_LOGS Collection
 * Audit trail for all system events
 */
const SystemLogSchema = new mongoose.Schema({
  level: { type: String, enum: ["INFO", "WARN", "ALERT", "ERROR"], index: true },
  message: { type: String, required: true },
  metadata: mongoose.Schema.Types.Mixed,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
  ip: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now, index: true, expires: "90d" }, // TTL: 90 days
});

/**
 * FRAUD_ALERTS Collection
 * Track sent alerts and their resolution status
 */
const FraudAlertSchema = new mongoose.Schema({
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["Email", "SMS", "Webhook", "In-App"] },
  status: { type: String, enum: ["Sent", "Failed", "Acknowledged", "Dismissed"], default: "Sent" },
  resolvedAt: Date,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = {
  User: mongoose.model("User", UserSchema),
  Transaction: mongoose.model("Transaction", TransactionSchema),
  SystemLog: mongoose.model("SystemLog", SystemLogSchema),
  FraudAlert: mongoose.model("FraudAlert", FraudAlertSchema),
};

// ── PostgreSQL Equivalent Schema (for pg/Prisma users) ─────────────────────────
/*

-- schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(60) NOT NULL,
  role VARCHAR(20) DEFAULT 'User' CHECK (role IN ('User', 'Analyst', 'Admin')),
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Pending')),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(12,2) NOT NULL,
  currency CHAR(3) DEFAULT 'USD',
  merchant VARCHAR(255),
  location VARCHAR(255),
  category VARCHAR(50),
  hour SMALLINT CHECK (hour BETWEEN 0 AND 23),
  day_of_week SMALLINT CHECK (day_of_week BETWEEN 1 AND 7),
  is_fraud BOOLEAN DEFAULT FALSE,
  confidence DECIMAL(5,2),
  risk_level VARCHAR(10) CHECK (risk_level IN ('Low', 'Medium', 'High')),
  fraud_score DECIMAL(5,4),
  model_version VARCHAR(20),
  status VARCHAR(20) DEFAULT 'Approved',
  reviewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_is_fraud ON transactions(is_fraud);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_risk_level ON transactions(risk_level);

CREATE TABLE system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level VARCHAR(10) CHECK (level IN ('INFO', 'WARN', 'ALERT', 'ERROR')),
  message TEXT NOT NULL,
  metadata JSONB,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fraud_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id),
  user_id UUID REFERENCES users(id),
  type VARCHAR(20),
  status VARCHAR(20) DEFAULT 'Sent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

*/

// ── Seed Script ────────────────────────────────────────────────────────────────
async function seedDatabase() {
  const bcrypt = require("bcryptjs");
  const { User, Transaction } = module.exports;

  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/shieldai");
  console.log("Connected to MongoDB for seeding...");

  // Create admin user
  const adminExists = await User.findOne({ email: "admin@shieldai.io" });
  if (!adminExists) {
    await User.create({
      name: "Admin User",
      email: "admin@shieldai.io",
      password: await bcrypt.hash("admin123!", 12),
      role: "Admin",
      status: "Active",
      emailVerified: true,
    });
    console.log("✅ Admin user created: admin@shieldai.io / admin123!");
  }

  // Create analyst
  const analystExists = await User.findOne({ email: "analyst@shieldai.io" });
  if (!analystExists) {
    await User.create({
      name: "Jane Analyst",
      email: "analyst@shieldai.io",
      password: await bcrypt.hash("analyst123!", 12),
      role: "Analyst",
      status: "Active",
      emailVerified: true,
    });
    console.log("✅ Analyst user created: analyst@shieldai.io / analyst123!");
  }

  console.log("🌱 Database seeded successfully");
  process.exit(0);
}

if (require.main === module) {
  seedDatabase().catch(console.error);
}
