# Add Reviewer Assignment Feature

## Backend Changes
- [x] Add paper_assignments table to registrationModel.js
- [x] Add getReviewers function to adminController.js
- [x] Add assignReviewer function to adminController.js
- [x] Add new routes to adminRoutes.js (/reviewers, /assign-reviewer)
- [x] Add getReviewersWithAssignments function to adminController.js
- [x] Add /reviewers-with-assignments route to adminRoutes.js

## Frontend Changes
- [x] Update Admin.jsx to fetch and display reviewers table
- [x] Update Admin.jsx to add "Assign Reviewer" column in registrations table
- [x] Update Admin.jsx to handle reviewer assignment
- [x] Update Admin.jsx to use /reviewers-with-assignments endpoint

## Testing
- [ ] Test fetching reviewers
- [ ] Test assigning reviewer to paper
- [ ] Test displaying assigned reviewer in table
