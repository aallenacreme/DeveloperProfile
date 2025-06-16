// const express = require('express');
// const router = express.Router();
// const { verifyToken } = require('../middleware/auth');
// const profileService = require('../services/profileService');

// module.exports = (db) => {
//   router.get('/', (req, res) => {
//     const username = 'testuser';
//     const profile = profileService.getProfile(db, username);
//     if (!profile) {
//       return res.status(404).json({ error: 'Profile not found' });
//     }
//     res.json(profile);
//   });

//   router.put('/', verifyToken, (req, res) => {
//     try {
//       profileService.updateProfile(db, req.user.username, req.body);
//       res.json({ message: 'Profile updated' });
//     } catch (err) {
//       res.status(500).json({ error: 'Database error' });
//     }
//   });

//   return router;
// };
