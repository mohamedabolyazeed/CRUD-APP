import React, { useState, useEffect } from "react";
import {
  Users,
  Database,
  CheckCircle,
  Activity,
  BarChart3,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

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
            <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-primary-400" />{" "}
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm sm:text-base text-dark-400">
            Total Users: {stats.totalUsers} | {stats.totalData} records
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-900/30 rounded-xl">
              <Users className="h-6 w-6 sm:h-7 sm:w-7 text-primary-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-dark-400">Total Users</p>
              <p className="text-2xl sm:text-3xl font-bold text-gradient">
                {stats.totalUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-900/30 rounded-xl">
              <Activity className="h-6 w-6 sm:h-7 sm:w-7 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-dark-400">Active Users</p>
              <p className="text-2xl sm:text-3xl font-bold text-gradient">
                {stats.activeUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent-900/30 rounded-xl">
              <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-accent-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-dark-400">
                Verified Users
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gradient">
                {stats.verifiedUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-900/30 rounded-xl">
              <Database className="h-6 w-6 sm:h-7 sm:w-7 text-primary-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-dark-400">
                Total Data Entries
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gradient">
                {stats.totalData}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-dark-700/50">
            <h3 className="text-lg font-semibold text-dark-200 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Users
            </h3>
          </div>
          <div className="p-6">
            {recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div
                    key={user._id}
                    className="p-4 rounded-xl bg-dark-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-dark-200 truncate">
                        {user.name}
                      </p>
                      <p className="text-sm text-dark-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`status-badge ${
                          user.role === "admin" ? "admin" : "user"
                        }`}
                      >
                        {user.role}
                      </span>
                      <span
                        className={`status-badge ${
                          user.isActive ? "active" : "inactive"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-dark-400">No users found.</p>
            )}
          </div>
        </div>

        {/* Recent Data Entries */}
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-dark-700/50">
            <h3 className="text-lg font-semibold text-dark-200 flex items-center gap-2">
              <Database className="h-5 w-5" />
              Recent Data Entries
            </h3>
          </div>
          <div className="p-6">
            {recentData.length > 0 ? (
              <div className="space-y-4">
                {recentData.map((data) => (
                  <div
                    key={data._id}
                    className="p-4 rounded-xl bg-dark-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-dark-200 truncate">
                        {data.title || data.username}
                      </p>
                      <p className="text-sm text-dark-400 truncate">
                        By: {data.user ? data.user.name : "Unknown"}
                      </p>
                    </div>
                    <div className="text-sm text-dark-400">
                      {new Date(data.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-dark-400">
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
