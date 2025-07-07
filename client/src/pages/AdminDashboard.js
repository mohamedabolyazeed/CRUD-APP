import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Database,
  CheckCircle,
  Activity,
  BarChart3,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    totalData: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentData, setRecentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/api/dashboard");

      if (response.data.success) {
        const {
          stats: dashboardStats,
          recentUsers: users,
          recentData: data,
        } = response.data.data;
        setStats(dashboardStats);
        setRecentUsers(users);
        setRecentData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/signin");
    } catch (error) {
      toast.error("Error during logout");
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
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 sm:p-8 rounded-xl mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-white">
            <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8" /> Admin Dashboard
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/90">
            Total Users: {stats.totalUsers} | {stats.totalData} records
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Total Users
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {stats.totalUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Active Users
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {stats.activeUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Verified Users
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {stats.verifiedUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Database className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Total Data Entries
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {stats.totalData}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="bg-gray-50 p-4 border-b">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Recent Users
            </h3>
          </div>
          <div className="p-4 sm:p-6">
            {recentUsers.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {recentUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === "admin"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No users found.
              </p>
            )}
          </div>
        </div>

        {/* Recent Data Entries */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="bg-gray-50 p-4 border-b">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <Database className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Recent Data Entries
            </h3>
          </div>
          <div className="p-4 sm:p-6">
            {recentData.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {recentData.map((data) => (
                  <div
                    key={data._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {data.title || data.username}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        By: {data.user ? data.user.name : "Unknown"}
                      </p>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {new Date(data.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No data entries found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
