import { db } from "../config/db.js";

export const saveRegistration = (formData, callback) => {
  const { userId, paperTitle, authors, abstract, tracks, country, state, city } = formData;
  const email = authors.length > 0 ? authors[0].email : '';

  console.log("Abstract buffer size:", abstract ? abstract.length : 0);

  const sql = `INSERT INTO registrations (userId, paperTitle, authors, abstractBlob, email, tracks, country, state, city)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [userId, paperTitle, JSON.stringify(authors), abstract, email, tracks, country, state, city], (err, result) => {
    if (err) {
      callback(err);
    } else {
      // Return the inserted ID in the result
      callback(null, result);
    }
  });
};
