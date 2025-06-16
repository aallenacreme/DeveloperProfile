// const express = require("express");
// const cors = require("cors");
// const swaggerUi = require("swagger-ui-express");
// const { swaggerDocs } = require("./config/swagger");
// const { initializeDatabase } = require("./config/database");
// const authRoutes = require("./routes/auth");
// const profileRoutes = require("./routes/profile");

// const app = express();
// const db = initializeDatabase();

// app.use(cors());
// app.use(express.json());
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// app.use("/api", authRoutes(db));
// app.use("/api/profile", profileRoutes(db));

// app.listen(5000, () => {
//   console.log("Server running on http://localhost:5000");
//   console.log("Swagger documentation at http://localhost:5000/api-docs");
// });

// const express = require("express");
// const jwt = require("jsonwebtoken");
// const router = express.Router();

// module.exports = (db) => {
//   router.post("/login", (req, res) => {
//     const { username, password } = req.body;
//     if (!username || !password) {
//       return res
//         .status(400)
//         .json({ error: "Username and password are required" });
//     }

//     const user = db
//       .prepare(`SELECT * FROM users WHERE username = ? AND password = ?`)
//       .get(username, password);
//     if (!user) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }

//     const token = jwt.sign({ username: user.username }, "your-secret-key", {
//       expiresIn: "1h",
//     });
//     res.json({ token });
//   });

//   return router;
// };
// const Database = require("better-sqlite3");

// const initializeDatabase = () => {
//   const db = new Database("./users.db");

//   db.prepare(
//     `CREATE TABLE IF NOT EXISTS users (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     username TEXT UNIQUE NOT NULL,
//     password TEXT NOT NULL
//   )`
//   ).run();

//   db.prepare(
//     `CREATE TABLE IF NOT EXISTS profiles (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     username TEXT UNIQUE NOT NULL,
//     name TEXT,
//     headerTitle TEXT,
//     headerSubtitle TEXT,
//     collegeProgress TEXT,
//     javaSkills TEXT,
//     sqlSkills TEXT,
//     footerText TEXT,
//     projectTitle TEXT,
//     projectSubtitle TEXT,
//     projectDuration TEXT,
//     projectDescription TEXT,
//     projectDetails TEXT
//   )`
//   ).run();

//   console.log("Connected to SQLite (better-sqlite3).");
//   return db;
// };

// module.exports = { initializeDatabase };
// const jwt = require("jsonwebtoken");

// const verifyToken = (req, res, next) => {
//   const token = req.headers["authorization"]?.split(" ")[1];
//   if (!token) {
//     return res.status(401).json({ error: "Authentication required" });
//   }
//   jwt.verify(token, "your-secret-key", (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ error: "Invalid token" });
//     }
//     req.user = decoded;
//     next();
//   });
// };

// module.exports = { verifyToken };
// const express = require("express");
// const router = express.Router();
// const { verifyToken } = require("../middleware/auth");
// const profileService = require("../services/profileService");

// module.exports = (db) => {
//   router.get("/", (req, res) => {
//     const username = "testuser";
//     const profile = profileService.getProfile(db, username);
//     if (!profile) {
//       return res.status(404).json({ error: "Profile not found" });
//     }
//     res.json(profile);
//   });

//   router.put("/", verifyToken, (req, res) => {
//     try {
//       profileService.updateProfile(db, req.user.username, req.body);
//       res.json({ message: "Profile updated" });
//     } catch (err) {
//       res.status(500).json({ error: "Database error" });
//     }
//   });

//   return router;
// };
// const getProfile = (db, username) => {
//   const row = db
//     .prepare("SELECT * FROM profiles WHERE username = ?")
//     .get(username);
//   if (!row) return null;

//   return {
//     name: row.name,
//     headerTitle: row.headerTitle,
//     headerSubtitle: row.headerSubtitle,
//     collegeProgress: JSON.parse(row.collegeProgress || "[]"),
//     javaSkills: JSON.parse(row.javaSkills || "[]"),
//     sqlSkills: JSON.parse(row.sqlSkills || "[]"),
//     footerText: row.footerText,
//     projectTitle: row.projectTitle,
//     projectSubtitle: row.projectSubtitle,
//     projectDuration: row.projectDuration,
//     projectDescription: row.projectDescription,
//     projectDetails: JSON.parse(row.projectDetails || "[]"),
//   };
// };

// const updateProfile = (db, username, data) => {
//   db.prepare(
//     `
//     UPDATE profiles SET
//       name = ?, headerTitle = ?, headerSubtitle = ?, collegeProgress = ?, javaSkills = ?,
//       sqlSkills = ?, footerText = ?, projectTitle = ?, projectSubtitle = ?,
//       projectDuration = ?, projectDescription = ?, projectDetails = ?
//     WHERE username = ?
//   `
//   ).run(
//     data.name,
//     data.headerTitle,
//     data.headerSubtitle,
//     JSON.stringify(data.collegeProgress || []),
//     JSON.stringify(data.javaSkills || []),
//     JSON.stringify(data.sqlSkills || []),
//     data.footerText,
//     data.projectTitle,
//     data.projectSubtitle,
//     data.projectDuration,
//     data.projectDescription,
//     JSON.stringify(data.projectDetails || []),
//     username
//   );
// };

// module.exports = { getProfile, updateProfile };
