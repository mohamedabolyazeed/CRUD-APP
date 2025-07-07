import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Users, Crown, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [pagination.page]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "/api/admin/api/users?page=" +
          (pagination.page || 1) +
          "&limit=" +
          (pagination.limit || 10),
        { withCredentials: true }
      );
      setUsers(response.data.data?.users || []);
      setPagination(
        response.data.data?.pagination || {
          page: 1,
          totalPages: 1,
          totalUsers: 0,
          limit: 10,
        }
      );
    } catch (error) {
      toast.error("Failed to fetch users");
      setUsers([]);
      setPagination({
        page: 1,
        totalPages: 1,
        totalUsers: 0,
        limit: 10,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await axios.put(
        `/api/admin/api/users/${userId}/role`,
        { role },
        { withCredentials: true }
      );
      toast.success("User role updated successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      await axios.put(
        `/api/admin/api/users/${userId}/status`,
        { isActive },
        { withCredentials: true }
      );
      toast.success("User status updated successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const deleteUser = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await axios.delete(`/api/admin/api/users/${userId}`, {
        withCredentials: true,
      });
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
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
            <Users className="w-7 h-7 sm:w-8 sm:h-8" /> Manage Users
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/90">
            Total Users: {pagination?.totalUsers ?? 0} | Page{" "}
            {pagination?.page ?? 1} of {pagination?.totalPages ?? 1}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="bg-gray-50 p-4 border-b">
              <div className="grid grid-cols-6 gap-4 font-semibold text-gray-700 text-sm">
                <div>Name</div>
                <div>Email</div>
                <div>Role</div>
                <div>Status</div>
                <div>Verified</div>
                <div className="text-right">Actions</div>
              </div>
            </div>

            {users.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="grid grid-cols-6 gap-4 p-4 hover:bg-gray-50 transition-colors items-center text-sm"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-gray-600 truncate">{user.email}</div>
                    <div>
                      <select
                        value={user.role}
                        onChange={(e) =>
                          updateUserRole(user._id, e.target.value)
                        }
                        className={`w-full px-2 py-1 rounded-full text-xs font-medium border-0 ${
                          user.role === "admin"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <select
                        value={user.isActive.toString()}
                        onChange={(e) =>
                          updateUserStatus(user._id, e.target.value === "true")
                        }
                        className={`w-full px-2 py-1 rounded-full text-xs font-medium border-0 ${
                          user.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          user.isEmailVerified
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {user.isEmailVerified ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="text-right">
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">
                No users found.
              </div>
            )}
          </div>
        </div>
      </div>

      {pagination?.totalPages > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {pagination?.page > 1 && (
            <a
              href={`/admin/users?page=${pagination.page - 1}`}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </a>
          )}

          {Array.from(
            { length: pagination?.totalPages ?? 1 },
            (_, i) => i + 1
          ).map((page) => (
            <a
              key={page}
              href={`/admin/users?page=${page}`}
              className={`inline-flex items-center justify-center w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                page === pagination?.page
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {page}
            </a>
          ))}

          {pagination?.page < pagination?.totalPages && (
            <a
              href={`/admin/users?page=${pagination.page + 1}`}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
