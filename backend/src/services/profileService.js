// const getProfile = (db, username) => {
//   const row = db.prepare('SELECT * FROM profiles WHERE username = ?').get(username);
//   if (!row) return null;

//   return {
//     name: row.name,
//     headerTitle: row.headerTitle,
//     headerSubtitle: row.headerSubtitle,
//     collegeProgress: JSON.parse(row.collegeProgress || '[]'),
//     javaSkills: JSON.parse(row.javaSkills || '[]'),
//     sqlSkills: JSON.parse(row.sqlSkills || '[]'),
//     footerText: row.footerText,
//     projectTitle: row.projectTitle,
//     projectSubtitle: row.projectSubtitle,
//     projectDuration: row.projectDuration,
//     projectDescription: row.projectDescription,
//     projectDetails: JSON.parse(row.projectDetails || '[]'),
//   };
// };

// const updateProfile = (db, username, data) => {
//   db.prepare(`
//     UPDATE profiles SET
//       name = ?, headerTitle = ?, headerSubtitle = ?, collegeProgress = ?, javaSkills = ?,
//       sqlSkills = ?, footerText = ?, projectTitle = ?, projectSubtitle = ?,
//       projectDuration = ?, projectDescription = ?, projectDetails = ?
//     WHERE username = ?
//   `).run(
//     data.name, data.headerTitle, data.headerSubtitle, JSON.stringify(data.collegeProgress || []),
//     JSON.stringify(data.javaSkills || []), JSON.stringify(data.sqlSkills || []),
//     data.footerText, data.projectTitle, data.projectSubtitle, data.projectDuration,
//     data.projectDescription, JSON.stringify(data.projectDetails || []), username
//   );
// };

// module.exports = { getProfile, updateProfile };
