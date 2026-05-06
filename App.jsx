import { useState, useEffect, createContext, useContext } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// ─── Theme Context ───────────────────────────────────────────────────────────
const ThemeContext = createContext();
const AuthContext = createContext();

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_TRANSACTIONS = [
  { id: "TXN001", amount: 4520.00, merchant: "Amazon", location: "New York", time: "2024-01-15 14:23", risk: "High", fraud: true, confidence: 94.2, user: "john@example.com" },
  { id: "TXN002", amount: 89.99, merchant: "Starbucks", location: "Chicago", time: "2024-01-15 09:11", risk: "Low", fraud: false, confidence: 98.7, user: "jane@example.com" },
  { id: "TXN003", amount: 1200.50, merchant: "Best Buy", location: "Miami", time: "2024-01-14 22:45", risk: "Medium", fraud: false, confidence: 71.3, user: "john@example.com" },
  { id: "TXN004", amount: 15000.00, merchant: "Unknown Merchant", location: "Lagos", time: "2024-01-14 03:22", risk: "High", fraud: true, confidence: 97.8, user: "admin@example.com" },
  { id: "TXN005", amount: 45.00, merchant: "Netflix", location: "Los Angeles", time: "2024-01-13 18:00", risk: "Low", fraud: false, confidence: 99.1, user: "jane@example.com" },
  { id: "TXN006", amount: 3400.00, merchant: "Jewelry Store", location: "Dubai", time: "2024-01-13 11:33", risk: "High", fraud: true, confidence: 91.5, user: "admin@example.com" },
  { id: "TXN007", amount: 220.00, merchant: "Walmart", location: "Dallas", time: "2024-01-12 15:44", risk: "Low", fraud: false, confidence: 97.2, user: "john@example.com" },
  { id: "TXN008", amount: 890.00, merchant: "Apple Store", location: "San Francisco", time: "2024-01-12 10:22", risk: "Medium", fraud: false, confidence: 68.9, user: "jane@example.com" },
];

const FRAUD_TREND = [
  { month: "Aug", fraud: 23, legit: 1240 },
  { month: "Sep", fraud: 31, legit: 1380 },
  { month: "Oct", fraud: 18, legit: 1520 },
  { month: "Nov", fraud: 45, legit: 1690 },
  { month: "Dec", fraud: 52, legit: 1810 },
  { month: "Jan", fraud: 38, legit: 1950 },
];

const PIE_DATA = [
  { name: "Legitimate", value: 9562, color: "#10b981" },
  { name: "Fraudulent", value: 207, color: "#ef4444" },
];

const SYSTEM_LOGS = [
  { time: "2024-01-15 14:23:01", level: "ALERT", message: "High-risk transaction TXN001 flagged for review" },
  { time: "2024-01-15 09:11:44", level: "INFO", message: "Transaction TXN002 processed - Low risk" },
  { time: "2024-01-14 22:45:12", level: "WARN", message: "Unusual location detected for TXN003" },
  { time: "2024-01-14 03:22:08", level: "ALERT", message: "FRAUD DETECTED - TXN004 blocked immediately" },
  { time: "2024-01-14 03:22:09", level: "INFO", message: "Email alert sent to cardholder for TXN004" },
  { time: "2024-01-13 18:00:00", level: "INFO", message: "Recurring subscription TXN005 verified" },
];

const USERS = [
  { id: 1, name: "John Smith", email: "john@example.com", role: "User", status: "Active", transactions: 127, joined: "2023-06-12" },
  { id: 2, name: "Jane Doe", email: "jane@example.com", role: "Analyst", status: "Active", transactions: 89, joined: "2023-08-05" },
  { id: 3, name: "Admin User", email: "admin@example.com", role: "Admin", status: "Active", transactions: 312, joined: "2023-01-01" },
  { id: 4, name: "Bob Wilson", email: "bob@example.com", role: "User", status: "Suspended", transactions: 34, joined: "2023-11-20" },
];

