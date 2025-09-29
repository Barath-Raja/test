export const registrationModel = (db) => {
  const createQuery = `
    CREATE TABLE IF NOT EXISTS registrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId VARCHAR(50) NOT NULL,
      paperTitle VARCHAR(255) NOT NULL,
      authors JSON NOT NULL,
      abstractBlob LONGBLOB,
      email VARCHAR(255) NOT NULL,
      tracks VARCHAR(255),
      country VARCHAR(255),
      state VARCHAR(255),
      city VARCHAR(255),
      status ENUM('submitted', 'under_review', 'accepted', 'rejected', 'published') DEFAULT 'submitted',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  db.query(createQuery, (err) => {
    if (err) {
      console.error("Table creation error:", err);
    } else {
      console.log("Registrations table created or already exists");

      // Add status column if it doesn't exist
      const alterQuery = `
        ALTER TABLE registrations
        ADD COLUMN status ENUM('submitted', 'under_review', 'accepted', 'rejected', 'published') DEFAULT 'submitted'
      `;
      db.query(alterQuery, (alterErr) => {
        if (alterErr && !alterErr.message.includes('Duplicate column name')) {
          console.error("Table alter error for status:", alterErr);
        } else {
          console.log("Status column added or already exists");
        }
      });

      // Add abstractBlob column if it doesn't exist
      const alterQuery2 = `
        ALTER TABLE registrations
        ADD COLUMN abstractBlob LONGBLOB
      `;
      db.query(alterQuery2, (alterErr2) => {
        if (alterErr2 && !alterErr2.message.includes('Duplicate column name')) {
          console.error("Table alter error for abstractBlob:", alterErr2);
        } else {
          console.log("AbstractBlob column added or already exists");
        }
      });

      // Add tracks column if it doesn't exist
      const alterQuery3 = `
        ALTER TABLE registrations
        ADD COLUMN tracks VARCHAR(255)
      `;
      db.query(alterQuery3, (alterErr3) => {
        if (alterErr3 && !alterErr3.message.includes('Duplicate column name')) {
          console.error("Table alter error for tracks:", alterErr3);
        } else {
          console.log("Tracks column added or already exists");
        }
      });

      // Add country column if it doesn't exist
      const alterQuery4 = `
        ALTER TABLE registrations
        ADD COLUMN country VARCHAR(255)
      `;
      db.query(alterQuery4, (alterErr4) => {
        if (alterErr4 && !alterErr4.message.includes('Duplicate column name')) {
          console.error("Table alter error for country:", alterErr4);
        } else {
          console.log("Country column added or already exists");
        }
      });

      // Add state column if it doesn't exist
      const alterQuery5 = `
        ALTER TABLE registrations
        ADD COLUMN state VARCHAR(255)
      `;
      db.query(alterQuery5, (alterErr5) => {
        if (alterErr5 && !alterErr5.message.includes('Duplicate column name')) {
          console.error("Table alter error for state:", alterErr5);
        } else {
          console.log("State column added or already exists");
        }
      });

      // Add city column if it doesn't exist
      const alterQuery6 = `
        ALTER TABLE registrations
        ADD COLUMN city VARCHAR(255)
      `;
      db.query(alterQuery6, (alterErr6) => {
        if (alterErr6 && !alterErr6.message.includes('Duplicate column name')) {
          console.error("Table alter error for city:", alterErr6);
        } else {
          console.log("City column added or already exists");
        }
      });
    }
  });

  // Create paper_assignments table
  const assignmentQuery = `
    CREATE TABLE IF NOT EXISTS paper_assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      paperId INT NOT NULL,
      reviewerId INT NOT NULL,
      assignedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (paperId) REFERENCES registrations(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewerId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_assignment (paperId, reviewerId)
    )
  `;
  db.query(assignmentQuery, (err) => {
    if (err) {
      console.error("Paper assignments table creation error:", err);
    }
  });

  // Create paper_reviews table
  const reviewQuery = `
    CREATE TABLE IF NOT EXISTS paper_reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      paperId INT NOT NULL,
      reviewerId INT NOT NULL,
      status ENUM('under_review', 'accepted', 'rejected', 'published') NOT NULL,
      comments TEXT,
      reviewedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (paperId) REFERENCES registrations(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewerId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_review (paperId, reviewerId)
    )
  `;
  db.query(reviewQuery, (err) => {
    if (err) {
      console.error("Paper reviews table creation error:", err);
    }
  });
};
