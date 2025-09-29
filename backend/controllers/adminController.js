// List all assignments (admin)
export const getAllAssignments = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const { fromDate, toDate, paperTracks, reviewerTracks } = req.query;
  let query = `
    SELECT pa.paperId, pa.reviewerId, r.paperTitle, u.name as reviewerName, u.email as reviewerEmail, u.track, r.createdAt, r.tracks as paperTracks
    FROM paper_assignments pa
    JOIN registrations r ON pa.paperId = r.id
    JOIN users u ON pa.reviewerId = u.id
  `;
  const params = [];
  const conditions = [];

  if (fromDate) {
    conditions.push('r.createdAt >= ?');
    params.push(fromDate);
  }
  if (toDate) {
    conditions.push('r.createdAt < DATE_ADD(?, INTERVAL 1 DAY)');
    params.push(toDate);
  }
  if (paperTracks) {
    const tracks = Array.isArray(paperTracks) ? paperTracks : [paperTracks];
    const placeholders = tracks.map(() => '?').join(',');
    conditions.push(`r.tracks IN (${placeholders})`);
    params.push(...tracks);
  }
  if (reviewerTracks) {
    const tracks = Array.isArray(reviewerTracks) ? reviewerTracks : [reviewerTracks];
    const placeholders = tracks.map(() => '?').join(',');
    conditions.push(`u.track IN (${placeholders})`);
    params.push(...tracks);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY r.paperTitle';

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('DB error fetching assignments:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

// Delete assignment (unassign reviewer from paper)
export const deleteAssignment = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  const { paperId } = req.params;
  if (!paperId) {
    return res.status(400).json({ error: 'Paper ID is required' });
  }
  const deleteQuery = 'DELETE FROM paper_assignments WHERE paperId = ?';
  db.query(deleteQuery, [paperId], (err, result) => {
    if (err) {
      console.error('DB error deleting assignment:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Assignment deleted successfully', paperId });
  });
};

// Update assignment (change reviewer for a paper)
export const updateAssignment = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  const { paperId } = req.params;
  const { reviewerId } = req.body;
  if (!paperId || !reviewerId) {
    return res.status(400).json({ error: 'Paper ID and reviewer ID are required' });
  }
  // First, check if assignment exists
  const checkQuery = 'SELECT * FROM paper_assignments WHERE paperId = ?';
  db.query(checkQuery, [paperId], (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    // Update assignment
    const updateQuery = 'UPDATE paper_assignments SET reviewerId = ? WHERE paperId = ?';
    db.query(updateQuery, [reviewerId, paperId], (err, result) => {
      if (err) {
        console.error('DB error updating assignment:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Assignment updated successfully', paperId, reviewerId });
    });
  });
};
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { sendReviewerAssignmentEmail, sendReviewerCredentialsEmail, sendPaperStatusUpdateEmail } from '../services/emailServices.js';

const JWT_SECRET = process.env.JWT_SECRET || 'necadmin';