// ─── Utility Components ───────────────────────────────────────────────────────
const Badge = ({ type, children }) => {
  const styles = {
    High: "bg-red-100 text-red-700 border border-red-200",
    Medium: "bg-amber-100 text-amber-700 border border-amber-200",
    Low: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    fraud: "bg-red-100 text-red-700 border border-red-200",
    legit: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    Admin: "bg-purple-100 text-purple-700 border border-purple-200",
    Analyst: "bg-blue-100 text-blue-700 border border-blue-200",
    User: "bg-slate-100 text-slate-600 border border-slate-200",
    Active: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    Suspended: "bg-red-100 text-red-700 border border-red-200",
    ALERT: "bg-red-100 text-red-700",
    INFO: "bg-blue-100 text-blue-700",
    WARN: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${styles[type] || styles[children] || "bg-slate-100 text-slate-600"}`}>
      {children}
    </span>
  );
};

const StatCard = ({ icon, label, value, sub, color }) => {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    red: "from-red-500 to-red-600",
    green: "from-emerald-500 to-emerald-600",
    purple: "from-violet-500 to-violet-600",
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white text-lg mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
    </div>
  );
};

// ─── Landing Page ─────────────────────────────────────────────────────────────
const LandingPage = ({ onNavigate }) => {
  const { dark } = useContext(ThemeContext);
  const [animIdx, setAnimIdx] = useState(0);
  const words = ["Intelligent", "Real-Time", "AI-Powered", "Reliable"];

  useEffect(() => {
    const t = setInterval(() => setAnimIdx(i => (i + 1) % words.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-violet-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-6">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            Live Protection Active — 9,769 transactions monitored today
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight tracking-tight">
            <span className="text-blue-400">{words[animIdx]}</span>
            <br />Fraud Detection
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Enterprise-grade ML-powered fraud detection protecting your financial transactions in real time with 99.2% accuracy.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => onNavigate("login")} className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-500/25">
              Get Started Free
            </button>
            <button onClick={() => onNavigate("login")} className="border border-slate-500 hover:border-blue-400 text-slate-300 hover:text-blue-400 px-8 py-3 rounded-xl font-semibold transition-all">
              View Demo →
            </button>
          </div>
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
            {[
              { v: "$2.4B+", l: "Fraud Prevented" },
              { v: "99.2%", l: "Detection Accuracy" },
              { v: "12M+", l: "Transactions Monitored" },
              { v: "<50ms", l: "Response Time" },
            ].map(s => (
              <div key={s.l} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-3xl font-black text-blue-400">{s.v}</p>
                <p className="text-sm text-slate-400 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-800 dark:text-slate-100 mb-4">Built for Financial Security</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">Advanced machine learning algorithms analyze hundreds of features per transaction in milliseconds.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "🧠", title: "ML-Powered Analysis", desc: "Gradient boosting model trained on 5M+ fraud cases with real-time inference pipeline.", color: "blue" },
              { icon: "⚡", title: "Real-Time Detection", desc: "Sub-50ms latency prediction engine processes transactions before they complete.", color: "purple" },
              { icon: "📊", title: "Advanced Analytics", desc: "Interactive dashboards with fraud trend analysis, risk scoring, and compliance reports.", color: "green" },
              { icon: "🔔", title: "Instant Alerts", desc: "Email and SMS notifications the moment suspicious activity is detected.", color: "amber" },
              { icon: "🔒", title: "Bank-Grade Security", desc: "End-to-end encryption, SOC2 compliant, PCI-DSS certified infrastructure.", color: "red" },
              { icon: "🌍", title: "Global Coverage", desc: "Cross-border transaction monitoring across 190+ countries and 50+ currencies.", color: "teal" },
            ].map(f => (
              <div key={f.title} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-2">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-center">
        <h2 className="text-4xl font-black mb-4">Ready to Protect Your Business?</h2>
        <p className="text-blue-100 mb-8 text-lg">Join 500+ financial institutions using ShieldAI</p>
        <button onClick={() => onNavigate("signup")} className="bg-white text-blue-600 px-10 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all hover:scale-105">
          Start Free Trial
        </button>
      </section>
    </div>
  );
};

// ─── Auth Pages ───────────────────────────────────────────────────────────────
const AuthPage = ({ mode, onNavigate, onLogin }) => {
  const [form, setForm] = useState({ email: "", password: "", name: "", role: "User" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");
    if (!form.email || !form.password) { setError("Please fill all fields"); return; }
    setLoading(true);
    setTimeout(() => {
      const roles = { "admin@example.com": "Admin", "jane@example.com": "Analyst" };
      onLogin({ name: form.name || form.email.split("@")[0], email: form.email, role: roles[form.email] || "User" });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-blue-500/40">🛡️</div>
          <h1 className="text-2xl font-black text-white">{mode === "login" ? "Welcome Back" : "Create Account"}</h1>
          <p className="text-slate-400 text-sm mt-1">ShieldAI Fraud Detection Platform</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">{error}</div>}
          {mode === "signup" && (
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Full Name</label>
              <input className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100" placeholder="John Smith" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
          )}
          <div className="mb-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Email</label>
            <input type="email" className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100" placeholder="admin@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="mb-6">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Password</label>
            <input type="password" className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          {mode === "login" && (
            <div className="mb-4 text-xs text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
              <strong className="text-slate-600 dark:text-slate-300">Demo accounts:</strong><br />
              admin@example.com → Admin role<br />
              jane@example.com → Analyst role<br />
              any other email → User role
            </div>
          )}
          <button onClick={handleSubmit} disabled={loading} className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-all">
            {loading ? "Authenticating..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
          <p className="text-center text-sm text-slate-500 mt-4">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => onNavigate(mode === "login" ? "signup" : "login")} className="text-blue-500 hover:text-blue-400 font-medium">
              {mode === "login" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ user, page, onNavigate, onLogout, collapsed, setCollapsed }) => {
  const links = [
    { id: "dashboard", label: "Dashboard", icon: "⊞", roles: ["User", "Analyst", "Admin"] },
    { id: "detect", label: "Fraud Detection", icon: "🔍", roles: ["User", "Analyst", "Admin"] },
    { id: "analytics", label: "Analytics", icon: "📈", roles: ["Analyst", "Admin"] },
    { id: "admin", label: "Admin Panel", icon: "⚙️", roles: ["Admin"] },
    { id: "docs", label: "API Docs", icon: "📄", roles: ["User", "Analyst", "Admin"] },
  ].filter(l => l.roles.includes(user?.role));

  return (
    <aside className={`${collapsed ? "w-16" : "w-60"} flex-shrink-0 bg-slate-900 min-h-screen flex flex-col transition-all duration-300 border-r border-slate-800`}>
      <div className="p-4 flex items-center justify-between border-b border-slate-800">
        {!collapsed && <div className="flex items-center gap-2"><span className="text-2xl">🛡️</span><span className="font-black text-white text-lg">ShieldAI</span></div>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors ml-auto">
          {collapsed ? "›" : "‹"}
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(l => (
          <button key={l.id} onClick={() => onNavigate(l.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${page === l.id ? "bg-blue-500 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
            <span className="text-base flex-shrink-0">{l.icon}</span>
            {!collapsed && <span>{l.label}</span>}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-800">
        <div className={`flex items-center gap-3 px-3 py-2.5 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.name}</p>
              <p className="text-slate-500 text-xs">{user?.role}</p>
            </div>
          )}
          {!collapsed && <button onClick={onLogout} className="text-slate-500 hover:text-red-400 text-xs transition-colors">Exit</button>}
        </div>
      </div>
    </aside>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => (
  <div className="p-6 space-y-6">
    <div>
      <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Overview Dashboard</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time monitoring and fraud statistics</p>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon="⚠️" label="Fraud Cases Today" value="38" sub="+12% from yesterday" color="red" />
      <StatCard icon="✅" label="Legitimate Txns" value="1,931" sub="99.2% of total" color="green" />
      <StatCard icon="💳" label="Total Volume" value="$4.2M" sub="Today's transactions" color="blue" />
      <StatCard icon="⚡" label="Avg. Response" value="42ms" sub="Model inference time" color="purple" />
    </div>
    {/* Charts */}
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
        <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 text-sm">Fraud vs Legitimate Transactions (6 months)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={FRAUD_TREND} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="legit" fill="#10b981" radius={[4, 4, 0, 0]} name="Legitimate" />
            <Bar dataKey="fraud" fill="#ef4444" radius={[4, 4, 0, 0]} name="Fraud" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
        <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 text-sm">Transaction Breakdown</h3>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
              {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2 mt-2">
          {PIE_DATA.map(d => (
            <div key={d.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: d.color }} />
                <span className="text-slate-600 dark:text-slate-400">{d.name}</span>
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{d.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    {/* Recent Transactions */}
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">Recent Transactions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>{["ID", "Amount", "Merchant", "Location", "Time", "Risk", "Status"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {MOCK_TRANSACTIONS.slice(0, 5).map(t => (
              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{t.id}</td>
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">${t.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{t.merchant}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-500">{t.location}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-500 text-xs">{t.time}</td>
                <td className="px-4 py-3"><Badge type={t.risk}>{t.risk}</Badge></td>
                <td className="px-4 py-3"><Badge type={t.fraud ? "fraud" : "legit"}>{t.fraud ? "FRAUD" : "Legitimate"}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// ─── Fraud Detection Page ─────────────────────────────────────────────────────
const FraudDetection = () => {
  const [tab, setTab] = useState("manual");
  const [form, setForm] = useState({ amount: "", merchant: "", location: "", hour: "14", day: "3", category: "retail" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [csvResults, setCsvResults] = useState([]);

  const predict = () => {
    if (!form.amount) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const amount = parseFloat(form.amount);
      const isFraud = amount > 3000 || form.location.toLowerCase().includes("lagos") || form.location.toLowerCase().includes("unknown");
      const confidence = isFraud ? (85 + Math.random() * 12).toFixed(1) : (92 + Math.random() * 7).toFixed(1);
      const risk = isFraud ? "High" : amount > 1000 ? "Medium" : "Low";
      setResult({ fraud: isFraud, confidence: parseFloat(confidence), risk, amount });
      setLoading(false);
    }, 1800);
  };

  const uploadCSV = () => {
    if (!file) return;
    setLoading(true);
    setTimeout(() => {
      setCsvResults(MOCK_TRANSACTIONS.slice(0, 5).map(t => ({
        ...t,
        processed: true,
      })));
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Fraud Detection</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Analyze individual transactions or upload a CSV batch</p>
      </div>
      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {["manual", "csv"].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
            {t === "manual" ? "Manual Input" : "CSV Upload"}
          </button>
        ))}
      </div>

      {tab === "manual" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 space-y-4">
            <h2 className="font-bold text-slate-700 dark:text-slate-200">Transaction Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Amount ($)</label>
                <input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Merchant</label>
                <input placeholder="Amazon" value={form.merchant} onChange={e => setForm({ ...form, merchant: e.target.value })} className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Location</label>
                <input placeholder="New York" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100">
                  <option value="retail">Retail</option>
                  <option value="food">Food & Dining</option>
                  <option value="travel">Travel</option>
                  <option value="online">Online Shopping</option>
                  <option value="atm">ATM Withdrawal</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Hour (0–23)</label>
                <input type="number" min="0" max="23" value={form.hour} onChange={e => setForm({ ...form, hour: e.target.value })} className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Day of Week</label>
                <select value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100">
                  {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((d,i) => <option key={d} value={i+1}>{d}</option>)}
                </select>
              </div>
            </div>
            <button onClick={predict} disabled={loading} className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
              {loading ? <><span className="animate-spin">⟳</span> Analyzing...</> : "🔍 Run Fraud Analysis"}
            </button>
          </div>

          {/* Result Panel */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Enter transaction details and run analysis</p>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">ML model will analyze 200+ features</p>
              </div>
            )}
            {loading && (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="text-5xl mb-4 animate-spin">⟳</div>
                <p className="text-slate-600 dark:text-slate-300 font-semibold">Running ML inference...</p>
                <p className="text-slate-400 text-sm mt-1">Analyzing 200+ transaction features</p>
                <div className="w-48 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mt-4 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full animate-pulse w-2/3" />
                </div>
              </div>
            )}
            {result && !loading && (
              <div className="space-y-5">
                <div className={`rounded-2xl p-5 text-center ${result.fraud ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" : "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"}`}>
                  <div className="text-4xl mb-2">{result.fraud ? "🚨" : "✅"}</div>
                  <h3 className={`text-2xl font-black ${result.fraud ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {result.fraud ? "FRAUD DETECTED" : "LEGITIMATE"}
                  </h3>
                  <p className={`text-sm mt-1 ${result.fraud ? "text-red-500" : "text-emerald-500"}`}>
                    Confidence: {result.confidence}%
                  </p>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Risk Level", value: <Badge type={result.risk}>{result.risk}</Badge> },
                    { label: "Transaction Amount", value: `$${parseFloat(result.amount).toLocaleString()}` },
                    { label: "Model Confidence", value: `${result.confidence}%` },
                    { label: "Decision", value: result.fraud ? "🚫 Block Transaction" : "✅ Approve Transaction" },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <span className="text-sm text-slate-500 dark:text-slate-400">{r.label}</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{r.value}</span>
                    </div>
                  ))}
                </div>
                {result.fraud && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300">
                    ⚠️ Alert email has been sent to the cardholder. Transaction is pending review.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "csv" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
            <h2 className="font-bold text-slate-700 dark:text-slate-200 mb-4">Upload Transaction CSV</h2>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl p-10 text-center hover:border-blue-400 transition-colors">
              <div className="text-4xl mb-3">📁</div>
              <p className="text-slate-600 dark:text-slate-300 font-medium mb-1">Drop your CSV file here</p>
              <p className="text-slate-400 text-sm mb-4">Required columns: amount, merchant, location, timestamp</p>
              <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} className="hidden" id="csv-upload" />
              <label htmlFor="csv-upload" className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-5 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                Browse Files
              </label>
              {file && <p className="mt-3 text-sm text-blue-500 font-medium">✓ {file.name}</p>}
            </div>
            <button onClick={uploadCSV} disabled={!file || loading} className="mt-4 w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all">
              {loading ? "Processing batch..." : "Process Batch Transactions"}
            </button>
          </div>
          {csvResults.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">Batch Results — {csvResults.length} transactions processed</h3>
                <button className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition-colors">📥 Download PDF Report</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-700/50">
                    <tr>{["ID", "Amount", "Merchant", "Risk", "Verdict", "Confidence"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {csvResults.map(t => (
                      <tr key={t.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 ${t.fraud ? "bg-red-50/30 dark:bg-red-900/10" : ""}`}>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{t.id}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">${t.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{t.merchant}</td>
                        <td className="px-4 py-3"><Badge type={t.risk}>{t.risk}</Badge></td>
                        <td className="px-4 py-3"><Badge type={t.fraud ? "fraud" : "legit"}>{t.fraud ? "FRAUD" : "Legit"}</Badge></td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{t.confidence}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Analytics Page ───────────────────────────────────────────────────────────
const Analytics = () => {
  const [dateFilter, setDateFilter] = useState("7d");
  const [riskFilter, setRiskFilter] = useState("all");

  const lineData = [
    { date: "Jan 10", fraud: 12, amount: 45000 },
    { date: "Jan 11", fraud: 19, amount: 72000 },
    { date: "Jan 12", fraud: 8, amount: 31000 },
    { date: "Jan 13", fraud: 27, amount: 98000 },
    { date: "Jan 14", fraud: 45, amount: 165000 },
    { date: "Jan 15", fraud: 38, amount: 142000 },
    { date: "Jan 16", fraud: 22, amount: 83000 },
  ];

  const filtered = MOCK_TRANSACTIONS.filter(t => riskFilter === "all" || t.risk === riskFilter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Deep dive into fraud patterns and trends</p>
        </div>
        <div className="flex gap-2">
          {["24h", "7d", "30d", "90d"].map(d => (
            <button key={d} onClick={() => setDateFilter(d)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${dateFilter === d ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"}`}>{d}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🎯" label="Detection Rate" value="99.2%" sub="Model accuracy" color="green" />
        <StatCard icon="❌" label="False Positives" value="0.8%" sub="Type I errors" color="red" />
        <StatCard icon="💰" label="Fraud Amount" value="$448K" sub="Period total" color="blue" />
        <StatCard icon="⏱️" label="Avg Block Time" value="23ms" sub="From detection" color="purple" />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
        <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 text-sm">Fraud Incidents Over Time</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={lineData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="fraud" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 4 }} name="Fraud Cases" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Transaction Table with filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">Transaction History</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Risk:</span>
            {["all", "High", "Medium", "Low"].map(r => (
              <button key={r} onClick={() => setRiskFilter(r)} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${riskFilter === r ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"}`}>{r}</button>
            ))}
            <button className="ml-2 text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg font-medium">📥 Export CSV</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>{["ID", "Amount", "Merchant", "Location", "Date", "Risk", "Verdict", "Confidence"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {filtered.map(t => (
                <tr key={t.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${t.fraud ? "bg-red-50/20 dark:bg-red-900/5" : ""}`}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{t.id}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">${t.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{t.merchant}</td>
                  <td className="px-4 py-3 text-slate-500">{t.location}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{t.time}</td>
                  <td className="px-4 py-3"><Badge type={t.risk}>{t.risk}</Badge></td>
                  <td className="px-4 py-3"><Badge type={t.fraud ? "fraud" : "legit"}>{t.fraud ? "FRAUD" : "Legit"}</Badge></td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{t.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Admin Panel ──────────────────────────────────────────────────────────────
const AdminPanel = () => {
  const [adminTab, setAdminTab] = useState("users");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Admin Panel</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">System management and oversight</p>
      </div>
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {[["users", "👥 Users"], ["transactions", "💳 Transactions"], ["logs", "📋 System Logs"], ["alerts", "🔔 Alerts"]].map(([id, label]) => (
          <button key={id} onClick={() => setAdminTab(id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${adminTab === id ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>{label}</button>
        ))}
      </div>

      {adminTab === "users" && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">User Management — {USERS.length} accounts</h3>
            <button className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-blue-400 transition-colors">+ Add User</button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>{["Name", "Email", "Role", "Status", "Transactions", "Joined", "Actions"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {USERS.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">{u.name[0]}</div>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3"><Badge type={u.role}>{u.role}</Badge></td>
                  <td className="px-4 py-3"><Badge type={u.status}>{u.status}</Badge></td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.transactions}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{u.joined}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-xs text-blue-500 hover:text-blue-400 font-medium">Edit</button>
                      <button className="text-xs text-red-500 hover:text-red-400 font-medium">Suspend</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {adminTab === "transactions" && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">All Transactions</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>{["ID", "User", "Amount", "Merchant", "Risk", "Status"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {MOCK_TRANSACTIONS.map(t => (
                <tr key={t.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 ${t.fraud ? "bg-red-50/20 dark:bg-red-900/5" : ""}`}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{t.id}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">{t.user}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">${t.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{t.merchant}</td>
                  <td className="px-4 py-3"><Badge type={t.risk}>{t.risk}</Badge></td>
                  <td className="px-4 py-3"><Badge type={t.fraud ? "fraud" : "legit"}>{t.fraud ? "FRAUD" : "Legit"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {adminTab === "logs" && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">System Logs</h3>
          </div>
          <div className="p-4 space-y-2 font-mono text-xs">
            {SYSTEM_LOGS.map((log, i) => (
              <div key={i} className={`flex gap-3 items-start p-2.5 rounded-lg ${log.level === "ALERT" ? "bg-red-50 dark:bg-red-900/20" : log.level === "WARN" ? "bg-amber-50 dark:bg-amber-900/20" : "bg-slate-50 dark:bg-slate-700/30"}`}>
                <span className="text-slate-400 shrink-0">{log.time}</span>
                <Badge type={log.level}>{log.level}</Badge>
                <span className={`${log.level === "ALERT" ? "text-red-600 dark:text-red-400" : log.level === "WARN" ? "text-amber-600 dark:text-amber-400" : "text-slate-600 dark:text-slate-400"}`}>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminTab === "alerts" && (
        <div className="space-y-4">
          {MOCK_TRANSACTIONS.filter(t => t.fraud).map(t => (
            <div key={t.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-red-200 dark:border-red-800 flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🚨</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">Fraud Alert — {t.id}</h4>
                  <span className="text-xs text-slate-400">{t.time}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Fraudulent transaction of <strong>${t.amount.toLocaleString()}</strong> at {t.merchant} ({t.location}) — confidence {t.confidence}%</p>
                <div className="flex gap-2 mt-3">
                  <button className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-red-400 transition-colors">Block Card</button>
                  <button className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg font-medium">Mark Reviewed</button>
                  <button className="text-xs text-blue-500 px-3 py-1.5 font-medium">Send Alert</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── API Docs Page ────────────────────────────────────────────────────────────
const ApiDocs = () => {
  const endpoints = [
    { method: "POST", path: "/api/auth/login", desc: "Authenticate user and get JWT token", body: '{ "email": "user@example.com", "password": "secret" }', response: '{ "token": "eyJ...", "user": { "id": 1, "role": "Admin" } }' },
    { method: "POST", path: "/api/predict", desc: "Run fraud detection on a single transaction", body: '{ "amount": 1500.00, "merchant": "Amazon", "location": "NY", "hour": 14, "day_of_week": 2, "category": "retail" }', response: '{ "is_fraud": false, "confidence": 97.3, "risk_level": "Low", "model_version": "v2.1" }' },
    { method: "POST", path: "/api/predict/batch", desc: "Process multiple transactions from CSV upload", body: 'multipart/form-data with file field', response: '{ "processed": 150, "fraud_count": 3, "results": [...] }' },
    { method: "GET", path: "/api/transactions", desc: "Get transaction history with optional filters", body: "Query params: risk, from_date, to_date, limit", response: '{ "transactions": [...], "total": 9769, "page": 1 }' },
    { method: "GET", path: "/api/analytics/summary", desc: "Get aggregated fraud analytics", body: "Query param: period (7d, 30d, 90d)", response: '{ "total_fraud": 207, "amount": 448000, "accuracy": 99.2 }' },
    { method: "GET", path: "/api/admin/users", desc: "List all users (Admin only)", body: "JWT required with Admin role", response: '{ "users": [...] }' },
  ];

  const colors = { GET: "bg-emerald-100 text-emerald-700", POST: "bg-blue-100 text-blue-700", DELETE: "bg-red-100 text-red-700" };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">API Documentation</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">RESTful API reference — Base URL: <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-xs">https://api.shieldai.io/v1</code></p>
      </div>
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">🔐 Authentication: Include JWT in headers — <code className="bg-blue-100 dark:bg-blue-800 px-1.5 py-0.5 rounded text-xs">Authorization: Bearer {"{token}"}</code></p>
      </div>
      <div className="space-y-4">
        {endpoints.map((ep, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-700">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${colors[ep.method]}`}>{ep.method}</span>
              <code className="font-mono text-sm text-slate-700 dark:text-slate-300">{ep.path}</code>
              <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">— {ep.desc}</span>
            </div>
            <div className="grid md:grid-cols-2 divide-x divide-slate-100 dark:divide-slate-700">
              <div className="p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Request</p>
                <pre className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">{ep.body}</pre>
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Response</p>
                <pre className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">{ep.response}</pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = ({ onNavigate, dark, toggleDark, user }) => (
  <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
    <button onClick={() => onNavigate("landing")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <span className="text-2xl">🛡️</span>
      <span className="font-black text-xl">ShieldAI</span>
    </button>
    <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
      <button onClick={() => onNavigate("landing")} className="hover:text-white transition-colors">Features</button>
      <button onClick={() => onNavigate("landing")} className="hover:text-white transition-colors">Pricing</button>
      <button onClick={() => onNavigate("docs")} className="hover:text-white transition-colors">Docs</button>
    </nav>
    <div className="flex items-center gap-3">
      <button onClick={toggleDark} className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center text-sm transition-colors">{dark ? "☀️" : "🌙"}</button>
      {user ? (
        <button onClick={() => onNavigate("dashboard")} className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">Dashboard</button>
      ) : (
        <>
          <button onClick={() => onNavigate("login")} className="text-slate-300 hover:text-white text-sm transition-colors">Sign In</button>
          <button onClick={() => onNavigate("signup")} className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">Get Started</button>
        </>
      )}
    </div>
  </header>
);

// ─── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(false);
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notification, setNotification] = useState(null);

  const isDashboardPage = ["dashboard", "detect", "analytics", "admin", "docs"].includes(page);

  const handleLogin = (userData) => {
    setUser(userData);
    setPage("dashboard");
    showNotif(`Welcome back, ${userData.name}! 🎉`);
  };

  const handleLogout = () => {
    setUser(null);
    setPage("landing");
  };

  const navigate = (dest) => {
    if (["dashboard", "detect", "analytics", "admin", "docs"].includes(dest) && !user) {
      setPage("login");
      return;
    }
    if (dest === "admin" && user?.role !== "Admin") return;
    setPage(dest);
  };

  const showNotif = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <ThemeContext.Provider value={{ dark, toggleDark: () => setDark(!dark) }}>
      <div className={`${dark ? "dark" : ""} min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors`}>
        {/* Notification */}
        {notification && (
          <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl text-sm font-medium animate-pulse">
            {notification}
          </div>
        )}

        {!isDashboardPage && (
          <Navbar onNavigate={navigate} dark={dark} toggleDark={() => setDark(!dark)} user={user} />
        )}

        {page === "landing" && <LandingPage onNavigate={navigate} />}
        {page === "login" && <AuthPage mode="login" onNavigate={navigate} onLogin={handleLogin} />}
        {page === "signup" && <AuthPage mode="signup" onNavigate={navigate} onLogin={handleLogin} />}

        {isDashboardPage && user && (
          <div className="flex min-h-screen">
            <Sidebar user={user} page={page} onNavigate={navigate} onLogout={handleLogout} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
            <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950">
              {/* Top bar */}
              <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 capitalize">{page}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    ML Model Online
                  </div>
                  <button onClick={() => setDark(!dark)} className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    {dark ? "☀️" : "🌙"}
                  </button>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                </div>
              </div>
              {page === "dashboard" && <Dashboard />}
              {page === "detect" && <FraudDetection />}
              {page === "analytics" && <Analytics />}
              {page === "admin" && <AdminPanel />}
              {page === "docs" && <ApiDocs />}
            </main>
          </div>
        )}
      </div>
    </ThemeContext.Provider>
  );
}
