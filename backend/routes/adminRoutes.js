
import express from "express";
import {
  createReviewer,
  getReviewers,
  assignReviewer,
  getReviewersWithAssignments,
  deleteReviewer,
  getAssignedPapers,
  updatePaperStatus,
  sendPaperStatusEmail,
  getPaperStatus,
  getUnassignedPapers,
  getRegistrationsWithAssignments,
  getAllAssignments,
  deleteAssignment,
  updateAssignment,
  getRegistrationAnalytics
} from "../controllers/adminController.js";
import {
  getSupportTickets,
  createSupportTicketAdmin,
  assignTechnician,
  updateTicketStatus,
  getTechnicians,
  deleteSupportTicketAdmin
} from "../controllers/techSupportController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Admin routes
router.post("/create-reviewer", authenticateToken, createReviewer);
router.get("/reviewers", authenticateToken, getReviewers);
router.post("/assign-reviewer", authenticateToken, assignReviewer);
router.get("/reviewers-with-assignments", authenticateToken, getReviewersWithAssignments);
router.delete("/delete-reviewer/:id", authenticateToken, deleteReviewer);
router.get("/unassigned-papers", authenticateToken, getUnassignedPapers);
router.get("/registrations-with-assignments", authenticateToken, getRegistrationsWithAssignments);
router.get("/registration-analytics", authenticateToken, getRegistrationAnalytics);
router.post("/send-status-email", authenticateToken, sendPaperStatusEmail);

// Assignment management (admin)
router.get("/assignments", authenticateToken, getAllAssignments);
router.delete("/assignment/:paperId", authenticateToken, deleteAssignment);
router.put("/assignment/:paperId", authenticateToken, updateAssignment);

// Reviewer routes
router.get("/reviewer/assigned-papers", authenticateToken, getAssignedPapers);
router.post("/reviewer/update-status", authenticateToken, updatePaperStatus);

// User routes
router.get("/paper-status/:userId", authenticateToken, getPaperStatus);

export default router;
