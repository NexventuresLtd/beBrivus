import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download,
  FileText,
  Video,
  Image,
  File,
  Calendar,
  User,
} from "lucide-react";
import { Card, CardBody, Button } from "../../components/ui";

interface Resource {
  id: number;
  title: string;
  type: "template" | "guide" | "tutorial" | "video" | "document";
  category: string;
  description: string;
  fileUrl?: string;
  fileSize?: string;
  downloadCount: number;
  views: number;
  status: "published" | "draft" | "archived";
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export const ResourceManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Mock data - replace with actual API call
  const resources: Resource[] = [
    {
      id: 1,
      title: "Personal Statement Writing Guide",
      type: "guide",
      category: "Application Essays",
      description:
        "Comprehensive guide on writing compelling personal statements for scholarships and fellowships.",
      fileUrl: "/files/personal-statement-guide.pdf",
      fileSize: "2.3 MB",
      downloadCount: 1234,
      views: 3456,
      status: "published",
      author: { name: "Dr. Sarah Johnson" },
      createdAt: "2025-01-15",
      updatedAt: "2025-09-20",
      tags: ["writing", "essays", "applications"],
    },
    {
      id: 2,
      title: "CV Template for Academic Positions",
      type: "template",
      category: "CV & Resume",
      description:
        "Professional CV template specifically designed for academic and research positions.",
      fileUrl: "/files/academic-cv-template.docx",
      fileSize: "1.1 MB",
      downloadCount: 892,
      views: 2134,
      status: "published",
      author: { name: "Prof. Michael Chen" },
      createdAt: "2025-02-01",
      updatedAt: "2025-09-18",
      tags: ["cv", "academic", "template"],
    },
    {
      id: 3,
      title: "Interview Preparation Video Series",
      type: "video",
      category: "Interview Skills",
      description:
        "5-part video series covering common scholarship interview questions and best practices.",
      fileUrl: "/videos/interview-prep-series.mp4",
      fileSize: "456 MB",
      downloadCount: 567,
      views: 1890,
      status: "published",
      author: { name: "Emma Rodriguez" },
      createdAt: "2025-02-15",
      updatedAt: "2025-09-22",
      tags: ["interview", "video", "preparation"],
    },
    {
      id: 4,
      title: "Research Proposal Template",
      type: "template",
      category: "Research Documents",
      description:
        "Template for creating structured research proposals for graduate fellowships.",
      fileUrl: "/files/research-proposal-template.docx",
      fileSize: "850 KB",
      downloadCount: 445,
      views: 967,
      status: "draft",
      author: { name: "Dr. Ahmed Hassan" },
      createdAt: "2025-09-25",
      updatedAt: "2025-09-26",
      tags: ["research", "proposal", "template"],
    },
  ];

  const categories = [
    "Application Essays",
    "CV & Resume",
    "Interview Skills",
    "Research Documents",
    "Financial Planning",
    "Study Abroad",
    "Career Development",
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "template":
        return FileText;
      case "guide":
        return FileText;
      case "tutorial":
        return FileText;
      case "video":
        return Video;
      case "document":
        return File;
      default:
        return File;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "template":
        return "bg-primary-100 text-primary-800";
      case "guide":
        return "bg-secondary-100 text-secondary-800";
      case "tutorial":
        return "bg-warning-100 text-warning-800";
      case "video":
        return "bg-error-100 text-error-800";
      case "document":
        return "bg-success-100 text-success-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-success-100 text-success-800";
      case "draft":
        return "bg-warning-100 text-warning-800";
      case "archived":
        return "bg-neutral-100 text-neutral-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || resource.type === selectedType;
    const matchesCategory =
      !selectedCategory || resource.category === selectedCategory;
    const matchesStatus = !selectedStatus || resource.status === selectedStatus;

    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Resource Management
          </h1>
          <p className="text-neutral-600 mt-1">
            Manage templates, guides, tutorials, and other educational resources
          </p>
        </div>
        <Link to="/admin/resources/new">
          <Button className="bg-primary-600 hover:bg-primary-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Resource
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Resources</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {resources.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Downloads</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {resources
                    .reduce((sum, r) => sum + r.downloadCount, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-success-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Views</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {resources
                    .reduce((sum, r) => sum + r.views, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-warning-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Published</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {resources.filter((r) => r.status === "published").length}
                </p>
              </div>
              <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-secondary-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-neutral-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <select
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="template">Templates</option>
              <option value="guide">Guides</option>
              <option value="tutorial">Tutorials</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>

            {/* Category Filter */}
            <select
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <Button variant="secondary" className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Resources List */}
      <div className="space-y-4">
        {filteredResources.map((resource) => {
          const TypeIcon = getTypeIcon(resource.type);

          return (
            <Card
              key={resource.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardBody className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* File Icon */}
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(
                        resource.type
                      )}`}
                    >
                      <TypeIcon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900 truncate">
                          {resource.title}
                        </h3>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                            resource.type
                          )}`}
                        >
                          {resource.type.charAt(0).toUpperCase() +
                            resource.type.slice(1)}
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            resource.status
                          )}`}
                        >
                          {resource.status.charAt(0).toUpperCase() +
                            resource.status.slice(1)}
                        </div>
                      </div>

                      <p className="text-neutral-600 mb-3 line-clamp-2">
                        {resource.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 mb-3">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {resource.author.name}
                        </div>
                        <div>Category: {resource.category}</div>
                        {resource.fileSize && (
                          <div>Size: {resource.fileSize}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-neutral-500">
                        <div className="flex items-center">
                          <Download className="w-4 h-4 mr-1" />
                          {resource.downloadCount.toLocaleString()} downloads
                        </div>
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {resource.views.toLocaleString()} views
                        </div>
                        <div>
                          Updated:{" "}
                          {new Date(resource.updatedAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Tags */}
                      {resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {resource.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {resource.fileUrl && (
                      <Button variant="secondary" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                    <Link to={`/admin/resources/${resource.id}`}>
                      <Button variant="secondary" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Link to={`/admin/resources/${resource.id}/edit`}>
                      <Button variant="secondary" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <div className="relative">
                      <Button variant="secondary" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <Card>
          <CardBody className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No resources found
            </h3>
            <p className="text-neutral-600 mb-6">
              Try adjusting your search criteria or create a new resource.
            </p>
            <Link to="/admin/resources/new">
              <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add First Resource
              </Button>
            </Link>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
