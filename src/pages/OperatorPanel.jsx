


import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";

const BASE_URL = "http://localhost:5000";

const OperatorPanel = () => {
  const { user } = useUser();
  const [applications, setApplications] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploadingAppId, setUploadingAppId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusCounts, setStatusCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (user?.token) fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/applications/operator`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const apps = res.data.reverse(); // newest first
      setApplications(apps);
      countStatus(apps);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
  };

  const countStatus = (apps) => {
    const counts = { All: apps.length };
    apps.forEach((app) => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });
    setStatusCounts(counts);
  };

  const handleFileChange = (e, appId) => {
    setSelectedFiles((prev) => ({ ...prev, [appId]: e.target.files[0] }));
  };

  const handleUpload = async (appId) => {
    const file = selectedFiles[appId];
    if (!file) return alert("Please select a PDF file");

    try {
      const formData = new FormData();
      formData.append("formPdf", file);
      setUploadingAppId(appId);

      await axios.put(`${BASE_URL}/api/applications/${appId}/upload-pdf`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("PDF uploaded successfully");
      setSelectedFiles((prev) => {
        const updated = { ...prev };
        delete updated[appId];
        return updated;
      });
      setUploadingAppId(null);
      fetchApplications();
    } catch (err) {
      console.error("❌ Upload error:", err);
      alert("Upload failed");
      setUploadingAppId(null);
    }
  };

  const handleReject = async (appId) => {
    const reason = prompt("Please enter rejection reason:");
    if (!reason || reason.trim() === "") return alert("Rejection reason is required");

    try {
      await axios.put(
        `${BASE_URL}/api/applications/${appId}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      alert("Application rejected");
      fetchApplications();
    } catch (err) {
      console.error("❌ Reject error:", err);
      alert("Rejection failed");
    }
  };

  const handleConfirm = async (appId) => {
    try {
      await axios.put(
        `${BASE_URL}/api/applications/${appId}/operator-confirm`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      alert("Application confirmed");
      fetchApplications();
    } catch (err) {
      console.error("❌ Confirm error:", err);
      alert("Confirmation failed");
    }
  };

  const statusOptions = [
    "All",
    "Pending",
    "Submitted",
    "In Review",
    "Pending Confirmation",
    "Confirmed",
    "Rejected",
  ];

  const filteredApps = applications.filter((app) => {
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      app.user?.name?.toLowerCase().includes(searchLower) ||
      app.user?.mobile?.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const openProfile = (profile) => {
    setSelectedProfile(profile);
    setShowProfileModal(true);
  };

  const closeProfile = () => {
    setSelectedProfile(null);
    setShowProfileModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-25">
      <h2 className="text-2xl font-bold mb-6 text-pink-600">👨‍💻 Operator Panel</h2>

      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or mobile"
          className="px-4 py-2 border rounded w-64"
        />
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded border ${
                statusFilter === status
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-600 border-blue-600"
              }`}
            >
              {status} ({statusCounts[status] || 0})
            </button>
          ))}
        </div>
      </div>

      {filteredApps.length === 0 ? (
        <p className="text-gray-600">No applications found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Applicant</th>
                <th className="border p-2">Service</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">User Profile</th>
                <th className="border p-2">Upload Filled PDF</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app._id}>
                  <td className="border p-2">
                    {app.user?.name || "N/A"}
                    <br />
                    <span className="text-xs text-gray-500">{app.user?.mobile}</span>
                  </td>
                  <td className="border p-2">{app.service?.name || "N/A"}</td>
                  <td className="border p-2">{app.status}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => openProfile(app.userProfile)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded"
                    >
                      View Profile
                    </button>
                  </td>
                  <td className="border p-2">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handleFileChange(e, app._id)}
                    />
                    <button
                      onClick={() => handleUpload(app._id)}
                      disabled={uploadingAppId === app._id}
                      className="mt-2 px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
                    >
                      {uploadingAppId === app._id ? "Uploading..." : "Upload"}
                    </button>
                  </td>
                  <td className="border p-2 space-y-1">
                    <button
                      onClick={() => handleConfirm(app._id)}
                      className="px-3 py-1 bg-green-600 text-white rounded w-full"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleReject(app._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded w-full"
                    >
                      Reject
                    </button>
                    {app.rejectReason && (
                      <div className="text-red-600 text-xs mt-1">
                        <b>Reason:</b> {app.rejectReason}
                      </div>
                    )}
                    {app.correctionComment && (
                      <div className="text-indigo-600 text-xs mt-1">
                        <b>Correction:</b> {app.correctionComment}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* {showProfileModal && selectedProfile && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full relative">
      <button
        onClick={closeProfile}
        className="absolute top-2 right-3 text-gray-600 hover:text-red-600 text-2xl font-bold"
        aria-label="Close profile modal"
      >
        ×
      </button>

      <h3 className="text-2xl font-bold mb-4 text-indigo-700">👤 User Profile</h3>

      <div className="space-y-2 text-gray-800 text-base">
        <p><strong>Name:</strong> {selectedProfile.name || "N/A"}</p>
        <p><strong>Gender:</strong> {selectedProfile.gender || "N/A"}</p>
        <p>
          <strong>DOB:</strong>{" "}
          {selectedProfile.dob
            ? new Date(selectedProfile.dob).toLocaleDateString()
            : "N/A"}
        </p>
        <p><strong>Caste:</strong> {selectedProfile.caste || "N/A"}</p>
      </div>

      <div className="mt-6">
        <h4 className="text-lg font-semibold text-pink-700 mb-3">📄 Profile Documents</h4>

       {selectedProfile?.profileDocs?.map((doc, idx) => (
  <div key={idx} className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-lg shadow mb-2">
    <div className="flex justify-between items-center">
      <span className="font-medium text-gray-800">{doc.docName}</span>
      <a
        href={`http://localhost:5000/api/files/${doc.filename}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-600 underline text-sm hover:text-pink-600"
      >
        View
      </a>
    </div>
  </div>
))}

      </div>
    </div>
  </div>
)} */}
{showProfileModal && selectedProfile && (
  <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-800 to-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-xl w-full relative border border-indigo-200 hover:shadow-pink-200 transition-shadow duration-300 ease-in-out">
      {/* Close Button */}
      <button
        onClick={closeProfile}
        className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-3xl font-extrabold transition duration-200"
        aria-label="Close profile modal"
      >
        ×
      </button>

      {/* Heading */}
      <h3 className="text-3xl font-extrabold mb-6 text-indigo-700 flex items-center gap-2">
        <span>👤</span> User Profile
      </h3>

      {/* User Info */}
      <div className="space-y-3 text-gray-700 text-lg leading-relaxed">
        <p><strong className="text-indigo-600">Name:</strong> {selectedProfile.name || "N/A"}</p>
        <p><strong className="text-indigo-600">Gender:</strong> {selectedProfile.gender || "N/A"}</p>
        <p>
          <strong className="text-indigo-600">DOB:</strong>{" "}
          {selectedProfile.dob
            ? new Date(selectedProfile.dob).toLocaleDateString()
            : "N/A"}
        </p>
        <p><strong className="text-indigo-600">Caste:</strong> {selectedProfile.caste || "N/A"}</p>
      </div>

      {/* Documents */}
      <div className="mt-8">
        <h4 className="text-xl font-semibold text-pink-700 mb-4 flex items-center gap-2">
          <span>📄</span> Profile Documents
        </h4>

        {selectedProfile?.profileDocs?.length > 0 ? (
          selectedProfile.profileDocs.map((doc, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg shadow hover:shadow-lg transition duration-300 ease-in-out group mb-3"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 group-hover:text-indigo-700">
                  {doc.docName}
                </span>
                <a
                  href={`http://localhost:5000/api/files/${doc.filename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-pink-600 underline text-sm font-medium transition duration-200"
                >
                  View
                </a>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 italic">No documents uploaded.</p>
        )}
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default OperatorPanel;