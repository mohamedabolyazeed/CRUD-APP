import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, Database } from "lucide-react";

const Home = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    age: "",
    specialization: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await axios.get("/api/data", { withCredentials: true });
      const data = response.data.records || response.data.data || [];
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to fetch records");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post("/api/data", formData, { withCredentials: true });
      toast.success("Record added successfully!");
      setFormData({
        username: "",
        age: "",
        specialization: "",
        address: "",
      });
      fetchRecords();
    } catch (error) {
      const message = error.response?.data?.error || "Failed to add record";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this record? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await axios.delete(`/api/data/${id}`, { withCredentials: true });
      toast.success("Record deleted successfully!");
      fetchRecords();
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="card p-6 sm:p-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-gradient">
            <Database className="w-7 h-7 sm:w-8 sm:h-8 text-primary-400" />{" "}
            Records Dashboard
          </h1>
          <p className="mt-2 text-sm sm:text-base text-dark-400">
            Total Records: {records.length} | Page 1 of 1
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Form Section */}
        <div className="card p-8">
          <h2 className="text-2xl font-semibold mb-8 flex items-center gap-2 justify-center text-gradient">
            <Plus className="w-6 h-6 text-primary-400" /> Add New Record
          </h2>

          <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
            <div>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="form-label">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your age"
                min="1"
                max="120"
                required
              />
            </div>

            <div>
              <label className="form-label">Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your specialization"
                required
              />
            </div>

            <div>
              <label className="form-label">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your address"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" /> Add Record
                </>
              )}
            </button>
          </form>
        </div>

        {/* Records Section */}
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-dark-700/50">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-dark-200">
              <Database className="w-5 h-5" /> Your Records
            </h2>
          </div>

          {Array.isArray(records) && records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-dark-700/50">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-dark-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700/50">
                  {records.map((record) => (
                    <tr
                      key={record._id}
                      className="hover:bg-dark-800/50 transition-all"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">
                        {record.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">
                        {record.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">
                        {record.specialization}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-200">
                        {record.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button
                          onClick={() => navigate(`/edit/${record._id}`)}
                          className="action-button edit"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(record._id)}
                          className="action-button delete"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Database className="mx-auto h-12 w-12 text-dark-500" />
              <h3 className="mt-4 text-lg font-medium text-dark-200">
                No Records Found
              </h3>
              <p className="mt-2 text-sm text-dark-400">
                Get started by adding your first record!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
