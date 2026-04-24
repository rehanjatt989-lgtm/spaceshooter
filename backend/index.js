require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');
const { v4: uuidv4 } = require('uuid');

const app = express();

/**
 * ✅ CORS (ALLOW ALL FOR NOW)
 */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

/**
 * ✅ IMPORTANT FIX (RENDER COMPATIBLE)
 */
const PORT = process.env.PORT || 3000;

/**
 * DATABASE
 */
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root123',
  database: process.env.DB_DATABASE || 'spaceshooter_db'
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
    process.exit(1);
  }
  console.log("✅ MySQL Connected");
});

/**
 * MIDDLEWARE
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * OPTIONAL: serve frontend (for testing only)
 */
app.use(express.static(path.join(__dirname, '../frontend')));

/**
 * HEALTH CHECK (IMPORTANT FOR RENDER)
 */
app.get('/', (req, res) => {
  res.send("API RUNNING ✅");
});

/**
 * START SESSION
 */
app.post('/api/start-session', (req, res) => {
  try {
    const { initData } = req.body;

    const params = new URLSearchParams(initData);
    const userRaw = params.get('user');

    if (!userRaw) {
      return res.status(400).json({ error: "No user data" });
    }

    const user = JSON.parse(userRaw);
    const username = user.username || user.first_name;

    db.query(
      `INSERT INTO users (telegram_id, username)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE username = VALUES(username)`,
      [user.id, username],
      (err) => {
        if (err) return res.status(500).json(err);

        db.query(
          `SELECT free_plays_used, paid_sessions FROM users WHERE telegram_id = ? LIMIT 1`,
          [user.id],
          (err2, results) => {
            if (err2) return res.status(500).json(err2);

            const userData = results[0];

            // ✅ TEMP LOGIC (ALLOW TESTING)
            if (userData.free_plays_used < 1) {
              db.query(`UPDATE users SET free_plays_used = free_plays_used + 1 WHERE telegram_id = ?`, [user.id]);
            } else if (userData.paid_sessions > 0) {
              db.query(`UPDATE users SET paid_sessions = paid_sessions - 1 WHERE telegram_id = ?`, [user.id]);
            } else {
              console.log("⚠️ No payment, but allowing for testing");
            }

            const sessionToken = uuidv4();

            db.query(
              `INSERT INTO game_sessions (telegram_id, session_token) VALUES (?, ?)`,
              [user.id, sessionToken],
              (err3) => {
                if (err3) return res.status(500).json(err3);

                res.json({
                  success: true,
                  sessionToken
                });
              }
            );
          }
        );
      }
    );

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * PAYMENT API (BASIC)
 */
app.post('/api/pay', (req, res) => {
  const { initData, tx_hash, amount } = req.body;

  try {
    const params = new URLSearchParams(initData);
    const user = JSON.parse(params.get('user'));

    if (!tx_hash || !amount) {
      return res.status(400).json({ error: "Missing payment data" });
    }

    db.query(
      `SELECT * FROM payments WHERE tx_hash = ?`,
      [tx_hash],
      (err, results) => {
        if (err) return res.status(500).json(err);

        if (results.length > 0) {
          return res.status(400).json({ error: "Transaction already used" });
        }

        db.query(
          `INSERT INTO payments (telegram_id, tx_hash, amount)
           VALUES (?, ?, ?)`,
          [user.id, tx_hash, amount],
          (err2) => {
            if (err2) return res.status(500).json(err2);

            db.query(
              `UPDATE users SET paid_sessions = paid_sessions + 5 WHERE telegram_id = ?`,
              [user.id]
            );

            res.json({
              success: true,
              sessions_added: 5
            });
          }
        );
      }
    );

  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GAME END
 */
app.post('/game/end', (req, res) => {
  const { initData, score, sessionToken, playTime } = req.body;

  try {
    const params = new URLSearchParams(initData);
    const user = JSON.parse(params.get('user'));

    db.query(
      `SELECT * FROM game_sessions WHERE session_token = ? LIMIT 1`,
      [sessionToken],
      (err, results) => {
        if (err) return res.status(500).json(err);

        if (results.length === 0) {
          return res.status(400).json({ error: "Invalid session" });
        }

        const session = results[0];

        if (session.telegram_id !== user.id) {
          return res.status(403).json({ error: "Unauthorized session" });
        }

        const SESSION_LIMIT = 5 * 60 * 1000;
        const sessionTime = new Date(session.created_at).getTime();

        if (Date.now() - sessionTime > SESSION_LIMIT) {
          return res.status(400).json({ error: "Session expired" });
        }

        if (session.is_used) {
          return res.json({ success: true, duplicate: true });
        }

        if (score > 500 && playTime < 3) {
          return res.status(400).json({ error: "Cheating detected" });
        }

        db.query(
          `UPDATE game_sessions SET is_used = TRUE WHERE session_token = ?`,
          [sessionToken]
        );

        db.query(
          `INSERT INTO game_scores (telegram_id, username, score, week)
           VALUES (?, ?, ?, ?)`,
          [user.id, user.first_name, score, 1]
        );

        res.json({ success: true });
      }
    );

  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * LEADERBOARD
 */
app.get('/api/leaderboard', (req, res) => {
  db.query(
    `SELECT * FROM game_scores ORDER BY score DESC LIMIT 50`,
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

/**
 * START SERVER
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});