import { saveRegistration } from "../services/registrationService.js";
import { sendApplyConfirmationEmail } from "../services/emailServices.js";
import { db } from "../config/db.js";

export const registerPaper = async (req, res) => {
  const userId = req.user.id;
  const { paperTitle, authors, tracks, country, state, city } = req.body;
  const authorsArr = JSON.parse(authors);

  if (!req.file) {
    return res.status(400).json({ error: "Abstract file required" });
  }

  // Validate file type is PDF, DOC, or DOCX
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ error: "Only PDF, DOC, and DOCX files are allowed for abstract" });
  }

  // Validate mobile numbers length
  for (const author of authorsArr) {
    if (!author.mobile || author.mobile.length !== 10 || !/^\d{10}$/.test(author.mobile)) {
      return res.status(400).json({ error: `Invalid mobile number for author ${author.name}. Must be exactly 10 digits.` });
    }
  }

  const abstractFile = req.file.buffer;

      saveRegistration(
        { userId, paperTitle, authors: authorsArr, abstract: abstractFile, tracks, country, state, city },
        async (err, result) => {
          if (err) {
            console.error("DB Insert error:", err);
            return res.status(500).json({ error: "Database error" });
          }

          try {
            // Send email to all authors
            await Promise.all(
              authorsArr.map(author =>
                sendApplyConfirmationEmail(author.email, author.name, userId, result.insertId, paperTitle, authorsArr)
              )
            );
            res.status(200).json({
              message: "Registration successful",
              id: result.insertId
            });
          } catch (emailError) {
            console.error("Email error:", emailError);
            // Don't fail the registration if email fails - just log it
            res.status(200).json({
              message: "Registration successful but email notification failed",
              id: result.insertId,
              emailError: emailError.message
            });
          }
        }
      );
};

export const getAllRegistrations = async (req, res) => {
  try {
    const sql = "SELECT id, userId, paperTitle, authors, email, createdAt, abstractBlob FROM registrations ORDER BY createdAt DESC";
    db.query(sql, (err, results) => {
      if (err) {
        console.error("DB Query error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      // Log size of abstractBlob for debugging
      results.forEach(row => {
        console.log("Fetched abstractBlob size:", row.abstractBlob ? row.abstractBlob.length : 0);
      });
      // Parse authors JSON and convert abstractBlob to base64 string for each result
      const processedResults = results.map(row => ({
        ...row,
        authors: typeof row.authors === 'string' ? JSON.parse(row.authors) : row.authors,
        abstractBlob: row.abstractBlob ? row.abstractBlob.toString('base64') : null
      }));
      res.json(processedResults);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
