import React, { useState } from "react";

const SEND_STATUS_EMAIL_URL = "http://localhost:8080/api/admin/send-status-email";

function ViewRegistrations({ registrations, registrationFilters, handleFilterChange, clearFilters, tracks, handleTrackChange }) {
  const [sendingEmail, setSendingEmail] = useState(null);

  const filteredRegistrations = registrations.filter(registration => {
    // Date filter
    if (registrationFilters.fromDate || registrationFilters.toDate) {
      const registrationDate = new Date(registration.createdAt);
      if (registrationFilters.fromDate && registrationDate < new Date(registrationFilters.fromDate)) {
        return false;
      }
      if (registrationFilters.toDate && registrationDate > new Date(registrationFilters.toDate)) {
        return false;
      }
    }

    // Track filter
    if (registrationFilters.selectedTracks && registrationFilters.selectedTracks.length > 0) {
      if (!registration.tracks || !registrationFilters.selectedTracks.includes(registration.tracks)) {
        return false;
      }
    }

    return true;
  });

  const downloadCSV = () => {
    if (filteredRegistrations.length === 0) return;

    const headers = ["Paper Title", "Authors", "Email", "Assigned Reviewer", "Created At"];
    const csvContent = [
      headers.join(","),
      ...filteredRegistrations.map(reg => [
        `"${reg.paperTitle}"`,
        `"${JSON.stringify(reg.authors)}"`,
        reg.email,
        `"${reg.assignedReviewerName || 'Not assigned'}"`,
        reg.createdAt
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registrations.csv";
    a.click();
    window.URL.revokeObjectURL(url);
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

  const sendStatusEmail = async (paperId) => {
    if (!window.confirm('Are you sure you want to send status update emails to all authors of this paper?')) {
      return;
    }

    setSendingEmail(paperId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(SEND_STATUS_EMAIL_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paperId })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Status update emails sent successfully to ${data.emailsSent} authors`);
      } else {
        alert(data.error || 'Failed to send status emails');
      }
    } catch (err) {
      console.error("Error sending status emails:", err);
      alert('Error sending status emails');
    } finally {
      setSendingEmail(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-2">View Registrations</h2>
        <p className="text-gray-600">Total registrations: {filteredRegistrations.length}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h3 className="text-lg font-semibold text-blue-700">Export Data</h3>
            <p className="text-sm text-gray-500">Download filtered registration data as CSV</p>
          </div>
          <button
            onClick={downloadCSV}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Download CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-700 mb-4">Filter Registrations by Date</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              id="fromDate"
              name="fromDate"
              value={registrationFilters.fromDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              id="toDate"
              name="toDate"
              value={registrationFilters.toDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Clear Filters
            </button>
          </div>
        </div>
        {(registrationFilters.fromDate || registrationFilters.toDate || (registrationFilters.selectedTracks && registrationFilters.selectedTracks.length > 0)) && (
          <p className="text-sm text-blue-600 mt-2">
            Showing {filteredRegistrations.length} of {registrations.length} registrations
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-700 mb-4">Filter by Tracks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tracks.map((track) => (
            <label key={track} className="flex items-center">
              <input
                type="checkbox"
                checked={registrationFilters.selectedTracks?.includes(track) || false}
                onChange={(e) => handleTrackChange(track, e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{track}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-blue-200 overflow-hidden">
        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {registrations.length === 0 ? 'No registrations found' : 'No registrations match the selected filters'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Paper Title</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Authors</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Assigned Reviewer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Abstract</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-200">
                {filteredRegistrations.map((reg, index) => (
                  <tr
                    key={reg.id}
                    className={`hover:bg-blue-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-blue-25'}`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                        <p className="font-medium truncate" title={reg.paperTitle}>{reg.paperTitle}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="max-w-xs">
                        {Array.isArray(reg.authors) ? reg.authors.map(author => author.name).join(", ") : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{reg.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        reg.assignedReviewerName
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {reg.assignedReviewerName || 'Not assigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className="bg-blue-100 px-2 py-1 rounded text-xs font-medium">
                        {new Date(reg.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        reg.reviewStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                        reg.reviewStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                        reg.reviewStatus === 'under review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {reg.reviewStatus || 'Not reviewed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => downloadAbstract(reg.abstractBlob, reg.paperTitle)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Download
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => sendStatusEmail(reg.id)}
                        disabled={sendingEmail === reg.id}
                        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                          sendingEmail === reg.id
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {sendingEmail === reg.id ? 'Sending...' : 'Send Status Email'}
                      </button>
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

export default ViewRegistrations;
