// const express = require('express');
// const jwt = require('jsonwebtoken');
// const router = express.Router();

// module.exports = (db) => {
//   router.post('/login', (req, res) => {
//     const { username, password } = req.body;
//     if (!username || !password) {
//       return res.status(400).json({ error: 'Username and password are required' });
//     }

//     const user = db.prepare(`SELECT * FROM users WHERE username = ? AND password = ?`).get(username, password);
//     if (!user) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const token = jwt.sign({ username: user.username }, 'your-secret-key', { expiresIn: '1h' });
//     res.json({ token });
//   });

//   return router;
// };
