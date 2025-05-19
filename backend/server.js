const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());


const profileData = {
  name: "Allen",
  collegeProgress: [
    "Completed 60 credits toward my Computer Science degree",
    "Aced courses like Data Structures, Algorithms, and Web Development",
    "Currently working on a capstone project for a local business",
    "Maintaining a 3.8 GPA"
  ],
  javaSkills: [
    "Proficient in object-oriented programming",
    "Built invoice generation programs with formatted output",
    "Experienced with exception handling and file I/O",
    "Developed applications using JDBC for database connectivity"
  ],
  sqlSkills: [
    "Skilled in writing complex queries with joins and aggregations",
    "Created PL/SQL procedures for invoice generation",
    "Experienced with triggers and the EVENT-CONDITION-ACTION model",
    "Proficient in using cursors and prepared statements"
  ]
};

// API route to get profile data
app.get('/api/profile', (req, res) => {
  res.json(profileData);
});

app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
});