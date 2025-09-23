import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, resourcesApi } from "../api";
import { Header } from "../components/layout/Header";

interface Resource {
  id: number;
  title: string;
  slug: string;
  description: string;
  resource_type: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  difficulty_level: string;
  thumbnail: string;
  author: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  is_featured: boolean;
  is_premium: boolean;
  view_count: number;
  download_count: number;
  estimated_duration_minutes: number;
  created_at: string;
  tags: string[];
  average_rating: number;
  rating_count: number;
  is_bookmarked: boolean;
  user_progress?: {
    status: string;
    progress_percentage: number;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  resource_count: number;
}

export const ResourcesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categoriesData } = useQuery<{ results: Category[] }>({
    queryKey: ["resource-categories"],
    queryFn: () =>
      api.get("/resources/categories/").then((res: any) => res.data),
  });

  const categories = categoriesData?.results || [];

  // Fetch resources with filters
  const {
    data: resourcesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "resources",
      selectedCategory,
      selectedType,
      searchQuery,
      difficultyFilter,
    ],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedType) params.append("resource_type", selectedType);
      if (searchQuery) params.append("q", searchQuery);
      if (difficultyFilter) params.append("difficulty_level", difficultyFilter);

      return api
        .get(`/resources/?${params.toString()}`)
        .then((res: any) => res.data);
    },
  });

  // Fetch featured resources
  const { data: featuredResources = [] } = useQuery<Resource[]>({
    queryKey: ["featured-resources"],
    queryFn: () => api.get("/resources/featured/").then((res: any) => res.data),
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: (resourceId: number) =>
      api.post(`/resources/${resourceId}/bookmark/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });

  const resources = resourcesData?.results || [];

  const resourceTypes = [
    { value: "", label: "All Types" },
    { value: "guide", label: "Guides" },
    { value: "template", label: "Templates" },
    { value: "workshop", label: "Workshops" },
    { value: "video", label: "Videos" },
    { value: "article", label: "Articles" },
    { value: "tool", label: "Tools" },
    { value: "checklist", label: "Checklists" },
    { value: "webinar", label: "Webinars" },
  ];

  const difficultyLevels = [
    { value: "", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-success-100 text-success-800";
      case "intermediate":
        return "bg-warning-100 text-warning-800";
      case "advanced":
        return "bg-error-100 text-error-800";
      default:
        return "bg-secondary-100 text-secondary-800";
    }
  };

  const getResourceTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      guide: "📚",
      template: "📄",
      workshop: "🎓",
      video: "🎥",
      article: "📝",
      tool: "🔧",
      checklist: "✅",
      webinar: "💻",
    };
    return icons[type] || "📄";
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Resources Hub
          </h1>
          <p className="text-lg text-secondary-600 max-w-3xl">
            Access our comprehensive library of guides, templates, workshops,
            and tools to accelerate your job search and career development.
          </p>
        </div>

        {/* Featured Resources */}
        {featuredResources.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">
              Featured Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredResources.slice(0, 3).map((resource) => (
                <div
                  key={resource.id}
                  className="card hover:shadow-lg transition-shadow"
                >
                  {resource.thumbnail && (
                    <img
                      src={resource.thumbnail}
                      alt={resource.title}
                      className="w-full h-48 object-cover rounded-t-xl"
                    />
                  )}
                  <div className="card-body">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {getResourceTypeIcon(resource.resource_type)}
                      </span>
                      <span
                        className={`badge ${getDifficultyColor(
                          resource.difficulty_level
                        )}`}
                      >
                        {resource.difficulty_level}
                      </span>
                      <span className="badge badge-primary">Featured</span>
                    </div>
                    <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                      {resource.title}
                    </h3>
                    <p className="text-secondary-600 mb-4 line-clamp-2">
                      {resource.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-secondary-500 mb-4">
                      <span>By {resource.author.username}</span>
                      {resource.estimated_duration_minutes && (
                        <span>{resource.estimated_duration_minutes} min</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-secondary-500">
                        <span>
                          ⭐ {resource.average_rating.toFixed(1)} (
                          {resource.rating_count})
                        </span>
                        <span>👁️ {resource.view_count}</span>
                      </div>
                      <button
                        onClick={() => bookmarkMutation.mutate(resource.id)}
                        className={`btn btn-sm ${
                          resource.is_bookmarked
                            ? "btn-primary"
                            : "btn-secondary"
                        }`}
                      >
                        {resource.is_bookmarked ? "🔖 Saved" : "🔖 Save"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card mb-8">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="label">Search Resources</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Search by title, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="label">Category</label>
                <select
                  className="input"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.resource_count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="label">Resource Type</label>
                <select
                  className="input"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  {resourceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="label">Difficulty Level</label>
                <select
                  className="input"
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                >
                  {difficultyLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-error-600 text-lg">Failed to load resources</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource: Resource) => (
              <div
                key={resource.id}
                className="card hover:shadow-lg transition-shadow"
              >
                {resource.thumbnail && (
                  <img
                    src={resource.thumbnail}
                    alt={resource.title}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                )}
                <div className="card-body">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {getResourceTypeIcon(resource.resource_type)}
                    </span>
                    <span
                      className={`badge ${getDifficultyColor(
                        resource.difficulty_level
                      )}`}
                    >
                      {resource.difficulty_level}
                    </span>
                    {resource.is_premium && (
                      <span className="badge bg-warning-100 text-warning-800">
                        Premium
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-secondary-600 mb-4 line-clamp-2">
                    {resource.description}
                  </p>

                  {/* Progress Bar if user has progress */}
                  {resource.user_progress && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-secondary-600 mb-1">
                        <span>Progress</span>
                        <span>
                          {resource.user_progress.progress_percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-secondary-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${resource.user_progress.progress_percentage}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-secondary-500 mb-4">
                    <span>By {resource.author.username}</span>
                    {resource.estimated_duration_minutes && (
                      <span>{resource.estimated_duration_minutes} min</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-secondary-500">
                      <span>
                        ⭐ {resource.average_rating.toFixed(1)} (
                        {resource.rating_count})
                      </span>
                      <span>👁️ {resource.view_count}</span>
                    </div>
                    <button
                      onClick={() => bookmarkMutation.mutate(resource.id)}
                      className={`btn btn-sm ${
                        resource.is_bookmarked ? "btn-primary" : "btn-secondary"
                      }`}
                    >
                      {resource.is_bookmarked ? "🔖 Saved" : "🔖 Save"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && resources.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              No resources found
            </h3>
            <p className="text-secondary-600 mb-6">
              Try adjusting your filters or search terms to find what you're
              looking for.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
