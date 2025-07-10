import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Crown, Menu, Users, Database } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const Navbar = ({ recordCount = 0 }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/signin");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error during logout. Please try again.");
    }
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and User Info */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform border border-gray-700">
                <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 text-transparent bg-clip-text">
                  {user?.name?.charAt(0) || "A"}
                </span>
              </div>
              <div className="hidden sm:block">
                <div className="text-gray-200 font-semibold">Welcome back,</div>
                <div className="text-gray-400">{user?.name || "Guest"} 👋</div>
              </div>
            </div>
          </div>

          {/* Center - Navigation Links */}
          <div className="hidden sm:flex items-center space-x-2">
            {user?.role === "admin" && (
              <>
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 rounded-lg text-gray-200 hover:bg-gray-700/50 transition-colors backdrop-blur-sm"
                >
                  <Crown className="w-4 h-4" />
                  <span className="text-sm font-medium">Admin Dashboard</span>
                </Link>
                <Link
                  to="/admin/users"
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 rounded-lg text-gray-200 hover:bg-gray-700/50 transition-colors backdrop-blur-sm"
                >
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Manage Users</span>
                </Link>
                <Link
                  to="/"
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 rounded-lg text-gray-200 hover:bg-gray-700/50 transition-colors backdrop-blur-sm"
                >
                  <Database className="w-4 h-4" />
                  <span className="text-sm font-medium">Records Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-900/80 rounded-lg text-gray-200 hover:bg-red-800/80 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </>
            )}
          </div>

          {/* Right side - Record Count, Logout (for regular users), and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <div className="px-3 py-1 bg-gray-800/50 rounded-full backdrop-blur-sm">
              <span className="text-sm text-gray-200">
                {recordCount} records
              </span>
            </div>

            {/* Logout button for regular users (desktop) */}
            {user?.role !== "admin" && (
              <div className="hidden sm:block">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-900/80 rounded-lg text-gray-200 hover:bg-red-800/80 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="sm:hidden">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="p-2 text-gray-200 hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isDropdownOpen && (
          <div className="sm:hidden border-t border-gray-700 py-2 px-4 space-y-2 bg-gray-800/90 backdrop-blur-sm rounded-b-xl">
            {user?.role === "admin" ? (
              <>
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700/50 text-gray-200"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Crown className="w-4 h-4" />
                  <span className="text-sm font-medium">Admin Dashboard</span>
                </Link>
                <Link
                  to="/admin/users"
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700/50 text-gray-200"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Manage Users</span>
                </Link>
                <Link
                  to="/"
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700/50 text-gray-200"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Database className="w-4 h-4" />
                  <span className="text-sm font-medium">Records Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 p-2 rounded-lg bg-red-900/80 hover:bg-red-800/80 text-gray-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </>
            ) : (
              // Regular user logout button for mobile
              <button
                onClick={() => {
                  handleLogout();
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center space-x-2 p-2 rounded-lg bg-red-900/80 hover:bg-red-800/80 text-gray-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
