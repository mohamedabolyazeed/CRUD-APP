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
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 sm:p-8 rounded-xl mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-white">
            <Database className="w-7 h-7 sm:w-8 sm:h-8" /> Records Dashboard
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/90">
            Total Records: {records.length} | Page 1 of 1
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Form Section */}
        <div className="bg-white rounded-3xl shadow-sm p-8">
          <h2 className="text-2xl font-semibold mb-8 flex items-center gap-2 justify-center">
            <Plus className="w-6 h-6" /> Add New Record
          </h2>

          <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                placeholder="Enter your age"
                min="1"
                max="120"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Specialization
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                placeholder="Enter your specialization"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                placeholder="Enter your address"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
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
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Database className="w-5 h-5" /> Your Records
            </h2>
          </div>

          {Array.isArray(records) && records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Age
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Specialization
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Address
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.specialization}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => navigate(`/edit/${record._id}`)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-lg inline-flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(record._id)}
                          className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-lg inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Database className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No Records Found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
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
