import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Target,
  Bell,
  Search,
  Menu,
  X,
} from "lucide-react";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { useState } from "react";

export const AdminLayout: React.FC = () => {
  const { adminUser, adminLogout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login");
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      current: location.pathname === "/admin/dashboard",
    },
    {
      name: "Opportunities",
      href: "/admin/opportunities",
      icon: Target,
      current: location.pathname.startsWith("/admin/opportunities"),
    },
    {
      name: "Resources",
      href: "/admin/resources",
      icon: FileText,
      current: location.pathname.startsWith("/admin/resources"),
    },
    {
      name: "User Management",
      href: "/admin/users",
      icon: Users,
      current: location.pathname.startsWith("/admin/users"),
    },
    // {
    //   name: "Analytics",
    //   href: "/admin/analytics",
    //   icon: BarChart3,
    //   current: location.pathname.startsWith("/admin/analytics"),
    // },
    // {
    //   name: "Content",
    //   href: "/admin/content",
    //   icon: BookOpen,
    //   current: location.pathname.startsWith("/admin/content"),
    // },
    // {
    //   name: "Settings",
    //   href: "/admin/settings",
    //   icon: Settings,
    //   current: location.pathname.startsWith("/admin/settings"),
    // },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 lg:flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-primary-600 to-secondary-600">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                <span className="text-primary-600 font-bold text-sm">bB</span>
              </div>
              <span className="text-white font-bold text-lg">Admin Portal</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:text-neutral-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto w-64">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    item.current
                      ? "bg-primary-100 text-primary-700 border-r-2 border-primary-600"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-neutral-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-semibold text-sm">
                  {adminUser?.first_name?.[0] ||
                    adminUser?.username?.[0] ||
                    "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {adminUser?.first_name && adminUser?.last_name
                    ? `${adminUser.first_name} ${adminUser.last_name}`
                    : adminUser?.username}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  {adminUser?.is_superuser ? "Super Admin" : "Admin"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-3 flex items-center px-3 py-2 text-sm font-medium text-error-600 hover:bg-error-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="w-full">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-neutral-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-neutral-500 hover:text-neutral-700 mr-4"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-neutral-900">
                {navigation.find((item) => item.current)?.name || "Dashboard"}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-neutral-400" />
                </div>
                <input
                  type="text"
                  className="w-64 pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder="Search..."
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full"></span>
              </button>

              {/* Profile */}
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {adminUser?.first_name?.[0] ||
                      adminUser?.username?.[0] ||
                      "A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
