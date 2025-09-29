# Email Notification Removal and Admin Panel Notification Task

## Completed Tasks
- [x] Remove email notification when admin assigns reviewer to user (no email was sent to user anyway)
- [x] Remove email notification when reviewer updates paper status (removed sendPaperStatusUpdateEmail call from updatePaperStatus)
- [x] Add notification in admin panel for paper status updates (added Status column with view button)
- [x] Add button for admin to send current status to user (added Send Status Email button in Actions column)
- [x] Remove ID column from table headers and tbody in ViewRegistrations.jsx
- [x] Change reg.status to reg.reviewStatus in status display
- [x] Update backend getRegistrationsWithAssignments to include reviewStatus, comments, reviewedAt

## Backend Changes
- [x] Modified updatePaperStatus in adminController.js to remove email sending
- [x] Added sendPaperStatusEmail function in adminController.js
- [x] Added POST /send-status-email route in adminRoutes.js
- [x] Updated getRegistrationsWithAssignments to include review status fields

## Frontend Changes
- [x] Added Status column header in ViewRegistrations.jsx table
- [x] Added Actions column header in ViewRegistrations.jsx table
- [x] Added Status cell with view button in table body
- [x] Added Actions cell with Send Status Email button in table body
- [x] Removed ID column from headers and tbody
- [x] Changed status display to use reg.reviewStatus instead of reg.status

## Testing
- [x] Fixed database queries to correctly fetch latest review status for papers
- [x] Test the application to ensure email notifications are removed
- [x] Test the Send Status Email button functionality
- [x] Verify admin can view paper statuses in the panel
- [x] Verify ID column is removed and status shows reviewStatus correctly
- [x] Verify that reviewed papers show the correct status instead of "not reviewed"
