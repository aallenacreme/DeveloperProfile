const getProfile = (db, username, callback) => {
  db.get(`SELECT * FROM profiles WHERE username = ?`, [username], (err, row) => {
    if (err || !row) {
      return callback(err, null);
    }
    callback(null, {
      name: row.name,
      headerTitle: row.headerTitle,
      headerSubtitle: row.headerSubtitle,
      collegeProgress: JSON.parse(row.collegeProgress || '[]'),
      javaSkills: JSON.parse(row.javaSkills || '[]'),
      sqlSkills: JSON.parse(row.sqlSkills || '[]'),
      footerText: row.footerText,
      projectTitle: row.projectTitle,
      projectSubtitle: row.projectSubtitle,
      projectDuration: row.projectDuration,
      projectDescription: row.projectDescription,
      projectDetails: JSON.parse(row.projectDetails || '[]'),
    });
  });
};

const updateProfile = (db, username, data, callback) => {
  const {
    name, headerTitle, headerSubtitle, collegeProgress, javaSkills, sqlSkills,
    footerText, projectTitle, projectSubtitle, projectDuration, projectDescription, projectDetails
  } = data;
  db.run(
    `UPDATE profiles SET name = ?, headerTitle = ?, headerSubtitle = ?, collegeProgress = ?, javaSkills = ?, sqlSkills = ?, footerText = ?, projectTitle = ?, projectSubtitle = ?, projectDuration = ?, projectDescription = ?, projectDetails = ? WHERE username = ?`,
    [
      name, headerTitle, headerSubtitle, JSON.stringify(collegeProgress || []),
      JSON.stringify(javaSkills || []), JSON.stringify(sqlSkills || []),
      footerText, projectTitle, projectSubtitle, projectDuration, projectDescription,
      JSON.stringify(projectDetails || []), username
    ],
    callback
  );
};

module.exports = { getProfile, updateProfile };