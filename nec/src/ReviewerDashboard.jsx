import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const API_BASE_URL = "http://localhost:8080/api/admin";

function ReviewerDashboard() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [assignedPapers, setAssignedPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [status, setStatus] = useState('');
  const [comments, setComments] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showAbstract, setShowAbstract] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'reviewer') {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchAssignedPapers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setAssignedPapers([]);
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/reviewer/assigned-papers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setAssignedPapers(data);
        } else {
          setAssignedPapers([]);
          console.warn("Failed to fetch assigned papers:", data);
        }
      } catch (err) {
        console.error("Error fetching assigned papers:", err);
        setAssignedPapers([]);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'reviewer') {
      fetchAssignedPapers();
    }
  }, [user]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedPaper || !status) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/reviewer/update-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paperId: selectedPaper.id,
          status,
          comments
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert('Paper status updated successfully!');
        setSelectedPaper(null);
        setStatus('');
        setComments('');

        // Refresh the assigned papers list
        const refreshRes = await fetch(`${API_BASE_URL}/reviewer/assigned-papers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const refreshData = await refreshRes.json();
        if (refreshRes.ok && Array.isArray(refreshData)) {
          setAssignedPapers(refreshData);
        }
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error("Error updating paper status:", err);
      alert('Error updating paper status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'published': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAuthors = (authors) => {
    if (typeof authors === 'string') {
      try {
        authors = JSON.parse(authors);
      } catch (e) {
        return authors;
      }
    }
    if (Array.isArray(authors)) {
      return authors.map(author => `${author.name} (${author.email})`).join(', ');
    }
    return 'N/A';
  };

  const downloadAbstract = (base64Data, paperTitle) => {
    if (!base64Data) {
      alert("No abstract file available");
      return;
    }
    const cleanedBase64 = base64Data.replace(/\s/g, '');
    const byteCharacters = atob(cleanedBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    let mimeType = "application/pdf";
    let extension = "pdf";

    if (byteArray.length > 4) {
      if (byteArray[0] === 0x25 && byteArray[1] === 0x50 && byteArray[2] === 0x44 && byteArray[3] === 0x46) {
        mimeType = "application/pdf";
        extension = "pdf";
      } else if (byteArray[0] === 0xD0 && byteArray[1] === 0xCF && byteArray[2] === 0x11 && byteArray[3] === 0xE0) {
        mimeType = "application/msword";
        extension = "doc";
      } else if (byteArray[0] === 0x50 && byteArray[1] === 0x4B) {
        mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        extension = "docx";
      }
    }

    const blob = new Blob([byteArray], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `${paperTitle}_abstract.${extension}`;
    downloadLink.click();
    window.URL.revokeObjectURL(url);
  };

  const isPDF = (base64Data) => {
    if (!base64Data) return false;
    try {
      const cleanedBase64 = base64Data.replace(/\s/g, '');
      const byteCharacters = atob(cleanedBase64);
      const byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }
      return byteArray.length > 4 &&
             byteArray[0] === 0x25 && byteArray[1] === 0x50 &&
             byteArray[2] === 0x44 && byteArray[3] === 0x46;
    } catch (e) {
      return false;
    }
  };

  const decodeAbstract = (base64Abstract) => {
    if (!base64Abstract) return null;
    try {
      return atob(base64Abstract);
    } catch (e) {
      console.error('Error decoding abstract:', e);
      return 'Error loading abstract content';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assigned papers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reviewer Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Track: {user?.track}</span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Assigned Papers</h2>
          <p className="text-gray-600">Review and update the status of assigned papers</p>
        </div>

        {assignedPapers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <p className="text-gray-500">No papers assigned yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {assignedPapers.map((paper) => (
              <div key={paper.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {paper.paperTitle}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Authors:</strong> {formatAuthors(paper.authors)}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Submitted by:</strong> {paper.email}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Submitted on:</strong> {new Date(paper.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Assigned on:</strong> {new Date(paper.assignedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(paper.status)}`}>
                      {paper.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {paper.reviewStatus && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(paper.reviewStatus)}`}>
                        Your Review: {paper.reviewStatus.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Abstract Display Section */}
                {paper.abstractBlob && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-semibold text-gray-800">Abstract</h4>
                      {isPDF(paper.abstractBlob) ? (
                        <button
                          onClick={() => downloadAbstract(paper.abstractBlob, paper.paperTitle)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download Abstract
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowAbstract(showAbstract === paper.id ? null : paper.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {showAbstract === paper.id ? 'Hide Abstract' : 'Show Abstract'}
                        </button>
                      )}
                    </div>
                    {showAbstract === paper.id && !isPDF(paper.abstractBlob) && (
                      <div className="p-4 bg-gray-50 rounded-md border">
                        <div className="prose prose-sm max-w-none">
                          <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '14px', lineHeight: '1.6' }}>
                            {decodeAbstract(paper.abstractBlob)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {paper.comments && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">
                      <strong>Your Comments:</strong> {paper.comments}
                    </p>
                    {paper.reviewedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Reviewed on: {new Date(paper.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setSelectedPaper(paper)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Update Status
                  </button>

                  {paper.status === 'accepted' && (
                    <span className="text-sm text-green-600 font-medium">
                      ✓ Paper Accepted
                    </span>
                  )}
                  {paper.status === 'rejected' && (
                    <span className="text-sm text-red-600 font-medium">
                      ✗ Paper Rejected
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Status Update Modal */}
        {selectedPaper && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Update Paper Status
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Paper:</strong> {selectedPaper.paperTitle}
                </p>

                <form onSubmit={handleStatusUpdate}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="under_review">Under Review</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comments
                    </label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Add your review comments..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaper(null);
                        setStatus('');
                        setComments('');
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updating ? 'Updating...' : 'Update Status'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewerDashboard;
