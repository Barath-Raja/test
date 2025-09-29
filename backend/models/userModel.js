export const userModel = (db) => {
  const createQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NULL,
      googleId VARCHAR(255) NULL,
      role ENUM('user', 'reviewer', 'admin') DEFAULT 'user',
      track VARCHAR(255),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(createQuery, (err) => {
    if (err) {
      console.error("User table creation error:", err);
    }
  });

  // Add track column if it doesn't exist (for existing databases)
  const alterQuery = `ALTER TABLE users ADD COLUMN track VARCHAR(255)`;
  db.query(alterQuery, (err) => {
    if (err) {
      // Column might already exist, which is fine
      if (err.code !== 'ER_DUP_FIELDNAME') {
        console.error("User table alter error:", err);
      } else {
        console.log("Track column already exists in users table");
      }
    } else {
      console.log("Track column added to users table successfully");
    }
  });
};
