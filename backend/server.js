const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const profileData = {
  name: 'Allen',
  collegeProgress: [
    'Completed 60 credits toward my Computer Science degree',
    'Aced courses like Data Structures, Algorithms, and Web Development',
    'Currently working on a capstone project for a local business',
    'Maintaining a 3.8 GPA',
  ],
  javaSkills: [
    'Proficient in object-oriented programming',
    'Built invoice generation programs with formatted output',
    'Experienced with exception handling and file I/O',
    'Developed applications using JDBC for database connectivity',
  ],
  sqlSkills: [
    'Skilled in writing complex queries with joins and aggregations',
    'Created PL/SQL procedures for invoice generation',
    'Experienced with triggers and the EVENT-CONDITION-ACTION model',
    'Proficient in using cursors and prepared statements',
  ],
  headerTitle: 'Allen Mahdi',
  headerSubtitle: 'Software Developer',
  footerText: 'Footer',
  githubUrl: 'https://github.com/aallenacreme',
  projectTitle: 'Motion-Controlled Kiosk System',
  projectSubtitle: 'Class Project – Computer Science Course, University of New Orleans',
  projectDuration: 'August 2024 – Present',
  projectDescription: 'Developing a user-friendly interface for a Raspberry Pi-based kiosk system enabling motionless hand interactions through LeetMotion technology.',
  projectDetails: [
    'Utilizing Python and LeetMotion for advanced gesture recognition capabilities.',
    'Focused on enhancing accessibility and user interaction in school environments.',
    'Collaborating in a team of 25 to design, test, and deploy the system across campus TVs.',
    'Emphasis on robust performance and ease of use in public-facing deployments.'
  ]
};

// API route to get profile data
app.get('/api/profile', (req, res) => {
  res.json(profileData);
});

app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
});