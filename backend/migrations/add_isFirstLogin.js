import { db } from '../config/db.js';

const addIsFirstLoginColumn = () => {
  // First, check if the column already exists
  const checkQuery = "SHOW COLUMNS FROM users LIKE 'isFirstLogin'";
  db.query(checkQuery, (err, results) => {
    if (err) {
      console.error('Error checking column:', err);
      process.exit(1);
    }

    if (results.length === 0) {
      // Column doesn't exist, add it
      const addQuery = "ALTER TABLE users ADD COLUMN isFirstLogin TINYINT(1) DEFAULT 0";
      db.query(addQuery, (err, result) => {
        if (err) {
          console.error('Error adding isFirstLogin column:', err);
          process.exit(1);
        } else {
          console.log('isFirstLogin column added successfully.');
          process.exit(0);
        }
      });
    } else {
      console.log('isFirstLogin column already exists.');
      process.exit(0);
    }
  });
};

addIsFirstLoginColumn();
