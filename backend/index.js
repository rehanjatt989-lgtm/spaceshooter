require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();

/**
 * =========================
 * CORS
 * =========================
 */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

/**
 * =========================
 * PORT (RENDER COMPATIBLE)
 * =========================
 */
const PORT = process.env.PORT || 3000;

/**
 * =========================
 * POSTGRES (SUPABASE)
 * =========================
 * IMPORTANT: force IPv4
 */
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 6543,
  ssl: {
    rejectUnauthorized: false
  },
  family: 4 // ✅ VERY IMPORTANT FIX (prevents ::1 error)
});

/**
 * =========================
 * DB TEST
 * =========================
 */
pool.connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch(err => {
    console.error("❌ DB Error:", err.message);
    process.exit(1);
  });

/**
 * =========================
 * MIDDLEWARE
 * =========================
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * OPTIONAL: serve frontend (local testing only)
 */
app.use(express.static(path.join(__dirname, '../frontend')));

/**
 * =========================
 * HEALTH CHECK
 * =========================
 */
app.get('/', (req, res) => {
  res.send("API RUNNING ✅");
});

/**
 * =========================
 * START SESSION
 * =========================
 */
app.post('/api/start-session', async (req, res) => {
  try {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ error: "Missing initData" });
    }

    const params = new URLSearchParams(initData);
    const userRaw = params.get('user');

    if (!userRaw) {
      return res.status(400).json({ error: "No user data" });
    }

    const user = JSON.parse(userRaw);
    const username = user.username || user.first_name || "player";

    /**
     * CREATE USER
     */
    await pool.query(
      `INSERT INTO users (telegram_id, username)
       VALUES ($1, $2)
       ON CONFLICT (telegram_id)
       DO UPDATE SET username = EXCLUDED.username`,
      [user.id, username]
    );

    /**
     * GET USER DATA
     */
    const result = await pool.query(
      `SELECT free_plays_used, paid_sessions 
       FROM users 
       WHERE telegram_id = $1 
       LIMIT 1`,
      [user.id]
    );

    const userData = result.rows[0];

    /**
     * ENTRY LOGIC
     */
    if (userData.free_plays_used < 1) {
      await pool.query(
        `UPDATE users 
         SET free_plays_used = free_plays_used + 1 
         WHERE telegram_id = $1`,
        [user.id]
      );
    } else if (userData.paid_sessions > 0) {
      await pool.query(
        `UPDATE users 
         SET paid_sessions = paid_sessions - 1 
         WHERE telegram_id = $1`,
        [user.id]
      );
    } else {
      return res.status(403).json({ error: "No plays available" });
    }

    /**
     * CREATE SESSION
     */
    const sessionToken = uuidv4();

    await pool.query(
      `INSERT INTO game_sessions (telegram_id, session_token)
       VALUES ($1, $2)`,
      [user.id, sessionToken]
    );

    res.json({ success: true, sessionToken });

  } catch (err) {
    console.error("❌ START SESSION ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * =========================
 * LEADERBOARD
 * =========================
 */
app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM game_scores ORDER BY score DESC LIMIT 50`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Leaderboard error" });
  }
});

/**
 * =========================
 * START SERVER
 * =========================
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});