-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE,
  username TEXT,
  free_plays_used INT DEFAULT 0,
  paid_sessions INT DEFAULT 0
);

-- GAME SESSIONS
CREATE TABLE IF NOT EXISTS game_sessions (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT,
  session_token TEXT UNIQUE,
  is_used BOOLEAN DEFAULT FALSE,
  score INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GAME SCORES
CREATE TABLE IF NOT EXISTS game_scores (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT,
  username TEXT,
  score INT,
  week INT
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT,
  tx_hash TEXT UNIQUE,
  amount DECIMAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OPTIONAL TEST DATA
INSERT INTO users (telegram_id, username, free_plays_used, paid_sessions)
VALUES (11111, 'testuser', 0, 5)
ON CONFLICT (telegram_id) DO NOTHING;