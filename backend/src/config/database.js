const sqlite3 = require('sqlite3').verbose();

const initializeDatabase = () => {
  const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
      console.error('Database error:', err.message);
      return;
    }
    console.log('Connected to SQLite database.');
  });

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS profiles (
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
  )`);

  return db;
};

module.exports = { initializeDatabase };