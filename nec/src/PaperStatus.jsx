import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import Header from "./Header";

const API_BASE_URL = "http://localhost:8080/api/admin";

function PaperStatus() {
  const { logout, user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'user') {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchPaperStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !user) {
          setPapers([]);
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/paper-status/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setPapers(data);
        } else {
          setPapers([]);
          console.warn("Failed to fetch paper status:", data);
        }
      } catch (err) {
        console.error("Error fetching paper status:", err);
        setPapers([]);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'user') {
      fetchPaperStatus();
    }
  }, [user]);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      login(token);
      navigate('/paper-status', { replace: true });
    }
  }, [searchParams, login, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'under_review': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'accepted': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      case 'published': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'under_review':
        return (
          <svg className="w-5 h-5 mr-2 animate-spin" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        );
      case 'accepted':
        return (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'rejected':
        return (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'published':
        return (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
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

  const getStatusDescription = (status) => {
    switch (status) {
      case 'submitted': return 'Your paper has been submitted and is waiting for review assignment.';
      case 'under_review': return 'Your paper is currently being reviewed by our experts.';
      case 'accepted': return 'Congratulations! Your paper has been accepted for publication.';
      case 'rejected': return 'Your paper has been reviewed and unfortunately not accepted at this time.';
      case 'published': return 'Your paper has been published successfully.';
      default: return 'Status unknown.';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-xl font-semibold text-gray-900">Loading Paper Status</p>
            <p className="text-gray-600">Please wait while we fetch your papers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Header/>
      {/* Header */}
      

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4  py-30 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Research Papers</h2>
              <p className="text-gray-600">Monitor the current status and progress of all your submissions</p>
            </div>
          </div>
          
          {papers.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    {papers.length}
                  </div>
                  <span className="text-blue-900 font-semibold">
                    {papers.length === 1 ? 'Paper Submitted' : 'Papers Submitted'}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/registration')}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 hover:underline transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Submit Another</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {papers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50"></div>
            <div className="relative z-10">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Papers Submitted Yet</h3>
              <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                Get started by submitting your first research paper. Join our academic community today!
              </p>
              <button
                onClick={() => navigate('/registration')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-3 mx-auto"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-lg">Submit Your First Paper</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-8">
            {papers.map((paper, index) => (
              <div 
                key={paper.id} 
                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out both'
                }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-bl-full -mr-16 -mt-16"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 pr-4">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="bg-gray-100 p-3 rounded-xl flex-shrink-0">
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                            {paper.paperTitle}
                          </h3>
                          <div className="space-y-2">
                            <div className="flex items-start space-x-2">
                              <svg className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-7.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                              </svg>
                              <p className="text-sm text-gray-700 font-medium">
                                <span className="text-gray-500">Authors:</span> {formatAuthors(paper.authors)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-sm text-gray-700">
                                <span className="font-medium text-gray-500">Submitted:</span> {new Date(paper.createdAt).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                            {paper.updatedAt && paper.updatedAt !== paper.createdAt && (
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium text-gray-500">Updated:</span> {new Date(paper.updatedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long', 
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-3">
                      <div className={`flex items-center px-4 py-2 rounded-xl border font-semibold text-sm ${getStatusColor(paper.status)}`}>
                        {getStatusIcon(paper.status)}
                        <span>{paper.status.replace('_', ' ').toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Abstract Section */}
                  {paper.abstractBlob && (
                    <div className="mb-6 bg-gray-50 rounded-xl p-6 border border-gray-100">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">Research Abstract</h4>
                            <p className="text-sm text-gray-600">Download your submitted abstract</p>
                          </div>
                        </div>
                        <button
                          onClick={() => downloadAbstract(paper.abstractBlob, paper.paperTitle)}
                          className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                        >
                          <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  )}

                  

                  {/* Review Status */}
                  {paper.reviewStatus && (
                    <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-200 p-2 rounded-lg flex-shrink-0">
                          <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-blue-900 mb-2">Review Information</h5>
                          <p className="text-blue-800 mb-3">
                            <span className="font-semibold">Review Status:</span> {paper.reviewStatus.replace('_', ' ').toUpperCase()}
                          </p>
                          {paper.comments && (
                            <div className="bg-blue-100 rounded-lg p-4 mb-3">
                              <p className="text-blue-900 font-semibold mb-2">Reviewer Comments:</p>
                              <p className="text-blue-800 leading-relaxed">{paper.comments}</p>
                            </div>
                          )}
                          {paper.reviewedAt && (
                            <div className="flex items-center space-x-2 text-sm text-blue-700">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="font-medium">
                                Reviewed on: {new Date(paper.reviewedAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long', 
                                  day: 'numeric'
                                })}
                                {/* {paper.reviewerName && ` by ${paper.reviewerName}`} */}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Actions */}
                  <div className="flex justify-between items-center">
                    {paper.status === 'accepted' && (
                      <div className="flex items-center bg-emerald-50 text-emerald-700 px-6 py-3 rounded-xl border border-emerald-200 shadow-sm">
                        <div className="bg-emerald-200 p-1 rounded-full mr-3">
                          <svg className="w-5 h-5 text-emerald-700" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-bold text-lg">🎉 Paper Accepted!</span>
                          <p className="text-sm text-emerald-600">Your research has been approved for publication</p>
                        </div>
                      </div>
                    )}

                    {paper.status === 'rejected' && (
                      <div className="flex items-center bg-red-50 text-red-700 px-6 py-3 rounded-xl border border-red-200 shadow-sm">
                        <div className="bg-red-200 p-1 rounded-full mr-3">
                          <svg className="w-5 h-5 text-red-700" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-bold text-lg">Paper Not Accepted</span>
                          <p className="text-sm text-red-600">Consider reviewer feedback for future submissions</p>
                        </div>
                      </div>
                    )}

                    {paper.status === 'published' && (
                      <div className="flex items-center bg-purple-50 text-purple-700 px-6 py-3 rounded-xl border border-purple-200 shadow-sm">
                        <div className="bg-purple-200 p-1 rounded-full mr-3">
                          <svg className="w-5 h-5 text-purple-700" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-bold text-lg">🚀 Paper Published!</span>
                          <p className="text-sm text-purple-600">Your research is now available to the academic community</p>
                        </div>
                      </div>
                    )}

                    {(paper.status === 'submitted' || paper.status === 'under_review') && (
                      <div className="flex items-center bg-blue-50 text-blue-700 px-6 py-3 rounded-xl border border-blue-200 shadow-sm">
                        <div className="bg-blue-200 p-1 rounded-full mr-3">
                          {paper.status === 'under_review' ? (
                            <svg className="w-5 h-5 text-blue-700 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-lg">
                            {paper.status === 'under_review' ? 'Under Review' :
                             paper.assignedReviewerName ? 'Reviewer Assigned' : 'Submission Received'}
                          </span>
                          <p className="text-sm text-blue-600">
                            {paper.status === 'under_review' ?
                              'Our experts are currently evaluating your paper' :
                              paper.assignedReviewerName ?
                                `Your paper has been assigned to ${paper.assignedReviewerName} for review` :
                                'Your paper is in the queue for review assignment'
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default PaperStatus;