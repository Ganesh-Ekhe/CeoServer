


import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import { Check, FileText, Download, AlertCircle } from "lucide-react";

const UserDashboard = () => {
  const { user } = useUser();
  const [applications, setApplications] = useState([]);
  const [corrections, setCorrections] = useState({});
  const [loading, setLoading] = useState(false);

  const FILE_URL = "http://localhost:5000/api/files/";

  useEffect(() => {
    if (user?.token) {
      fetchApps();
    }
  }, [user]);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/applications/user", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setApplications(res.data.reverse()); // 👈 Reversing inline
    } catch (err) {
      console.error("Failed to fetch user applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (appId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/applications/${appId}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Application confirmed!");
      fetchApps();
    } catch (err) {
      console.error("Confirm error:", err);
      alert("Failed to confirm application.");
    }
  };

  const handleCorrectionChange = (appId, value) => {
    setCorrections((prev) => ({ ...prev, [appId]: value }));
  };

  const submitCorrection = async (appId) => {
    const reason = corrections[appId];
    if (!reason || reason.trim() === "") {
      alert("Please enter correction reason.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/applications/${appId}/correction`,
        { comment: reason },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Correction sent to operator.");
      fetchApps();
    } catch (err) {
      console.error("Correction submit failed:", err);
      alert("Failed to send correction.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-25">
      <h2 className="text-3xl font-bold mb-8 text-indigo-800 tracking-tight">
        📋 Your Applications
      </h2>

      {loading ? (
        <div className="text-center text-indigo-600 animate-pulse">Loading applications...</div>
      ) : applications.length === 0 ? (
        <p className="text-gray-600">No applications found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <tr>
                <th className="p-3 text-left">Service</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Filled PDF</th>
                <th className="p-3 text-left">Certificate</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{app.service?.name || "N/A"}</td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold shadow border inline-flex items-center gap-1 ${
                        app.status === "Rejected"
                          ? "bg-red-100 text-red-700 border-red-300"
                          : app.status === "Pending Confirmation"
                          ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                          : app.status === "Confirmed"
                          ? "bg-green-100 text-green-700 border-green-300"
                          : "bg-gray-100 text-gray-600 border-gray-300"
                      }`}
                    >
                      {app.status === "Rejected" && <AlertCircle size={12} />}
                      {app.status}
                    </span>
                    {app.rejectReason && (
                      <div className="text-red-600 text-xs mt-1">
                        <b>Reason:</b> {app.rejectReason}
                      </div>
                    )}
                  </td>

                  

                  <td className="p-3">
                    {app.formPdf?.filename ? (
                      <a
                        href={`${FILE_URL}${app.formPdf.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <FileText size={14} /> View PDF
                      </a>
                    ) : (
                      <span className="text-gray-400">Not uploaded</span>
                    )}
                  </td>

                  <td className="p-3">
                    {app.status === "Completed" && app.certificate?.filename ? (
                      <a
                        href={`${FILE_URL}${app.certificate.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 flex items-center gap-1"
                      >
                        <Download size={14} /> Download
                      </a>
                    ) : (
                      <span className="text-gray-400">Not available</span>
                    )}
                  </td>

                  <td className="p-3 space-y-2">
                    {app.status === "Pending Confirmation" && (
                      <>
                        <button
                          onClick={() => handleConfirm(app._id)}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center justify-center gap-2 w-full transition"
                        >
                          <Check size={16} /> Confirm
                        </button>

                        <textarea
                          rows={2}
                          placeholder="Write correction comment..."
                          value={corrections[app._id] || ""}
                          onChange={(e) => handleCorrectionChange(app._id, e.target.value)}
                          className="w-full border px-2 py-1 text-xs rounded mt-2"
                        />
                        <button
                          onClick={() => submitCorrection(app._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 flex items-center justify-center gap-2 w-full transition"
                        >
                          <AlertCircle size={16} /> Send Correction
                        </button>
                      </>
                    )}

                    {app.status === "Rejected" && app.rejectReason && (
                      <div className="mt-2 text-xs text-red-600">
                        <b>Rejected:</b> {app.rejectReason}
                      </div>
                    )}

                    {app.status === "Confirmed" && (
                      <div className="text-green-600 text-xs flex items-center gap-1">
                        <Check size={14} /> Confirmed
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
