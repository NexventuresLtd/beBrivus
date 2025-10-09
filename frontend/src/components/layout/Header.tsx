import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  User,
  LogOut,
  Settings,
  Bell,
  Search,
  BookOpen,
  Users,
  Target,
  BarChart3,
  Gift,
  Bot,
  Trophy,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui";

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-secondary-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to={
                isAuthenticated && user?.user_type === "mentor"
                  ? "/mentor-dashboard"
                  : "/"
              }
              className="flex items-center space-x-2"
            >
              <img
                className="max-w-20"
                src="/beBivus.png"
                alt="beBrivus Logo"
              />
            </Link>
          </div>

          {/* Navigation - Desktop */}
          {isAuthenticated && user?.user_type !== "mentor" && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/opportunities"
                className="flex items-center space-x-1 text-secondary-700 hover:text-primary-600 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Opportunities</span>
              </Link>
              <Link
                to="/mentors"
                className="flex items-center space-x-1 text-secondary-700 hover:text-primary-600 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Mentors</span>
              </Link>
              <Link
                to="/tracker"
                className="flex items-center space-x-1 text-secondary-700 hover:text-primary-600 transition-colors"
              >
                <Target className="w-4 h-4" />
                <span>Tracker</span>
              </Link>
              <Link
                to="/resources"
                className="flex items-center space-x-1 text-secondary-700 hover:text-primary-600 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Resources</span>
              </Link>
              <Link
                to="/forum"
                className="flex items-center space-x-1 text-secondary-700 hover:text-primary-600 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Forum</span>
              </Link>
              <Link
                to="/ai-coach"
                className="flex items-center space-x-1 text-secondary-700 hover:text-primary-600 transition-colors"
              >
                <Bot className="w-4 h-4" />
                <span>AI Coach</span>
              </Link>
            </nav>
          )}

          {/* Mentor Navigation - Simple header for mentors */}
          {/* {isAuthenticated && user?.user_type === 'mentor' && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/mentor-dashboard"
                className="flex items-center space-x-1 text-secondary-700 hover:text-primary-600 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/mentorship"
                className="flex items-center space-x-1 text-secondary-700 hover:text-primary-600 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Mentorship</span>
              </Link>
            </nav>
          )} */}

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button className="p-2 text-secondary-600 hover:text-secondary-900 relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-error-500 rounded-full"></span>
                </button>

                {/* User Menu */}
                <Menu as="div" className="relative">
                  <MenuButton className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary-100 transition-colors">
                    {user?.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt={user.first_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="hidden md:block text-sm font-medium text-secondary-900">
                      {user?.first_name}
                    </span>
                  </MenuButton>

                  <MenuItems className="absolute right-0 mt-2 w-56 bg-white border border-secondary-200 rounded-lg shadow-lg py-1 z-50">
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          to="/profile"
                          className={`${
                            focus ? "bg-secondary-50" : ""
                          } flex items-center space-x-2 px-4 py-2 text-sm text-secondary-700`}
                        >
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                      )}
                    </MenuItem>
                    <hr className="my-1 border-secondary-200" />
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            focus ? "bg-secondary-50" : ""
                          } flex items-center space-x-2 px-4 py-2 text-sm text-error-600 w-full text-left`}
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign out</span>
                        </button>
                      )}
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/register")}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
