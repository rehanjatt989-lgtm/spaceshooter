USE spaceshooter_db;

CREATE TABLE IF NOT EXISTS users (
id INT AUTO_INCREMENT PRIMARY KEY,
telegram_id BIGINT UNIQUE,
username VARCHAR(255),
free_plays_used INT DEFAULT 0,
paid_sessions INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS game_sessions (
id INT AUTO_INCREMENT PRIMARY KEY,
telegram_id BIGINT,
session_token VARCHAR(255) UNIQUE,
is_used BOOLEAN DEFAULT FALSE,
score INT DEFAULT 0,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_scores (
id INT AUTO_INCREMENT PRIMARY KEY,
telegram_id BIGINT,
username VARCHAR(255),
score INT,
week INT
);
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  UPDATE users 
SET free_plays_used = 0, paid_sessions = 5
WHERE telegram_id = 11111;
  telegram_id BIGINT,
  tx_hash VARCHAR(255) UNIQUE,
  amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
UPDATE users 
SET free_plays_used = 0, paid_sessions = 0 
WHERE telegram_id = 11111;
UPDATE users 
SET free_plays_used = 0, paid_sessions = 5 
WHERE id = 1;