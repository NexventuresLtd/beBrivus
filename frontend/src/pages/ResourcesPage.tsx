import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  BookOpen,
  FileText,
  Video,
  Image,
  File,
  ExternalLink,
  Heart,
  Share2,
  Clock,
  User,
  Calendar,
  Tag,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Star,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button, Card, CardBody } from "../components/ui";
import { Layout } from "../components/layout";
import {
  resourcesApi,
  type Resource,
  type ResourceCategory,
} from "../api/resources";

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load resources and categories on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [resourcesData, categoriesData] = await Promise.all([
        resourcesApi.getResources(),
        resourcesApi.getCategories(),
      ]);
      setResources(resourcesData.results || []);
      setCategories(categoriesData.results || []);
    } catch (err) {
      console.error("Failed to load resources:", err);
      setError("Failed to load resources. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle bookmark toggle
  const handleBookmark = async (resourceId: number) => {
    try {
      const resource = resources.find((r) => r.id === resourceId);
      if (!resource) return;

      if (resource.is_bookmarked) {
        await resourcesApi.unbookmarkResource(resourceId);
      } else {
        await resourcesApi.bookmarkResource(resourceId);
      }

      // Update local state
      setResources(
        resources.map((r) =>
          r.id === resourceId ? { ...r, is_bookmarked: !r.is_bookmarked } : r
        )
      );
    } catch (err) {
      console.error("Failed to bookmark resource:", err);
    }
  };

  // Filter and sort resources
  const filteredResources = resources
    .filter((resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some((tag: string) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesCategory =
        !selectedCategory ||
        selectedCategory === "All Categories" ||
        resource.category.slug === selectedCategory;
      const matchesType =
        !selectedType || resource.resource_type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "newest":
          comparison =
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
        case "oldest":
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "popular":
          comparison = b.view_count - a.view_count;
          break;
        case "rating":
          comparison = b.average_rating - a.average_rating;
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "desc" ? comparison : -comparison;
    });

  const getFileIcon = (resourceType: string) => {
    switch (resourceType.toLowerCase()) {
      case "pdf":
        return <FileText className="w-6 h-6 text-error-500" />;
      case "video":
        return <Video className="w-6 h-6 text-primary-500" />;
      case "image":
        return <Image className="w-6 h-6 text-secondary-500" />;
      case "document":
        return <File className="w-6 h-6 text-blue-500" />;
      case "link":
        return <ExternalLink className="w-6 h-6 text-success-500" />;
      case "course":
        return <BookOpen className="w-6 h-6 text-warning-500" />;
      default:
        return <File className="w-6 h-6 text-neutral-500" />;
    }
  };

  const getTypeColor = (resourceType: string) => {
    switch (resourceType.toLowerCase()) {
      case "pdf":
        return "bg-error-100 text-error-800";
      case "video":
        return "bg-primary-100 text-primary-800";
      case "image":
        return "bg-secondary-100 text-secondary-800";
      case "document":
        return "bg-blue-100 text-blue-800";
      case "link":
        return "bg-success-100 text-success-800";
      case "course":
        return "bg-warning-100 text-warning-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  const toggleSave = (resourceId: number) => {
    // In real app, this would make an API call
    console.log("Toggle save for resource:", resourceId);
  };

  const handleDownload = (resource: Resource) => {
    if (resource.downloadUrl) {
      // In real app, this would track the download and increment counter
      window.open(resource.downloadUrl, "_blank");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => (
    <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
      <CardBody className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">{getFileIcon(resource.type)}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-neutral-900 truncate group-hover:text-primary-600 transition-colors">
                {resource.title}
              </h3>
              {resource.isFeatured && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mb-3 text-sm text-neutral-600">
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                  resource.type
                )}`}
              >
                {resource.type.toUpperCase()}
              </div>
              <span>{resource.category}</span>
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {resource.author}
              </div>
            </div>

            <p className="text-sm text-neutral-700 mb-4 line-clamp-2">
              {resource.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-neutral-500">
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {resource.views}
                </div>
                {resource.downloads > 0 && (
                  <div className="flex items-center">
                    <Download className="w-4 h-4 mr-1" />
                    {resource.downloads}
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(resource.uploadDate)}
                </div>
                {resource.fileSize && <span>{resource.fileSize}</span>}
                {resource.duration && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {resource.duration}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => toggleSave(resource.id)}
                  className={resource.isSaved ? "text-error-600" : ""}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      resource.isSaved ? "fill-current" : ""
                    }`}
                  />
                </Button>
                <Button variant="secondary" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
                {resource.downloadUrl ? (
                  <Button size="sm" onClick={() => handleDownload(resource)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => window.open(resource.url, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  const ResourceListItem: React.FC<{ resource: Resource }> = ({ resource }) => (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardBody className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-shrink-0">{getFileIcon(resource.type)}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-neutral-900 hover:text-primary-600 transition-colors">
                  {resource.title}
                </h3>
                {resource.isFeatured && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </span>
                )}
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                    resource.type
                  )}`}
                >
                  {resource.type.toUpperCase()}
                </div>
              </div>

              <p className="text-sm text-neutral-700 mt-1 line-clamp-1">
                {resource.description}
              </p>

              <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                <span>{resource.category}</span>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {resource.author}
                </div>
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {resource.views}
                </div>
                {resource.downloads > 0 && (
                  <div className="flex items-center">
                    <Download className="w-4 h-4 mr-1" />
                    {resource.downloads}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toggleSave(resource.id)}
              className={resource.isSaved ? "text-error-600" : ""}
            >
              <Heart
                className={`w-4 h-4 ${resource.isSaved ? "fill-current" : ""}`}
              />
            </Button>
            <Button variant="secondary" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
            {resource.downloadUrl ? (
              <Button size="sm" onClick={() => handleDownload(resource)}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => window.open(resource.url, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-neutral-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary-600 to-primary-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Resource Library
              </h1>
              <p className="text-xl text-secondary-100 max-w-3xl mx-auto">
                Access comprehensive guides, tools, and materials to support
                your academic and career journey. Everything you need to
                succeed, all in one place.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters and Controls */}
          <Card className="mb-8">
            <CardBody className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Category Filter */}
                <select
                  className="px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category === "All Categories" ? "" : category}
                    >
                      {category}
                    </option>
                  ))}
                </select>

                {/* Type Filter */}
                <select
                  className="px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="link">Link</option>
                  <option value="course">Course</option>
                  <option value="image">Image</option>
                </select>

                {/* Sort */}
                <select
                  className="px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="downloads">Most Downloaded</option>
                  <option value="rating">Highest Rated</option>
                  <option value="title">Alphabetical</option>
                </select>
              </div>

              {/* View Controls */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Button variant="secondary" className="flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>

                  {/* Upload Button for Admin Users */}
                  <Button className="flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Upload Resource
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={sortOrder === "asc" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                  >
                    {sortOrder === "asc" ? (
                      <SortAsc className="w-4 h-4" />
                    ) : (
                      <SortDesc className="w-4 h-4" />
                    )}
                  </Button>

                  <div className="flex border border-neutral-300 rounded-lg overflow-hidden">
                    <Button
                      variant={viewMode === "grid" ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-none border-0"
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-none border-0 border-l border-neutral-300"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Results Summary */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">
              {filteredResources.length} resources found
            </h2>
            <div className="text-sm text-neutral-600">
              Showing {viewMode} view • Sorted by {sortBy}
            </div>
          </div>

          {/* Resources Display */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResources.map((resource) => (
                <ResourceListItem key={resource.id} resource={resource} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredResources.length === 0 && (
            <Card>
              <CardBody className="text-center py-16">
                <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  No resources found
                </h3>
                <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                  Try adjusting your search criteria or browse different
                  categories.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                    setSelectedType("");
                  }}
                  variant="secondary"
                >
                  Clear Filters
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};
