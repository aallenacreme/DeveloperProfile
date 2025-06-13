const Database = require('better-sqlite3');

const initializeDatabase = () => {
  const db = new Database('./users.db');

  db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`).run();

  db.prepare(`CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    name TEXT,
    headerTitle TEXT,
    headerSubtitle TEXT,
    collegeProgress TEXT,
    javaSkills TEXT,
    sqlSkills TEXT,
    footerText TEXT,
    projectTitle TEXT,
    projectSubtitle TEXT,
    projectDuration TEXT,
    projectDescription TEXT,
    projectDetails TEXT
  )`).run();

  console.log('Connected to SQLite (better-sqlite3).');
  return db;
};

module.exports = { initializeDatabase };
