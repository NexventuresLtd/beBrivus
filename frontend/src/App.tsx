import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { OpportunitiesPage } from "./pages/OpportunitiesPage";
import { MentorsPage } from "./pages/MentorsPage";
import { TrackerPage } from "./pages/TrackerPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { ForumPage } from "./pages/ForumPage";
import { GamificationPage } from "./pages/GamificationPage";
import { AICoachPage } from "./pages/AICoachPage";
import MentorshipPage from "./pages/MentorshipPage";
import MentorDashboard from "./pages/MentorDashboard";
import VideoCallPage from "./pages/VideoCallPage";
import MentorOnboarding from "./components/MentorOnboarding";
import MentorProtectedRoute from "./components/MentorProtectedRoute";

// Admin imports
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { OpportunityManagement } from "./pages/admin/OpportunityManagement";
import { CreateOpportunity } from "./pages/admin/CreateOpportunity";
import { ResourceManagement } from "./pages/admin/ResourceManagement";
import { UserManagement } from "./pages/admin/UserManagement";
import { ForumManagement } from "./pages/admin/ForumManagement";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";
import { ForumNewPostPage } from "./pages/ForumNewPostPage";
import { ForumDiscussionPage } from "./pages/ForumDiscussionPage";
import { ProfilePage } from "./pages/ProfilePage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      {/* Add more protected routes here */}
      <Route
        path="/opportunities"
        element={
          <ProtectedRoute>
            <OpportunitiesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentors"
        element={
          <ProtectedRoute>
            <MentorshipPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tracker"
        element={
          <ProtectedRoute>
            <TrackerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <ResourcesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/forum"
        element={
          <ProtectedRoute>
            <ForumPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/forum/new"
        element={
          <ProtectedRoute>
            <ForumNewPostPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/forum/discussion/:slug"
        element={
          <ProtectedRoute>
            <ForumDiscussionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gamification"
        element={
          <ProtectedRoute>
            <GamificationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-coach"
        element={
          <ProtectedRoute>
            <AICoachPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <div className="min-h-screen flex items-center justify-center">
              <h1 className="text-2xl">Settings Page (Coming Soon)</h1>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <div className="min-h-screen flex items-center justify-center">
              <h1 className="text-2xl">Analytics Page (Coming Soon)</h1>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/achievements"
        element={
          <ProtectedRoute>
            <GamificationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/onboarding"
        element={
          <ProtectedRoute>
            <MentorOnboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor-dashboard"
        element={
          <MentorProtectedRoute>
            <MentorDashboard />
          </MentorProtectedRoute>
        }
      />
      <Route
        path="/video-call/:sessionId"
        element={
          <ProtectedRoute>
            <VideoCallPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="opportunities" element={<OpportunityManagement />} />
        <Route path="opportunities/new" element={<CreateOpportunity />} />
        <Route path="resources" element={<ResourceManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="forum" element={<ForumManagement />} />
        <Route
          path="analytics"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <h1 className="text-2xl">Analytics (Coming Soon)</h1>
            </div>
          }
        />
        <Route
          path="content"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <h1 className="text-2xl">Content Management (Coming Soon)</h1>
            </div>
          }
        />
        <Route
          path="settings"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <h1 className="text-2xl">Admin Settings (Coming Soon)</h1>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminAuthProvider>
          <Router>
            <div className="App">
              <AppRoutes />
            </div>
          </Router>
        </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
