import React, { useState, useEffect } from "react";

const ASSIGN_REVIEWER_URL = "http://localhost:8080/api/admin/assign-reviewer";
const GET_ASSIGNMENTS_URL = "http://localhost:8080/api/admin/assignments";
const UPDATE_ASSIGNMENT_URL = (paperId) => `http://localhost:8080/api/admin/assignment/${paperId}`;
const DELETE_ASSIGNMENT_URL = (paperId) => `http://localhost:8080/api/admin/assignment/${paperId}`;

const TRACKS = [
  "Deep Technology & Emerging Innovations",
  "Sustainable Energy & Power Systems",
  "Environment, Climate-Tech & Sustainable Infrastructure",
  "Advanced Computing & Cyber-Physical Systems",
  "Sustainable Transportation & E-Mobility",
  "Nextgen communication, VLSI & Embedded Systems"
];

function AssignReviewer({ registrations, reviewers, onAssignmentComplete }) {
  // State for unassigned papers
  const [unassignedPapers, setUnassignedPapers] = useState([]);
  const [selectedPaperId, setSelectedPaperId] = useState("");
  const [selectedReviewerId, setSelectedReviewerId] = useState("");
  const [assigningNew, setAssigningNew] = useState(false);
  const [assignments, setAssignments] = useState([]); // Array of {paperId, reviewerId, paperTitle, reviewerName, reviewerEmail, track}
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [editingAssignment, setEditingAssignment] = useState(null); // paperId being edited
  const [newReviewerId, setNewReviewerId] = useState("");
  const [deletingAssignment, setDeletingAssignment] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [filters, setFilters] = useState({ fromDate: '', toDate: '', paperTracks: [], reviewerTracks: [] });
  const [reviewerTrackFilter, setReviewerTrackFilter] = useState("");
  const [paperTrackFilter, setPaperTrackFilter] = useState("");

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'paperTracks' || name === 'reviewerTracks') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFilters(prev => ({ ...prev, [name]: selectedOptions }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  // Fetch all assignments and unassigned papers on mount/refresh or filter change
  useEffect(() => {
    const fetchAssignments = async () => {
      setLoadingAssignments(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setAssignments([]);
          setUnassignedPapers([]);
          setLoadingAssignments(false);
          return;
        }
        // Build query params for filters
        const queryParams = new URLSearchParams();
        if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
        if (filters.toDate) queryParams.append('toDate', filters.toDate);
        if (filters.paperTracks && filters.paperTracks.length > 0) {
          filters.paperTracks.forEach(track => queryParams.append('paperTracks', track));
        }
        if (filters.reviewerTracks && filters.reviewerTracks.length > 0) {
          filters.reviewerTracks.forEach(track => queryParams.append('reviewerTracks', track));
        }
        const queryString = queryParams.toString();

        // Fetch assignments
        const assignmentsUrl = queryString ? `${GET_ASSIGNMENTS_URL}?${queryString}` : GET_ASSIGNMENTS_URL;
        const response = await fetch(assignmentsUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          setAssignments(data);
        } else {
          setAssignments([]);
        }
        // Fetch unassigned papers
        const unassignedQueryParams = new URLSearchParams();
        if (filters.fromDate) unassignedQueryParams.append('fromDate', filters.fromDate);
        if (filters.toDate) unassignedQueryParams.append('toDate', filters.toDate);
        if (filters.paperTracks && filters.paperTracks.length > 0) {
          filters.paperTracks.forEach(track => unassignedQueryParams.append('paperTracks', track));
        }
        const unassignedQueryString = unassignedQueryParams.toString();
        const unassignedUrl = unassignedQueryString ? `http://localhost:8080/api/admin/unassigned-papers?${unassignedQueryString}` : "http://localhost:8080/api/admin/unassigned-papers";
        const unassignedRes = await fetch(unassignedUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const unassignedData = await unassignedRes.json();
        if (unassignedRes.ok && Array.isArray(unassignedData)) {
          setUnassignedPapers(unassignedData);
        } else {
          setUnassignedPapers([]);
        }
      } catch (err) {
        setAssignments([]);
        setUnassignedPapers([]);
      } finally {
        setLoadingAssignments(false);
      }
    };
    fetchAssignments();
  }, [onAssignmentComplete, filters]);

  // Assign a reviewer to a paper
  const handleAssignNew = async (e) => {
    e.preventDefault();
    if (!selectedPaperId || !selectedReviewerId) {
      alert("Please select both a paper and a reviewer.");
      return;
    }
    setAssigningNew(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(ASSIGN_REVIEWER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paperId: selectedPaperId, reviewerId: selectedReviewerId })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Reviewer assigned successfully!');
        setSelectedPaperId("");
        setSelectedReviewerId("");
        if (onAssignmentComplete) onAssignmentComplete();
      } else {
        alert(data.error || 'Failed to assign reviewer');
      }
    } catch (err) {
      alert('Error assigning reviewer');
    } finally {
      setAssigningNew(false);
    }
  };
  // Start editing assignment
  const handleEditAssignment = (paperId, currentReviewerId) => {
    setEditingAssignment(paperId);
    setNewReviewerId(currentReviewerId);
  };

  // Save updated assignment
  const handleUpdateAssignment = async (paperId) => {
    if (!newReviewerId) return;
    setAssigning(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(UPDATE_ASSIGNMENT_URL(paperId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reviewerId: newReviewerId })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Assignment updated successfully!');
        setEditingAssignment(null);
        setNewReviewerId("");
        if (onAssignmentComplete) onAssignmentComplete();
      } else {
        alert(data.error || 'Failed to update assignment');
      }
    } catch (err) {
      alert('Error updating assignment');
    } finally {
      setAssigning(false);
    }
  };

  // Delete assignment
  const handleDeleteAssignment = async (paperId) => {
    if (!window.confirm('Are you sure you want to unassign this reviewer from the paper?')) return;
    setDeletingAssignment(paperId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(DELETE_ASSIGNMENT_URL(paperId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        alert('Assignment deleted successfully!');
        if (onAssignmentComplete) onAssignmentComplete();
      } else {
        alert(data.error || 'Failed to delete assignment');
      }
    } catch (err) {
      alert('Error deleting assignment');
    } finally {
      setDeletingAssignment(null);
    }
  };



  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-2">All Reviewer Assignments</h2>
        <p className="text-gray-600">View, update, or delete reviewer assignments for papers. Assign a reviewer to a submitted paper below.</p>
      </div>

      {/* Date Filters */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Filter by Submission Date</h3>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Assign Reviewer to Unassigned Paper */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-green-200 p-6">
        <h3 className="text-lg font-semibold text-green-700 mb-4">Assign Reviewer to Paper</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter Papers by Track</label>
          <select
            value={paperTrackFilter}
            onChange={e => setPaperTrackFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">All Tracks</option>
            {TRACKS.map(track => (
              <option key={track} value={track}>{track}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter Reviewers by Track</label>
          <select
            value={reviewerTrackFilter}
            onChange={e => setReviewerTrackFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">All Tracks</option>
            {TRACKS.map(track => (
              <option key={track} value={track}>{track}</option>
            ))}
          </select>
        </div>
        <form className="flex flex-col md:flex-row md:items-center gap-4" onSubmit={handleAssignNew}>
          <select
            value={selectedPaperId}
            onChange={e => setSelectedPaperId(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Select Paper</option>
            {unassignedPapers.filter(paper => !paperTrackFilter || paper.track === paperTrackFilter).map(paper => (
              <option key={paper.id} value={paper.id}>{paper.paperTitle}</option>
            ))}
          </select>
          <select
            value={selectedReviewerId}
            onChange={e => setSelectedReviewerId(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Select Reviewer</option>
            {reviewers.filter(rev => !reviewerTrackFilter || rev.track === reviewerTrackFilter).map(rev => (
              <option key={rev.id} value={rev.id}>{rev.name} ({rev.track})</option>
            ))}
          </select>
          <button
            type="submit"
            className={`px-6 py-2 rounded-md text-white ${assigningNew ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            disabled={assigningNew}
          >
            {assigningNew ? 'Assigning...' : 'Assign Reviewer'}
          </button>
        </form>
        {unassignedPapers.length === 0 && (
          <p className="text-gray-500 mt-2">All papers are assigned.</p>
        )}
      </div>

      {/* Existing Assignments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        {loadingAssignments ? (
          <p>Loading assignments...</p>
        ) : assignments.length === 0 ? (
          <p className="text-gray-500">No assignments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <tr>
                  <th className="px-4 py-2">Paper ID</th>
                  <th className="px-4 py-2">Paper Title</th>
                  <th className="px-4 py-2">Reviewer</th>
                  <th className="px-4 py-2">Track</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.paperId}>
                    <td className="px-4 py-2">{a.paperId}</td>
                    <td className="px-4 py-2">{a.paperTitle}</td>
                    <td className="px-4 py-2">
                      {editingAssignment === a.paperId ? (
                        <select
                          value={newReviewerId}
                          onChange={e => setNewReviewerId(e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1"
                        >
                          <option value="">Select Reviewer</option>
                          {reviewers.map(rev => (
                            <option key={rev.id} value={rev.id}>{rev.name} ({rev.track})</option>
                          ))}
                        </select>
                      ) : (
                        <span>{a.reviewerName} ({a.reviewerEmail})</span>
                      )}
                    </td>
                    <td className="px-4 py-2">{a.track}</td>
                    <td className="px-4 py-2">
                      {editingAssignment === a.paperId ? (
                        <>
                          <button
                            className="px-3 py-1 bg-blue-600 text-white rounded mr-2"
                            onClick={() => handleUpdateAssignment(a.paperId)}
                            disabled={assigning}
                          >
                            Save
                          </button>
                          <button
                            className="px-3 py-1 bg-gray-400 text-white rounded"
                            onClick={() => setEditingAssignment(null)}
                            disabled={assigning}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="px-3 py-1 bg-yellow-500 text-white rounded mr-2"
                            onClick={() => handleEditAssignment(a.paperId, a.reviewerId)}
                          >
                            Update
                          </button>
                          <button
                            className="px-3 py-1 bg-red-600 text-white rounded"
                            onClick={() => handleDeleteAssignment(a.paperId)}
                            disabled={deletingAssignment === a.paperId}
                          >
                            {deletingAssignment === a.paperId ? 'Deleting...' : 'Delete'}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssignReviewer;
