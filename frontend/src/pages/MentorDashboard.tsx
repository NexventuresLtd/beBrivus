import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mentorApi } from "../api/mentors";
import { Layout } from "../components/layout";
import { Button } from "../components/ui";
import {
  Calendar,
  Clock,
  Users,
  Video,
  MessageCircle,
  CheckCircle,
  XCircle,
  Play,
  Square,
  User,
  Award,
  TrendingUp,
  FileText,
} from "lucide-react";

interface Session {
  id: number;
  mentee: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    profile_picture?: string;
  };
  session_type: string;
  scheduled_start: string;
  scheduled_end: string;
  actual_start?: string;
  actual_end?: string;
  meeting_link?: string;
  meeting_id?: string;
  agenda: string;
  notes: string;
  mentor_notes: string;
  status: string;
  created_at: string;
}

interface Mentee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  profile_picture?: string;
  total_sessions: number;
  completed_sessions: number;
  last_session?: string;
  next_session?: string;
}

const MentorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "pending" | "upcoming" | "mentees" | "history"
  >("overview");

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [mentorNotes, setMentorNotes] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  const queryClient = useQueryClient();

  // Fetch mentor's sessions
  const { data: pendingSessions, isLoading: pendingLoading } = useQuery({
    queryKey: ["mentor-pending-sessions"],
    queryFn: () => mentorApi.getPendingSessions(),
    enabled: activeTab === "pending" || activeTab === "overview",
  });

  const { data: upcomingSessions, isLoading: upcomingLoading } = useQuery({
    queryKey: ["mentor-upcoming-sessions"],
    queryFn: () => mentorApi.getUpcomingSessions(),
    enabled: activeTab === "upcoming" || activeTab === "overview",
  });

  const { data: allSessions, isLoading: allLoading } = useQuery({
    queryKey: ["mentor-all-sessions"],
    queryFn: () => mentorApi.getMySessions(),
    enabled: activeTab === "history" || activeTab === "overview",
  });

  const { data: mentees, isLoading: menteesLoading } = useQuery({
    queryKey: ["mentor-mentees"],
    queryFn: () => mentorApi.getMyMentees(),
    enabled: activeTab === "mentees" || activeTab === "overview",
  });

  // Mutations
  const confirmSessionMutation = useMutation({
    mutationFn: (data: {
      session_id: number;
      mentor_notes?: string;
      meeting_link?: string;
    }) => mentorApi.confirmSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-pending-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-upcoming-sessions"] });
      setShowConfirmDialog(false);
      setSelectedSession(null);
      setMentorNotes("");
      setMeetingLink("");
    },
  });

  const rejectSessionMutation = useMutation({
    mutationFn: (data: { session_id: number; mentor_notes?: string }) =>
      mentorApi.rejectSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-pending-sessions"] });
      setShowRejectDialog(false);
      setSelectedSession(null);
      setMentorNotes("");
    },
  });

  const startSessionMutation = useMutation({
    mutationFn: (sessionId: number) =>
      mentorApi.startSession({ session_id: sessionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-upcoming-sessions"] });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: (data: { session_id: number; mentor_notes?: string }) =>
      mentorApi.endSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-upcoming-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-all-sessions"] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "requested":
        return "bg-warning-100 text-warning-800 border-warning-200";
      case "scheduled":
        return "bg-primary-100 text-primary-800 border-primary-200";
      case "in_progress":
        return "bg-success-100 text-success-800 border-success-200";
      case "completed":
        return "bg-success-100 text-success-800 border-success-200";
      case "cancelled":
        return "bg-error-100 text-error-800 border-error-200";
      case "rejected":
        return "bg-error-100 text-error-800 border-error-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  const getSessionTypeIcon = (sessionType: string) => {
    switch (sessionType) {
      case "video":
        return <Video className="w-5 h-5" />;
      case "chat":
        return <MessageCircle className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const handleConfirmSession = () => {
    if (!selectedSession) return;

    confirmSessionMutation.mutate({
      session_id: selectedSession.id,
      mentor_notes: mentorNotes,
      meeting_link: meetingLink,
    });
  };

  const handleRejectSession = () => {
    if (!selectedSession) return;

    rejectSessionMutation.mutate({
      session_id: selectedSession.id,
      mentor_notes: mentorNotes,
    });
  };

  const handleStartSession = (session: Session) => {
    startSessionMutation.mutate(session.id);
    // Navigate to video call
    window.open(`/video-call/${session.meeting_id || session.id}`, "_blank");
  };

  const renderOverviewTab = () => {
    const totalSessions = allSessions?.length || 0;
    const completedSessions =
      allSessions?.filter((s: Session) => s.status === "completed").length || 0;
    const totalMentees = mentees?.length || 0;
    const pendingCount = pendingSessions?.length || 0;
    const upcomingCount = upcomingSessions?.length || 0;

    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100">Total Mentees</p>
                <p className="text-3xl font-bold">{totalMentees}</p>
              </div>
              <Users className="w-8 h-8 text-primary-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-100">Total Sessions</p>
                <p className="text-3xl font-bold">{totalSessions}</p>
              </div>
              <Award className="w-8 h-8 text-secondary-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-success-500 to-success-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-success-100">Completed</p>
                <p className="text-3xl font-bold">{completedSessions}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-warning-500 to-warning-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warning-100">Pending</p>
                <p className="text-3xl font-bold">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-warning-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100">Upcoming</p>
                <p className="text-3xl font-bold">{upcomingCount}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-200" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Sessions */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-secondary-900">
                Pending Approvals
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("pending")}
                className="text-primary-600 hover:text-primary-700"
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {(pendingSessions?.slice(0, 3) || []).map((session: Session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-warning-50 rounded-lg border border-warning-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-warning-500 to-warning-600 rounded-full flex items-center justify-center text-white">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-secondary-900">
                        {session.mentee.first_name} {session.mentee.last_name}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {new Date(session.scheduled_start).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedSession(session);
                        setShowConfirmDialog(true);
                      }}
                      className="bg-success-600 hover:bg-success-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedSession(session);
                        setShowRejectDialog(true);
                      }}
                      className="border-error-300 text-error-600 hover:bg-error-50"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {pendingCount === 0 && (
                <p className="text-neutral-500 text-center py-4">
                  No pending sessions
                </p>
              )}
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-secondary-900">
                Upcoming Sessions
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("upcoming")}
                className="text-primary-600 hover:text-primary-700"
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {(upcomingSessions?.slice(0, 3) || []).map((session: Session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white">
                      {getSessionTypeIcon(session.session_type)}
                    </div>
                    <div>
                      <p className="font-semibold text-secondary-900">
                        {session.mentee.first_name} {session.mentee.last_name}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {new Date(session.scheduled_start).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {session.status === "scheduled" && (
                      <Button
                        size="sm"
                        onClick={() => handleStartSession(session)}
                        disabled={
                          new Date(session.scheduled_start).getTime() -
                            Date.now() >
                          10 * 60 * 1000
                        }
                        className="bg-success-600 hover:bg-success-700"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    )}
                    {session.status === "in_progress" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          endSessionMutation.mutate({ session_id: session.id })
                        }
                        className="border-error-300 text-error-600 hover:bg-error-50"
                      >
                        <Square className="w-4 h-4 mr-1" />
                        End
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {upcomingCount === 0 && (
                <p className="text-neutral-500 text-center py-4">
                  No upcoming sessions
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPendingTab = () => {
    if (pendingLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-secondary-900 mb-6">
          Pending Sessions
        </h2>

        {(pendingSessions || []).map((session: Session) => (
          <div
            key={session.id}
            className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-warning-500 to-warning-600 rounded-xl flex items-center justify-center text-white">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-secondary-900">
                    {session.mentee.first_name} {session.mentee.last_name}
                  </h3>
                  <p className="text-neutral-600">{session.mentee.email}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-neutral-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(session.scheduled_start).toLocaleDateString()}
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(session.scheduled_start).toLocaleTimeString()}
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      {getSessionTypeIcon(session.session_type)}
                      <span>{session.session_type}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    setSelectedSession(session);
                    setShowConfirmDialog(true);
                  }}
                  className="bg-success-600 hover:bg-success-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSession(session);
                    setShowRejectDialog(true);
                  }}
                  className="border-error-300 text-error-600 hover:bg-error-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Decline
                </Button>
              </div>
            </div>

            {session.agenda && (
              <div className="bg-neutral-50 rounded-lg p-4 mt-4">
                <p className="text-sm text-neutral-500 mb-1">Session Agenda:</p>
                <p className="text-secondary-700">{session.agenda}</p>
              </div>
            )}
          </div>
        ))}

        {(pendingSessions || []).length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No Pending Sessions
            </h3>
            <p className="text-neutral-500">
              All caught up! You have no sessions waiting for approval.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderUpcomingTab = () => {
    if (upcomingLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-secondary-900 mb-6">
          Upcoming Sessions
        </h2>

        {(upcomingSessions || []).map((session: Session) => (
          <div
            key={session.id}
            className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center text-white shadow-md">
                  {getSessionTypeIcon(session.session_type)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-secondary-900">
                    {session.mentee.first_name} {session.mentee.last_name}
                  </h3>
                  <p className="text-neutral-600">{session.mentee.email}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-neutral-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(session.scheduled_start).toLocaleDateString()}
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(session.scheduled_start).toLocaleTimeString()}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    session.status
                  )}`}
                >
                  {session.status.replace("_", " ").toUpperCase()}
                </span>

                {session.status === "scheduled" && (
                  <Button
                    onClick={() => handleStartSession(session)}
                    disabled={
                      new Date(session.scheduled_start).getTime() - Date.now() >
                      10 * 60 * 1000
                    }
                    className="bg-success-600 hover:bg-success-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Session
                  </Button>
                )}

                {session.status === "in_progress" && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      endSessionMutation.mutate({ session_id: session.id })
                    }
                    className="border-error-300 text-error-600 hover:bg-error-50"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    End Session
                  </Button>
                )}
              </div>
            </div>

            {(session.agenda || session.mentor_notes) && (
              <div className="space-y-3 mt-4">
                {session.agenda && (
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <p className="text-sm text-neutral-500 mb-1">
                      Session Agenda:
                    </p>
                    <p className="text-secondary-700">{session.agenda}</p>
                  </div>
                )}
                {session.mentor_notes && (
                  <div className="bg-primary-50 rounded-lg p-4">
                    <p className="text-sm text-neutral-500 mb-1">Your Notes:</p>
                    <p className="text-secondary-700">{session.mentor_notes}</p>
                  </div>
                )}
              </div>
            )}

            {session.meeting_link && (
              <div className="mt-4 p-4 bg-success-50 rounded-lg border border-success-200">
                <p className="text-sm text-success-700 mb-2 font-medium">
                  Meeting Link:
                </p>
                <a
                  href={session.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-success-600 hover:text-success-700 underline break-all"
                >
                  {session.meeting_link}
                </a>
              </div>
            )}
          </div>
        ))}

        {(upcomingSessions || []).length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No Upcoming Sessions
            </h3>
            <p className="text-neutral-500">
              You have no scheduled sessions at the moment.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderMenteesTab = () => {
    if (menteesLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-secondary-900 mb-6">
          My Mentees
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(mentees || []).map((mentee: Mentee) => (
            <div
              key={mentee.id}
              className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  <User className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-secondary-900">
                  {mentee.first_name} {mentee.last_name}
                </h3>
                <p className="text-neutral-600 mb-4">{mentee.email}</p>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-primary-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-primary-600">
                      {mentee.total_sessions}
                    </p>
                    <p className="text-sm text-neutral-600">Total Sessions</p>
                  </div>
                  <div className="bg-success-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-success-600">
                      {mentee.completed_sessions}
                    </p>
                    <p className="text-sm text-neutral-600">Completed</p>
                  </div>
                </div>

                {mentee.next_session && (
                  <div className="mt-4 p-3 bg-warning-50 rounded-lg border border-warning-200">
                    <p className="text-sm text-warning-700 font-medium">
                      Next Session:
                    </p>
                    <p className="text-sm text-neutral-600">
                      {new Date(mentee.next_session).toLocaleString()}
                    </p>
                  </div>
                )}

                {mentee.last_session && !mentee.next_session && (
                  <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-500">Last Session:</p>
                    <p className="text-sm text-neutral-600">
                      {new Date(mentee.last_session).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {(mentees || []).length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No Mentees Yet
            </h3>
            <p className="text-neutral-500">
              You haven't mentored anyone yet. Start accepting session requests
              to build your mentee network!
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">
              Mentor Dashboard
            </h1>
            <p className="text-neutral-600">
              Manage your mentoring sessions and mentees
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 mb-8">
            <nav className="flex space-x-1 p-1">
              {[
                { key: "overview", label: "Overview", icon: TrendingUp },
                { key: "pending", label: "Pending", icon: Clock },
                { key: "upcoming", label: "Upcoming", icon: Calendar },
                { key: "mentees", label: "Mentees", icon: Users },
                { key: "history", label: "History", icon: FileText },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === key
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-neutral-600 hover:bg-primary-50 hover:text-primary-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && renderOverviewTab()}
          {activeTab === "pending" && renderPendingTab()}
          {activeTab === "upcoming" && renderUpcomingTab()}
          {activeTab === "mentees" && renderMenteesTab()}

          {/* Confirmation Dialog */}
          {showConfirmDialog && selectedSession && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full">
                <h3 className="text-lg font-bold text-secondary-900 mb-4">
                  Confirm Session
                </h3>
                <p className="text-neutral-600 mb-4">
                  Accept session with {selectedSession.mentee.first_name}{" "}
                  {selectedSession.mentee.last_name}?
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Meeting Link (optional)
                    </label>
                    <input
                      type="url"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://meet.google.com/xyz..."
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Notes (optional)
                    </label>
                    <textarea
                      value={mentorNotes}
                      onChange={(e) => setMentorNotes(e.target.value)}
                      placeholder="Add any notes or preparation instructions..."
                      rows={3}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button
                    onClick={handleConfirmSession}
                    disabled={confirmSessionMutation.isPending}
                    className="flex-1 bg-success-600 hover:bg-success-700"
                  >
                    {confirmSessionMutation.isPending
                      ? "Confirming..."
                      : "Confirm Session"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowConfirmDialog(false);
                      setSelectedSession(null);
                      setMentorNotes("");
                      setMeetingLink("");
                    }}
                    className="border-neutral-300 text-neutral-600"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Dialog */}
          {showRejectDialog && selectedSession && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full">
                <h3 className="text-lg font-bold text-secondary-900 mb-4">
                  Decline Session
                </h3>
                <p className="text-neutral-600 mb-4">
                  Decline session with {selectedSession.mentee.first_name}{" "}
                  {selectedSession.mentee.last_name}?
                </p>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Reason (optional)
                  </label>
                  <textarea
                    value={mentorNotes}
                    onChange={(e) => setMentorNotes(e.target.value)}
                    placeholder="Let them know why you can't accept this session..."
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button
                    onClick={handleRejectSession}
                    disabled={rejectSessionMutation.isPending}
                    className="flex-1 bg-error-600 hover:bg-error-700"
                  >
                    {rejectSessionMutation.isPending
                      ? "Declining..."
                      : "Decline Session"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectDialog(false);
                      setSelectedSession(null);
                      setMentorNotes("");
                    }}
                    className="border-neutral-300 text-neutral-600"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MentorDashboard;
