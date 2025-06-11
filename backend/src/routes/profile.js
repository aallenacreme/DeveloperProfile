// src/routes/profile.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth'); // Fixed path
const profileService = require('../services/profileService');

module.exports = (db) => {
  /**
   * @swagger
   * /api/profile:
   *   get:
   *     summary: Get developer profile
   *     description: Publicly accessible profile data
   *     responses:
   *       200:
   *         description: Profile data
   *       404:
   *         description: Profile not found
   *       500:
   *         description: Server error
   */
router.get('/', (req, res) => {
  const username = 'testuser';
  profileService.getProfile(db, username, (err, profile) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  });
});

  /**
   * @swagger
   * /api/profile:
   *   put:
   *     summary: Update developer profile
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name: { type: string }
   *               headerTitle: { type: string }
   *               headerSubtitle: { type: string }
   *               collegeProgress: { type: array, items: { type: string } }
   *               javaSkills: { type: array, items: { type: string } }
   *               sqlSkills: { type: array, items: { type: string } }
   *               footerText: { type: string }
   *               projectTitle: { type: string }
   *               projectSubtitle: { type: string }
   *               projectDuration: { type: string }
   *               projectDescription: { type: string }
   *               projectDetails: { type: array, items: { type: string } }
   *     responses:
   *       200:
   *         description: Profile updated
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  router.put('/', verifyToken, (req, res) => {
    profileService.updateProfile(db, req.user.username, req.body, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Profile updated' });
    });
  });

  return router;
};