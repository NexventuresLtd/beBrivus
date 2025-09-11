import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Layout } from "../components/layout/Layout";

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  applicationDate: string;
  status:
    | "Applied"
    | "Under Review"
    | "Interview"
    | "Offer"
    | "Rejected"
    | "Withdrawn";
  priority: "High" | "Medium" | "Low";
  salary: string;
  notes: string;
  nextAction: string;
  nextActionDate: string;
  documents: string[];
  interviewDates: string[];
  jobUrl?: string;
}

// Mock data for applications
const mockApplications: Application[] = [
  {
    id: "1",
    jobTitle: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    applicationDate: "2024-01-15",
    status: "Interview",
    priority: "High",
    salary: "$120,000 - $150,000",
    notes:
      "Great culture fit, excited about the role. Technical interview scheduled for next week.",
    nextAction: "Technical Interview",
    nextActionDate: "2024-01-25",
    documents: ["Resume", "Cover Letter", "Portfolio"],
    interviewDates: ["2024-01-20", "2024-01-25"],
    jobUrl: "https://techcorp.com/careers/senior-frontend-dev",
  },
  {
    id: "2",
    jobTitle: "Product Manager",
    company: "StartupXYZ",
    location: "New York, NY",
    applicationDate: "2024-01-14",
    status: "Under Review",
    priority: "Medium",
    salary: "$100,000 - $130,000",
    notes: "Applied through LinkedIn. HR mentioned 2-week review process.",
    nextAction: "Follow up with HR",
    nextActionDate: "2024-01-28",
    documents: ["Resume", "Cover Letter"],
    interviewDates: [],
  },
  {
    id: "3",
    jobTitle: "UX Designer",
    company: "Design Studio",
    location: "Remote",
    applicationDate: "2024-01-10",
    status: "Offer",
    priority: "High",
    salary: "$80,000 - $95,000",
    notes:
      "Received offer! Need to negotiate salary and review benefits package.",
    nextAction: "Salary Negotiation",
    nextActionDate: "2024-01-22",
    documents: ["Resume", "Portfolio", "Design Challenge"],
    interviewDates: ["2024-01-16", "2024-01-18"],
  },
  {
    id: "4",
    jobTitle: "Software Engineer",
    company: "Big Tech Co",
    location: "Seattle, WA",
    applicationDate: "2024-01-08",
    status: "Rejected",
    priority: "Medium",
    salary: "$130,000 - $160,000",
    notes:
      "Feedback: Strong technical skills but looking for more system design experience.",
    nextAction: "Improve system design skills",
    nextActionDate: "2024-02-01",
    documents: ["Resume", "Cover Letter"],
    interviewDates: ["2024-01-12"],
  },
];

const getStatusColor = (status: Application["status"]) => {
  switch (status) {
    case "Applied":
      return "secondary";
    case "Under Review":
      return "warning";
    case "Interview":
      return "primary";
    case "Offer":
      return "success";
    case "Rejected":
      return "error";
    case "Withdrawn":
      return "secondary";
    default:
      return "secondary";
  }
};

const getStatusIcon = (status: Application["status"]) => {
  switch (status) {
    case "Applied":
      return <Clock className="h-4 w-4" />;
    case "Under Review":
      return <AlertCircle className="h-4 w-4" />;
    case "Interview":
      return <Calendar className="h-4 w-4" />;
    case "Offer":
      return <CheckCircle className="h-4 w-4" />;
    case "Rejected":
      return <XCircle className="h-4 w-4" />;
    case "Withdrawn":
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const ApplicationCard: React.FC<{ application: Application }> = ({
  application,
}) => {
  const handleView = () => {
    console.log("View application:", application.id);
    // TODO: Implement view functionality
  };

  const handleEdit = () => {
    console.log("Edit application:", application.id);
    // TODO: Implement edit functionality
  };

  const handleDelete = () => {
    console.log("Delete application:", application.id);
    // TODO: Implement delete functionality
  };

  const handleViewJob = () => {
    if (application.jobUrl) {
      window.open(application.jobUrl, "_blank");
    }
  };

  const isUpcoming =
    application.nextActionDate &&
    new Date(application.nextActionDate) <=
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <Card
      className={`p-6 hover:shadow-lg transition-shadow ${
        isUpcoming ? "border-primary-200 bg-primary-50" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {application.jobTitle}
            </h3>
            <Badge
              variant={getStatusColor(application.status)}
              className="text-xs flex items-center gap-1"
            >
              {getStatusIcon(application.status)}
              {application.status}
            </Badge>
            <Badge
              variant={
                application.priority === "High"
                  ? "error"
                  : application.priority === "Medium"
                  ? "warning"
                  : "secondary"
              }
              className="text-xs"
            >
              {application.priority}
            </Badge>
          </div>
          <p className="text-lg text-gray-700 mb-1">{application.company}</p>
          <p className="text-gray-600 mb-2">{application.location}</p>
          <p className="text-gray-600 font-medium">{application.salary}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleView}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
          {application.jobUrl && (
            <Button variant="ghost" size="sm" onClick={handleViewJob}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {application.notes && (
        <div className="mb-4">
          <p className="text-gray-600 text-sm line-clamp-2">
            {application.notes}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">
            Application Date
          </p>
          <p className="text-sm text-gray-900">
            {new Date(application.applicationDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Next Action</p>
          <p className="text-sm text-gray-900">{application.nextAction}</p>
          <p className="text-xs text-gray-500">
            {new Date(application.nextActionDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {application.documents.map((doc, index) => (
          <div
            key={index}
            className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
          >
            <FileText className="h-3 w-3" />
            {doc}
          </div>
        ))}
      </div>

      {application.interviewDates.length > 0 && (
        <div className="border-t pt-3">
          <p className="text-xs font-medium text-gray-500 mb-2">
            Interview Dates
          </p>
          <div className="flex flex-wrap gap-2">
            {application.interviewDates.map((date, index) => (
              <Badge key={index} variant="primary" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(date).toLocaleDateString()}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export const TrackerPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");

  const filteredApplications = mockApplications.filter((application) => {
    const matchesSearch =
      application.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || application.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || application.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return (
          new Date(b.applicationDate).getTime() -
          new Date(a.applicationDate).getTime()
        );
      case "company":
        return a.company.localeCompare(b.company);
      case "status":
        return a.status.localeCompare(b.status);
      case "priority":
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      default:
        return 0;
    }
  });

  const statusCounts = mockApplications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const upcomingActions = mockApplications.filter(
    (app) =>
      app.nextActionDate &&
      new Date(app.nextActionDate) <=
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Application Tracker
            </h1>
            <p className="text-gray-600">
              Keep track of your job applications and stay organized
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Application
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockApplications.length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(statusCounts["Applied"] || 0) +
                    (statusCounts["Under Review"] || 0) +
                    (statusCounts["Interview"] || 0)}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Offers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statusCounts["Offer"] || 0}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Upcoming Actions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {upcomingActions.length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Upcoming Actions */}
        {upcomingActions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upcoming Actions
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="space-y-2">
                {upcomingActions.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <span className="font-medium">{app.nextAction}</span>
                      <span className="text-gray-600 ml-2">
                        for {app.company}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(app.nextActionDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search applications by job title or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Under Review">Under Review</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="date">Latest First</option>
                <option value="company">Company</option>
                <option value="status">Status</option>
                <option value="priority">Priority</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {sortedApplications.length} of {mockApplications.length}{" "}
            applications
          </p>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {sortedApplications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>

        {sortedApplications.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No applications found
            </h3>
            <p className="text-gray-600 mb-4">
              Start tracking your job applications to stay organized
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Application
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};