export const createReviewer = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const { name, email, password, track } = req.body;

  if (!name || !email || !password || !track) {
    return res.status(400).json({ error: 'Name, email, password, and track are required' });
  }

  try {
    // Check if user already exists
    const checkUserQuery = 'SELECT id FROM users WHERE email = ?';
    db.query(checkUserQuery, [email], async (err, results) => {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert reviewer
      const insertQuery = 'INSERT INTO users (name, email, password, role, track, isFirstLogin) VALUES (?, ?, ?, ?, ?, 1)';
      db.query(insertQuery, [name, email, hashedPassword, 'reviewer', track], async (err, result) => {
        if (err) {
          console.error('DB insert error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        // Send email with credentials to the new reviewer
        let emailLog = '';
        try {
          await sendReviewerCredentialsEmail(email, name, password);
          emailLog = `Reviewer credentials email sent successfully to ${email}`;
          console.log(emailLog);
        } catch (emailError) {
          emailLog = `Failed to send reviewer credentials email to ${email}: ${emailError.message}`;
          console.error(emailLog);
          // Don't fail the creation if email fails
        }

        res.status(201).json({
          message: 'Reviewer created successfully',
          user: { id: result.insertId, name, email, role: 'reviewer', track },
          emailSent: true,
          emailLog: emailLog
        });
      });
    });
  } catch (error) {
    console.error('Create reviewer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getReviewers = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const query = "SELECT id, name, email, track FROM users WHERE role = 'reviewer'";

  db.query(query, (err, results) => {
    if (err) {
      console.error('DB error fetching reviewers:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(results);
  });
};

export const assignReviewer = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const { paperId, reviewerId } = req.body;

  if (!paperId || !reviewerId) {
    return res.status(400).json({ error: 'paperId and reviewerId are required' });
  }

  try {
    // Check if assignment already exists
    const checkQuery = 'SELECT id FROM paper_assignments WHERE paperId = ? AND reviewerId = ?';
    db.query(checkQuery, [paperId, reviewerId], async (err, results) => {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'Reviewer already assigned to this paper' });
      }

      // Get reviewer and paper details for email
      const getDetailsQuery = `
        SELECT u.name as reviewerName, u.email as reviewerEmail, r.paperTitle
        FROM users u
        JOIN registrations r ON r.id = ?
        WHERE u.id = ?
      `;

      db.query(getDetailsQuery, [paperId, reviewerId], async (err, details) => {
        if (err) {
          console.error('DB error fetching details:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        if (details.length === 0) {
          return res.status(404).json({ error: 'Reviewer or paper not found' });
        }

        const { reviewerName, reviewerEmail, paperTitle } = details[0];

        // Insert assignment
        const insertQuery = 'INSERT INTO paper_assignments (paperId, reviewerId) VALUES (?, ?)';
        db.query(insertQuery, [paperId, reviewerId], async (err, result) => {
          if (err) {
            console.error('DB insert error:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          // Send email notification to reviewer (don't fail assignment if email fails)
          try {
            await sendReviewerAssignmentEmail(reviewerEmail, reviewerName, paperTitle, paperId);
            console.log(`Assignment notification sent to reviewer: ${reviewerEmail}`);
          } catch (emailError) {
            console.error('Failed to send assignment notification email:', emailError.message);
            // Continue with successful response even if email fails
          }

          return res.status(201).json({
            message: 'Reviewer assigned successfully',
            assignmentId: result.insertId,
            emailSent: true
          });
        });
      });
    });
  } catch (error) {
    console.error('Assign reviewer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getReviewersWithAssignments = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const query = `
    SELECT
      u.id,
      u.name,
      u.email,
      u.track,
      COUNT(pa.paperId) as assignedPapers,
      GROUP_CONCAT(r.paperTitle SEPARATOR '; ') as paperTitles
    FROM users u
    LEFT JOIN paper_assignments pa ON u.id = pa.reviewerId
    LEFT JOIN registrations r ON pa.paperId = r.id
    WHERE u.role = 'reviewer'
    GROUP BY u.id, u.name, u.email, u.track
    ORDER BY u.name
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('DB error fetching reviewers with assignments:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Process the results to format paper titles
    const processedResults = results.map(reviewer => ({
      id: reviewer.id,
      name: reviewer.name,
      email: reviewer.email,
      track: reviewer.track,
      assignedPapers: reviewer.assignedPapers,
      paperTitles: reviewer.paperTitles ? reviewer.paperTitles.split('; ') : []
    }));

    res.json(processedResults);
  });
};

export const deleteReviewer = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Reviewer ID is required' });
  }

  try {
    // Check if reviewer exists
    const checkQuery = 'SELECT id, name FROM users WHERE id = ? AND role = ?';
    db.query(checkQuery, [id, 'reviewer'], (err, results) => {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Reviewer not found' });
      }

      const reviewerName = results[0].name;

      // Delete assignments first (foreign key constraint)
      const deleteAssignmentsQuery = 'DELETE FROM paper_assignments WHERE reviewerId = ?';
      db.query(deleteAssignmentsQuery, [id], (err, result) => {
        if (err) {
          console.error('DB error deleting assignments:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        // Delete reviewer
        const deleteQuery = 'DELETE FROM users WHERE id = ? AND role = ?';
        db.query(deleteQuery, [id, 'reviewer'], (err, result) => {
          if (err) {
            console.error('DB error deleting reviewer:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Reviewer not found' });
          }

          res.json({
            message: `Reviewer "${reviewerName}" deleted successfully`,
            deletedReviewer: { id, name: reviewerName }
          });
        });
      });
    });
  } catch (error) {
    console.error('Delete reviewer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get assigned papers for a reviewer
export const getAssignedPapers = (req, res) => {
  if (req.user.role !== 'reviewer') {
    return res.status(403).json({ error: 'Access denied. Reviewer only.' });
  }

  const reviewerId = req.user.id;

  const query = `
    SELECT
      r.id,
      r.paperTitle,
      r.authors,
      r.email,
      r.status,
      r.createdAt,
      r.abstractBlob,
      pa.assignedAt,
      pr.status as reviewStatus,
      pr.comments,
      pr.reviewedAt
    FROM registrations r
    INNER JOIN paper_assignments pa ON r.id = pa.paperId
    LEFT JOIN paper_reviews pr ON r.id = pr.paperId AND pr.reviewerId = ?
    WHERE pa.reviewerId = ?
    ORDER BY r.createdAt DESC
  `;

  db.query(query, [reviewerId, reviewerId], (err, results) => {
    if (err) {
      console.error('DB error fetching assigned papers:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Convert BLOB data to base64 string for JSON response
    const processedResults = results.map(paper => ({
      id: paper.id,
      paperTitle: paper.paperTitle,
      authors: paper.authors,
      email: paper.email,
      status: paper.status,
      createdAt: paper.createdAt,
      abstractBlob: paper.abstractBlob ? Buffer.from(paper.abstractBlob).toString('base64') : null,
      assignedAt: paper.assignedAt,
      reviewStatus: paper.reviewStatus,
      comments: paper.comments,
      reviewedAt: paper.reviewedAt
    }));

    res.json(processedResults);
  });
};

// Update paper status by reviewer
export const updatePaperStatus = (req, res) => {
  if (req.user.role !== 'reviewer') {
    return res.status(403).json({ error: 'Access denied. Reviewer only.' });
  }

  const { paperId, status, comments } = req.body;
  const reviewerId = req.user.id;

  if (!paperId || !status) {
    return res.status(400).json({ error: 'Paper ID and status are required' });
  }

  if (!['under_review', 'accepted', 'rejected', 'published'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    // Check if assignment exists
    const checkAssignmentQuery = 'SELECT id FROM paper_assignments WHERE paperId = ? AND reviewerId = ?';
    db.query(checkAssignmentQuery, [paperId, reviewerId], (err, results) => {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(403).json({ error: 'Paper not assigned to this reviewer' });
      }

      // Update or insert review
      const upsertQuery = `
        INSERT INTO paper_reviews (paperId, reviewerId, status, comments)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        comments = VALUES(comments),
        reviewedAt = CURRENT_TIMESTAMP
      `;

      db.query(upsertQuery, [paperId, reviewerId, status, comments], async (err, result) => {
        if (err) {
          console.error('DB error updating review:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        // Update registration status if reviewer accepts or rejects
        let updateStatus = null;
        if (status === 'accepted') {
          updateStatus = 'accepted';
        } else if (status === 'rejected') {
          updateStatus = 'rejected';
        } else if (status === 'published') {
          updateStatus = 'published';
        }

        if (updateStatus) {
          const updateRegQuery = 'UPDATE registrations SET status = ? WHERE id = ?';
          db.query(updateRegQuery, [updateStatus, paperId], (err, result) => {
            if (err) {
              console.error('DB error updating registration status:', err);
            }
          });
        }



        res.json({
          message: 'Paper status updated successfully',
          paperId,
          status,
          comments
        });
      });
    });
  } catch (error) {
    console.error('Update paper status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Send paper status update email to authors (admin only)
export const sendPaperStatusEmail = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const { paperId } = req.body;

  if (!paperId) {
    return res.status(400).json({ error: 'Paper ID is required' });
  }

  try {
    // Get paper details and latest review
    const paperQuery = `
      SELECT r.paperTitle, r.authors, pr.status, pr.comments, u.name as reviewerName
      FROM registrations r
      LEFT JOIN paper_reviews pr ON r.id = pr.paperId AND pr.reviewedAt = (
        SELECT MAX(reviewedAt)
        FROM paper_reviews
        WHERE paperId = r.id
      )
      LEFT JOIN users u ON pr.reviewerId = u.id
      WHERE r.id = ?
    `;

    db.query(paperQuery, [paperId], async (err, paperResults) => {
      if (err) {
        console.error('DB error fetching paper details:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (paperResults.length === 0) {
        return res.status(404).json({ error: 'Paper not found' });
      }

      const { paperTitle, authors, status, comments, reviewerName } = paperResults[0];

      if (!status) {
        return res.status(400).json({ error: 'No review status found for this paper' });
      }

      let authorsArr;
      try {
        authorsArr = typeof authors === 'string' ? JSON.parse(authors) : authors;
      } catch (parseErr) {
        console.error('Error parsing authors JSON:', parseErr);
        return res.status(500).json({ error: 'Error parsing author data' });
      }

      // Send emails to all authors
      const emailPromises = authorsArr.map(async (author) => {
        if (author.email) {
          try {
            await sendPaperStatusUpdateEmail(author.email, author.name, paperTitle, paperId, status, comments || 'No comments provided', reviewerName || 'Anonymous Reviewer');
            console.log(`Status update email sent to ${author.email} for paper ${paperId}`);
          } catch (emailErr) {
            console.error(`Failed to send email to ${author.email}:`, emailErr.message);
          }
        }
      });

      await Promise.all(emailPromises);

      res.json({
        message: 'Status update emails sent successfully',
        paperId,
        emailsSent: authorsArr.filter(author => author.email).length
      });
    });
  } catch (error) {
    console.error('Send paper status email error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get paper status for users
export const getPaperStatus = (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const query = `
    SELECT
      r.id,
      r.paperTitle,
      r.authors,
      r.status,
      r.createdAt,
      r.updatedAt,
      r.abstractBlob,
      pr.status as reviewStatus,
      pr.comments,
      pr.reviewedAt,
      u.name as reviewerName,
      pa.reviewerId as assignedReviewerId,
      ua.name as assignedReviewerName,
      pa.assignedAt
    FROM registrations r
    LEFT JOIN paper_reviews pr ON r.id = pr.paperId AND pr.reviewedAt = (
      SELECT MAX(reviewedAt)
      FROM paper_reviews
      WHERE paperId = r.id
    )
    LEFT JOIN users u ON pr.reviewerId = u.id
    LEFT JOIN paper_assignments pa ON r.id = pa.paperId
    LEFT JOIN users ua ON pa.reviewerId = ua.id
    WHERE r.userId = ?
    ORDER BY r.createdAt DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('DB error fetching paper status:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Convert BLOB data to base64 string for JSON response
    const processedResults = results.map(paper => ({
      id: paper.id,
      paperTitle: paper.paperTitle,
      authors: paper.authors,
      status: paper.status,
      createdAt: paper.createdAt,
      updatedAt: paper.updatedAt,
      abstractBlob: paper.abstractBlob ? Buffer.from(paper.abstractBlob).toString('base64') : null,
      reviewStatus: paper.reviewStatus,
      comments: paper.comments,
      reviewedAt: paper.reviewedAt,
      reviewerName: paper.reviewerName,
      assignedReviewerId: paper.assignedReviewerId,
      assignedReviewerName: paper.assignedReviewerName,
      assignedAt: paper.assignedAt
    }));

    res.json(processedResults);
  });
};

// Get unassigned papers (papers not in paper_assignments table)
export const getUnassignedPapers = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const { fromDate, toDate, paperTracks } = req.query;
  let query = `
    SELECT
      r.id,
      r.userId,
      r.paperTitle,
      r.authors,
      r.email,
      r.createdAt,
      r.abstractBlob,
      r.tracks as paperTracks
    FROM registrations r
    WHERE r.id NOT IN (
      SELECT DISTINCT paperId
      FROM paper_assignments
    )
  `;
  const params = [];
  const conditions = [];

  if (fromDate) {
    conditions.push('r.createdAt >= ?');
    params.push(fromDate);
  }
  if (toDate) {
    conditions.push('r.createdAt < DATE_ADD(?, INTERVAL 1 DAY)');
    params.push(toDate);
  }
  if (paperTracks) {
    const tracks = Array.isArray(paperTracks) ? paperTracks : [paperTracks];
    const placeholders = tracks.map(() => '?').join(',');
    conditions.push(`r.tracks IN (${placeholders})`);
    params.push(...tracks);
  }

  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }

  query += ' ORDER BY r.createdAt DESC';

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('DB error fetching unassigned papers:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Convert BLOB data to base64 string for JSON response
    const processedResults = results.map(paper => ({
      id: paper.id,
      userId: paper.userId,
      paperTitle: paper.paperTitle,
      authors: paper.authors,
      email: paper.email,
      createdAt: paper.createdAt,
      abstractBlob: paper.abstractBlob ? Buffer.from(paper.abstractBlob).toString('base64') : null,
      paperTracks: paper.paperTracks
    }));

    res.json(processedResults);
  });
};

// Get all registrations with assigned reviewers
export const getRegistrationsWithAssignments = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const query = `
    SELECT
      r.id,
      r.userId,
      r.paperTitle,
      r.authors,
      r.email,
      r.createdAt,
      r.abstractBlob,
      r.tracks,
      r.status,
      pr.status as reviewStatus,
      pr.comments,
      pr.reviewedAt,
      u.name as assignedReviewerName,
      u.id as assignedReviewerId,
      pa.assignedAt
    FROM registrations r
    LEFT JOIN paper_assignments pa ON r.id = pa.paperId
    LEFT JOIN users u ON pa.reviewerId = u.id
    LEFT JOIN paper_reviews pr ON r.id = pr.paperId AND pr.reviewedAt = (
      SELECT MAX(reviewedAt)
      FROM paper_reviews
      WHERE paperId = r.id
    )
    ORDER BY r.createdAt DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('DB error fetching registrations with assignments:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Convert BLOB data to base64 string for JSON response
    const processedResults = results.map(registration => ({
      id: registration.id,
      userId: registration.userId,
      paperTitle: registration.paperTitle,
      authors: registration.authors,
      email: registration.email,
      createdAt: registration.createdAt,
      abstractBlob: registration.abstractBlob ? Buffer.from(registration.abstractBlob).toString('base64') : null,
      tracks: registration.tracks,
      status: registration.status,
      reviewStatus: registration.reviewStatus,
      comments: registration.comments,
      reviewedAt: registration.reviewedAt,
      assignedReviewerName: registration.assignedReviewerName,
      assignedReviewerId: registration.assignedReviewerId,
      assignedAt: registration.assignedAt
    }));

    res.json(processedResults);
  });
};

// Get registration analytics (counts by country and state)
export const getRegistrationAnalytics = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  // Query for country counts
  const countryQuery = `
    SELECT country, COUNT(*) as count
    FROM registrations
    WHERE country IS NOT NULL AND country != ''
    GROUP BY country
    ORDER BY count DESC
  `;

  // Query for state counts
  const stateQuery = `
    SELECT state, COUNT(*) as count
    FROM registrations
    WHERE state IS NOT NULL AND state != ''
    GROUP BY state
    ORDER BY count DESC
  `;

  db.query(countryQuery, (err, countryResults) => {
    if (err) {
      console.error('DB error fetching country analytics:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    db.query(stateQuery, (err, stateResults) => {
      if (err) {
        console.error('DB error fetching state analytics:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        countries: countryResults,
        states: stateResults
      });
    });
  });
};

export const seedAdmin = async () => {
  const adminEmail = 'admin@nec.com';
  const adminPassword = 'admin123';
  const adminName = 'NEC Admin';

  try {
    // Check if admin already exists
    const checkQuery = 'SELECT id FROM users WHERE email = ?';
    db.query(checkQuery, [adminEmail], async (err, results) => {
      if (err) {
        console.error('DB error checking admin:', err);
        return;
      }

      if (results.length > 0) {
        console.log('Admin user already exists');
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Insert admin
      const insertQuery = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
      db.query(insertQuery, [adminName, adminEmail, hashedPassword, 'admin'], (err, result) => {
        if (err) {
          console.error('DB insert admin error:', err);
        } else {
          console.log('Default admin user created: admin@nec.com / admin123');
        }
      });
    });
  } catch (error) {
    console.error('Seed admin error:', error);
  }
};
