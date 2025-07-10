import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Users, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
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
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="card p-6 sm:p-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-gradient">
            <Users className="w-7 h-7 sm:w-8 sm:h-8 text-primary-400" /> Manage
            Users
          </h1>
          <p className="mt-2 text-sm sm:text-base text-dark-400">
            Total Users: {pagination?.totalUsers ?? 0} | Page{" "}
            {pagination?.page ?? 1} of {pagination?.totalPages ?? 1}
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="p-6 border-b border-dark-700/50">
              <div className="grid grid-cols-6 gap-4 font-semibold text-dark-200 text-sm">
                <div>Name</div>
                <div>Email</div>
                <div>Role</div>
                <div>Status</div>
                <div>Verified</div>
                <div className="text-right">Actions</div>
              </div>
            </div>

            {users.length > 0 ? (
              <div className="divide-y divide-dark-700/50">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="grid grid-cols-6 gap-4 p-6 hover:bg-dark-800/50 transition-all items-center text-sm"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-dark-200 truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-dark-400 truncate">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-dark-300 truncate">{user.email}</div>
                    <div>
                      <select
                        value={user.role}
                        onChange={(e) =>
                          updateUserRole(user._id, e.target.value)
                        }
                        className={`status-badge w-full ${
                          user.role === "admin" ? "admin" : "user"
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
                        className={`status-badge w-full ${
                          user.isActive ? "active" : "inactive"
                        }`}
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <span
                        className={`status-badge ${
                          user.isEmailVerified ? "active" : "inactive"
                        }`}
                      >
                        {user.isEmailVerified ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="text-right">
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="action-button delete"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-dark-400">
                No users found.
              </div>
            )}
          </div>
        </div>
      </div>

      {pagination?.totalPages > 1 && (
        <div className="flex flex-wrap justify-center gap-2">
          {pagination?.page > 1 && (
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-dark-800 text-dark-200 hover:bg-dark-700 transition-all border border-dark-700/50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {Array.from(
            { length: pagination?.totalPages ?? 1 },
            (_, i) => i + 1
          ).map((page) => (
            <button
              key={page}
              onClick={() => setPagination((prev) => ({ ...prev, page }))}
              className={`inline-flex items-center justify-center w-10 h-10 text-sm font-medium rounded-xl transition-all border border-dark-700/50 ${
                page === pagination?.page
                  ? "bg-dark-700 text-dark-100"
                  : "bg-dark-800 text-dark-400 hover:bg-dark-700"
              }`}
            >
              {page}
            </button>
          ))}

          {pagination?.page < pagination?.totalPages && (
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-dark-800 text-dark-200 hover:bg-dark-700 transition-all border border-dark-700/50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
