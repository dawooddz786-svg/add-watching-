import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import fs from "fs";

const db = new Database("database.db");
const JWT_SECRET = "ad-watching-secret-key";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    balance REAL DEFAULT 0,
    total_earnings REAL DEFAULT 0,
    referral_code TEXT UNIQUE,
    referred_by INTEGER,
    role TEXT DEFAULT 'user',
    is_active INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS deposits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL NOT NULL,
    screenshot_url TEXT,
    status TEXT DEFAULT 'pending',
    approved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL NOT NULL,
    method TEXT NOT NULL,
    account_details TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    duration INTEGER DEFAULT 30,
    reward REAL DEFAULT 300,
    is_active INTEGER DEFAULT 1,
    target_user_id INTEGER DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(target_user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS free_activations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    activated_at DATE DEFAULT (date('now')),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS user_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    task_id INTEGER,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(task_id) REFERENCES tasks(id)
  );

  CREATE TABLE IF NOT EXISTS referrals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    referrer_id INTEGER,
    referee_id INTEGER,
    bonus_amount REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(referrer_id) REFERENCES users(id),
    FOREIGN KEY(referee_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  INSERT OR IGNORE INTO settings (key, value) VALUES ('min_deposit', '1500');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('min_withdrawal', '500');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('video_reward', '300');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('referral_bonus', '200');
`);

// Seed Admin if not exists
const adminEmail = "admin@adwatching.com";
const existingAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get(adminEmail);
if (!existingAdmin) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (name, phone, email, password, role) VALUES (?, ?, ?, ?, ?)").run(
    "Admin", "0000000000", adminEmail, hashedPassword, "admin"
  );
}

// Seed some initial tasks
const taskCount = db.prepare("SELECT COUNT(*) as count FROM tasks").get() as { count: number };
if (taskCount.count === 0) {
  const initialTasks = [
    { title: "Watch & Earn Task 1", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "Watch & Earn Task 2", url: "https://www.youtube.com/watch?v=jNQXAC9IVRw" },
    { title: "Watch & Earn Task 3", url: "https://www.youtube.com/watch?v=kJQP7kiw5Fk" },
  ];
  const insertTask = db.prepare("INSERT INTO tasks (title, youtube_url, reward) VALUES (?, ?, ?)");
  initialTasks.forEach(t => insertTask.run(t.title, t.url, 300));
}

// Update existing tasks to 300 PKR reward if they are still at 20 PKR
db.prepare("UPDATE tasks SET reward = 300 WHERE reward = 20").run();

const app = express();
app.use(express.json());

// File Upload Setup
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });
app.use("/uploads", express.static(uploadDir));

// Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  next();
};

// Helper to get setting
const getSetting = (key: string, defaultValue: string) => {
  const setting = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as any;
  return setting ? setting.value : defaultValue;
};

// Auth Routes
app.post("/api/auth/signup", (req, res) => {
  const { name, phone, email, password, referredByCode } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // Short referral code: e.g. TAR123
    const generateShortCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const nums = '0123456789';
      let code = '';
      for (let i = 0; i < 3; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
      for (let i = 0; i < 3; i++) code += nums.charAt(Math.floor(Math.random() * nums.length));
      return code;
    };
    
    let referralCode = generateShortCode();
    // Ensure uniqueness
    while (db.prepare("SELECT id FROM users WHERE referral_code = ?").get(referralCode)) {
      referralCode = generateShortCode();
    }
    
    let referredByUserId = null;
    if (referredByCode) {
      const referrer = db.prepare("SELECT id FROM users WHERE referral_code = ?").get(referredByCode) as any;
      if (referrer) referredByUserId = referrer.id;
    }

    const result = db.prepare(
      "INSERT INTO users (name, phone, email, password, referral_code, referred_by) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(name, phone, email, hashedPassword, referralCode, referredByUserId);

    const userId = result.lastInsertRowid;
    const user = { id: userId, name, role: 'user', email };
    const token = jwt.sign({ id: userId, role: 'user' }, JWT_SECRET);

    // Referral bonus is now handled on first deposit approval
    res.json({ success: true, token, user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
});

app.get("/api/auth/me", authenticate, (req: any, res) => {
  const user = db.prepare("SELECT id, name, phone, email, balance, total_earnings, referral_code, role, is_active FROM users WHERE id = ?").get(req.user.id);
  res.json(user);
});

// User Routes
app.get("/api/user/dashboard", authenticate, (req: any, res) => {
  const user = db.prepare("SELECT balance, total_earnings, is_active FROM users WHERE id = ?").get(req.user.id) as any;
  const completedTasks = db.prepare("SELECT COUNT(*) as count FROM user_tasks WHERE user_id = ?").get(req.user.id) as any;
  const referralCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE referred_by = ?").get(req.user.id) as any;
  const depositHistory = db.prepare("SELECT * FROM deposits WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
  const withdrawalHistory = db.prepare("SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
  
  // Check if user has an approved deposit to enable tasks
  const lastApprovedDeposit = db.prepare("SELECT approved_at FROM deposits WHERE user_id = ? AND status = 'approved' ORDER BY approved_at DESC LIMIT 1").get(req.user.id) as any;

  res.json({
    balance: user.balance,
    totalEarnings: user.total_earnings,
    isActive: user.is_active,
    completedTasks: completedTasks.count,
    referralCount: referralCount.count,
    depositHistory,
    withdrawalHistory,
    lastApprovedDeposit: lastApprovedDeposit?.approved_at || null
  });
});

// Deposit Routes
app.post("/api/deposits", authenticate, upload.single("screenshot"), (req: any, res) => {
  const { amount } = req.body;
  const screenshotUrl = req.file ? `/uploads/${req.file.filename}` : null;
  db.prepare("INSERT INTO deposits (user_id, amount, screenshot_url) VALUES (?, ?, ?)")
    .run(req.user.id, amount, screenshotUrl);
  res.json({ success: true });
});

// Withdrawal Routes
app.post("/api/withdrawals", authenticate, (req: any, res) => {
  const { amount, method, accountDetails } = req.body;
  const user = db.prepare("SELECT balance FROM users WHERE id = ?").get(req.user.id) as any;
  const minWithdrawal = parseInt(getSetting('min_withdrawal', '500'));
  
  if (amount < minWithdrawal) return res.status(400).json({ error: `Minimum withdrawal is ${minWithdrawal} PKR` });
  if (user.balance < amount) return res.status(400).json({ error: "Insufficient balance" });

  db.prepare("INSERT INTO withdrawals (user_id, amount, method, account_details) VALUES (?, ?, ?, ?)")
    .run(req.user.id, amount, method, accountDetails);
  db.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").run(amount, req.user.id);
  
  res.json({ success: true });
});

// Task Routes
app.get("/api/tasks", authenticate, (req: any, res) => {
  const user = db.prepare("SELECT is_active FROM users WHERE id = ?").get(req.user.id) as any;
  if (!user.is_active) return res.json([]);

  const tasks = db.prepare(`
    SELECT t.* FROM tasks t 
    WHERE t.is_active = 1 
    AND (t.target_user_id IS NULL OR t.target_user_id = ?)
    AND t.id NOT IN (
      SELECT task_id FROM user_tasks 
      WHERE user_id = ? AND date(completed_at) = date('now')
    )
  `).all(req.user.id, req.user.id);
  res.json(tasks);
});

app.post("/api/tasks/:id/complete", authenticate, (req: any, res) => {
  const user = db.prepare("SELECT is_active FROM users WHERE id = ?").get(req.user.id) as any;
  if (!user.is_active) return res.status(403).json({ error: "Account not active. Please make a deposit." });

  const taskId = req.params.id;
  const task = db.prepare("SELECT reward FROM tasks WHERE id = ?").get(taskId) as any;
  
  // Check if already completed today
  const alreadyDone = db.prepare("SELECT id FROM user_tasks WHERE user_id = ? AND task_id = ? AND date(completed_at) = date('now')").get(req.user.id, taskId);
  if (alreadyDone) return res.status(400).json({ error: "Task already completed today" });

  db.prepare("INSERT INTO user_tasks (user_id, task_id) VALUES (?, ?)").run(req.user.id, taskId);
  db.prepare("UPDATE users SET balance = balance + ?, total_earnings = total_earnings + ? WHERE id = ?")
    .run(task.reward, task.reward, req.user.id);
  
  res.json({ success: true, reward: task.reward });
});

// Admin Routes
app.get("/api/admin/deposits", authenticate, isAdmin, (req, res) => {
  const deposits = db.prepare(`
    SELECT d.*, u.name as user_name, u.email as user_email 
    FROM deposits d 
    JOIN users u ON d.user_id = u.id 
    ORDER BY d.created_at DESC
  `).all();
  res.json(deposits);
});

app.post("/api/admin/deposits/:id/approve", authenticate, isAdmin, (req, res) => {
  const id = req.params.id;
  const deposit = db.prepare("SELECT user_id, amount FROM deposits WHERE id = ?").get(id) as any;
  
  db.prepare("UPDATE deposits SET status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
  
  // Activate user account
  db.prepare("UPDATE users SET is_active = 1 WHERE id = ?").run(deposit.user_id);

  // Check if this is the user's first approved deposit to give referral bonus
  const user = db.prepare("SELECT referred_by FROM users WHERE id = ?").get(deposit.user_id) as any;
  if (user && user.referred_by) {
    const alreadyRewarded = db.prepare("SELECT id FROM referrals WHERE referee_id = ?").get(deposit.user_id);
    if (!alreadyRewarded) {
      const referralBonus = parseInt(getSetting('referral_bonus', '200'));
      db.prepare("INSERT INTO referrals (referrer_id, referee_id, bonus_amount) VALUES (?, ?, ?)")
        .run(user.referred_by, deposit.user_id, referralBonus);
      db.prepare("UPDATE users SET balance = balance + ?, total_earnings = total_earnings + ? WHERE id = ?")
        .run(referralBonus, referralBonus, user.referred_by);
    }
  }
  
  res.json({ success: true });
});

app.post("/api/admin/deposits/:id/reject", authenticate, isAdmin, (req, res) => {
  const id = req.params.id;
  db.prepare("UPDATE deposits SET status = 'rejected' WHERE id = ?").run(id);
  res.json({ success: true });
});

app.get("/api/admin/withdrawals", authenticate, isAdmin, (req, res) => {
  const withdrawals = db.prepare(`
    SELECT w.*, u.name as user_name, u.email as user_email 
    FROM withdrawals w 
    JOIN users u ON w.user_id = u.id 
    ORDER BY w.created_at DESC
  `).all();
  res.json(withdrawals);
});

app.post("/api/admin/withdrawals/:id/approve", authenticate, isAdmin, (req, res) => {
  const id = req.params.id;
  db.prepare("UPDATE withdrawals SET status = 'approved' WHERE id = ?").run(id);
  res.json({ success: true });
});

app.post("/api/admin/withdrawals/:id/reject", authenticate, isAdmin, (req, res) => {
  const id = req.params.id;
  const withdrawal = db.prepare("SELECT user_id, amount FROM withdrawals WHERE id = ?").get(id) as any;
  db.prepare("UPDATE withdrawals SET status = 'rejected' WHERE id = ?").run(id);
  // Refund user
  db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(withdrawal.amount, withdrawal.user_id);
  res.json({ success: true });
});

app.get("/api/admin/settings", authenticate, isAdmin, (req, res) => {
  const settings = db.prepare("SELECT * FROM settings").all();
  res.json(settings);
});

app.post("/api/admin/settings", authenticate, isAdmin, (req, res) => {
  const { min_deposit, min_withdrawal, video_reward, referral_bonus } = req.body;
  const update = db.prepare("UPDATE settings SET value = ? WHERE key = ?");
  if (min_deposit) update.run(min_deposit, 'min_deposit');
  if (min_withdrawal) update.run(min_withdrawal, 'min_withdrawal');
  if (video_reward) update.run(video_reward, 'video_reward');
  if (referral_bonus) update.run(referral_bonus, 'referral_bonus');
  res.json({ success: true });
});

app.get("/api/admin/stats", authenticate, isAdmin, (req, res) => {
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get() as any;
  const depositedUsers = db.prepare("SELECT COUNT(DISTINCT user_id) as count FROM deposits WHERE status = 'approved'").get() as any;
  const totalDeposits = db.prepare("SELECT SUM(amount) as sum FROM deposits WHERE status = 'approved'").get() as any;
  const activeTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE is_active = 1").get() as any;
  const todayEarnings = db.prepare("SELECT SUM(reward) as sum FROM user_tasks ut JOIN tasks t ON ut.task_id = t.id WHERE date(ut.completed_at) = date('now')").get() as any;
  
  res.json({
    totalUsers: totalUsers.count,
    depositedUsers: depositedUsers.count,
    nonDepositedUsers: totalUsers.count - depositedUsers.count,
    totalDeposits: totalDeposits.sum || 0,
    activeTasks: activeTasks.count,
    todayEarnings: todayEarnings.sum || 0
  });
});

app.get("/api/admin/users", authenticate, isAdmin, (req, res) => {
  const users = db.prepare(`
    SELECT 
      u.id, u.name, u.email, u.phone, u.balance, u.role, u.is_active, u.created_at,
      (SELECT COALESCE(SUM(amount), 0) FROM deposits WHERE user_id = u.id AND status = 'approved') as total_deposits,
      CASE 
        WHEN EXISTS (SELECT 1 FROM deposits WHERE user_id = u.id AND status = 'approved') THEN 'Deposited'
        ELSE 'Not Deposited'
      END as deposit_status,
      (SELECT COUNT(*) FROM users WHERE referred_by = u.id) as referral_count,
      (SELECT COALESCE(SUM(bonus_amount), 0) FROM referrals WHERE referrer_id = u.id) as total_referral_earnings
    FROM users u
    ORDER BY u.created_at DESC
  `).all();
  res.json(users);
});

app.get("/api/admin/tasks", authenticate, isAdmin, (req, res) => {
  const tasks = db.prepare(`
    SELECT t.*, u.email as target_user_email 
    FROM tasks t 
    LEFT JOIN users u ON t.target_user_id = u.id 
    ORDER BY t.created_at DESC
  `).all();
  res.json(tasks);
});

app.post("/api/admin/tasks", authenticate, isAdmin, (req, res) => {
  const { title, youtube_url, duration, reward, is_active, target_user_email } = req.body;
  
  let targetUserId = null;
  if (target_user_email) {
    const user = db.prepare("SELECT id FROM users WHERE email = ?").get(target_user_email) as any;
    if (!user) return res.status(404).json({ error: "Target user not found" });
    targetUserId = user.id;
  }

  const count = db.prepare("SELECT COUNT(*) as count FROM tasks").get() as { count: number };
  if (count.count >= 50) { // Increased limit for custom tasks
    return res.status(400).json({ error: "Maximum 50 tasks allowed" });
  }

  db.prepare("INSERT INTO tasks (title, youtube_url, duration, reward, is_active, target_user_id) VALUES (?, ?, ?, ?, ?, ?)")
    .run(title, youtube_url, duration || 30, reward || 300, is_active !== undefined ? is_active : 1, targetUserId);
  res.json({ success: true });
});

app.put("/api/admin/tasks/:id", authenticate, isAdmin, (req, res) => {
  const { title, youtube_url, duration, reward, is_active, target_user_email } = req.body;
  
  let targetUserId = null;
  if (target_user_email) {
    const user = db.prepare("SELECT id FROM users WHERE email = ?").get(target_user_email) as any;
    if (!user) return res.status(404).json({ error: "Target user not found" });
    targetUserId = user.id;
  }

  db.prepare("UPDATE tasks SET title = ?, youtube_url = ?, duration = ?, reward = ?, is_active = ?, target_user_id = ? WHERE id = ?")
    .run(title, youtube_url, duration, reward, is_active, targetUserId, req.params.id);
  res.json({ success: true });
});

app.delete("/api/admin/tasks/:id", authenticate, isAdmin, (req, res) => {
  db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.post("/api/admin/users/free-activate", authenticate, isAdmin, (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ error: "Email or User ID is required" });

    const idStr = identifier.toString().trim();

    // Check daily limit
    const todayActivation = db.prepare("SELECT id FROM free_activations WHERE activated_at = date('now')").get();
    if (todayActivation) {
      return res.status(400).json({ error: "Daily free activation limit reached (1 per day)" });
    }

    // Find user by email (case-insensitive) or ID
    const user = db.prepare("SELECT id, is_active FROM users WHERE LOWER(email) = LOWER(?) OR id = ?").get(idStr, idStr) as any;
    
    if (!user) return res.status(404).json({ error: "User not found with that Email or ID" });
    
    if (user.is_active) return res.status(400).json({ error: "User account is already active" });

    // Create a dummy approved deposit to activate account and bypass 24h rule
    // We set approved_at to 25 hours ago so tasks unlock immediately
    db.prepare("INSERT INTO deposits (user_id, amount, status, approved_at) VALUES (?, ?, 'approved', datetime('now', '-25 hours'))")
      .run(user.id, 0);
    
    // Activate user account
    db.prepare("UPDATE users SET is_active = 1 WHERE id = ?").run(user.id);

    // Record the free activation
    db.prepare("INSERT INTO free_activations (user_id) VALUES (?)").run(user.id);
    
    res.json({ success: true });
  } catch (err: any) {
    console.error("Free activation error:", err);
    res.status(500).json({ error: "Internal server error during activation" });
  }
});

async function startServer() {
  const PORT = 3000;
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
