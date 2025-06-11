const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

module.exports = (db) => {
  /**
   * @swagger
   * /api/login:
   *   post:
   *     summary: Log in a user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Successful login
   *       400:
   *         description: Missing credentials
   *       401:
   *         description: Invalid credentials
   */
  router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign({ username: user.username }, 'your-secret-key', { expiresIn: '1h' });
      res.json({ token });
    });
  });

  return router;
};