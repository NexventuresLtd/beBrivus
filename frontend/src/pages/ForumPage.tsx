import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { Header } from "../components/layout/Header";
import { Link } from "react-router-dom";

interface Discussion {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: {
    id: number;
    name: string;
    slug: string;
    icon: string;
    color: string;
  };
  author: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  like_count: number;
  last_activity: string;
  tags: string[];
  user_liked: boolean;
  ai_summary?: string;
  created_at: string;
}

interface ForumCategory {
  id: number;
  name: string;
  description: string;
  slug: string;
  icon: string;
  color: string;
  discussion_count: number;
  latest_discussion?: Discussion;
}

export const ForumPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("-last_activity");
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categoriesData } = useQuery<{ results: ForumCategory[] }>({
    queryKey: ["forum-categories"],
    queryFn: () => api.get("/forum/categories/").then((res: any) => res.data),
  });

  const categories = categoriesData?.results || [];

  // Fetch discussions
  const {
    data: discussionsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["forum-discussions", selectedCategory, searchQuery, sortBy],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (searchQuery) params.append("q", searchQuery);
      params.append("ordering", sortBy);

      return api
        .get(`/forum/discussions/?${params.toString()}`)
        .then((res: any) => res.data);
    },
  });

  // Like discussion mutation
  const likeMutation = useMutation({
    mutationFn: (discussionId: number) =>
      api.post(`/forum/discussions/${discussionId}/like/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-discussions"] });
    },
  });

  const discussions = discussionsData?.results || [];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-secondary-900 mb-4">
              Community Forum
            </h1>
            <p className="text-lg text-secondary-600 max-w-3xl">
              Connect with other job seekers, share experiences, ask questions,
              and get support from the community.
            </p>
          </div>
          <Link to="/forum/new" className="btn btn-primary">
            📝 Start Discussion
          </Link>
        </div>

        {/* Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category) => (
            <div
              key={category.id}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedCategory(category.id.toString())}
            >
              <div className="card-body">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{
                      backgroundColor: category.color + "20",
                      color: category.color,
                    }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-secondary-900">
                      {category.name}
                    </h3>
                    <p className="text-sm text-secondary-600">
                      {category.discussion_count} discussions
                    </p>
                  </div>
                </div>
                <p className="text-secondary-600 mb-4">
                  {category.description}
                </p>
                {category.latest_discussion && (
                  <div className="text-sm text-secondary-500">
                    Latest:{" "}
                    <span className="text-secondary-700 font-medium">
                      {category.latest_discussion.title}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="card mb-8">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="label">Search Discussions</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Search by title, content..."
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
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="label">Sort By</label>
                <select
                  className="input"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="-last_activity">Recent Activity</option>
                  <option value="-created_at">Newest</option>
                  <option value="created_at">Oldest</option>
                  <option value="-like_count">Most Liked</option>
                  <option value="-reply_count">Most Replies</option>
                  <option value="-view_count">Most Viewed</option>
                </select>
              </div>
            </div>

            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory("")}
                className="btn btn-secondary btn-sm mt-4"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* Discussions List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-error-600 text-lg">Failed to load discussions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {discussions.map((discussion: Discussion) => (
              <div
                key={discussion.id}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    {/* Discussion Icon/Category */}
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                      style={{
                        backgroundColor: discussion.category.color + "20",
                        color: discussion.category.color,
                      }}
                    >
                      {discussion.category.icon}
                    </div>

                    {/* Discussion Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Title and Badges */}
                          <div className="flex items-center gap-2 mb-2">
                            {discussion.is_pinned && (
                              <span className="badge bg-warning-100 text-warning-800">
                                📌 Pinned
                              </span>
                            )}
                            {discussion.is_locked && (
                              <span className="badge bg-error-100 text-error-800">
                                🔒 Locked
                              </span>
                            )}
                            <span
                              className="badge"
                              style={{
                                backgroundColor:
                                  discussion.category.color + "20",
                                color: discussion.category.color,
                              }}
                            >
                              {discussion.category.name}
                            </span>
                          </div>

                          <h3 className="text-xl font-semibold text-secondary-900 mb-2 hover:text-primary-600">
                            <Link to={`/forum/discussion/${discussion.slug}`}>
                              {discussion.title}
                            </Link>
                          </h3>

                          <p className="text-secondary-600 mb-3 line-clamp-2">
                            {discussion.content
                              .replace(/<[^>]*>/g, "")
                              .substring(0, 150)}
                            ...
                          </p>

                          {/* Tags */}
                          {discussion.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {discussion.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="badge badge-secondary text-xs"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {discussion.tags.length > 3 && (
                                <span className="text-xs text-secondary-500">
                                  +{discussion.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* AI Summary */}
                          {discussion.ai_summary && (
                            <div className="bg-primary-50 border-l-4 border-primary-500 p-3 mb-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-primary-600 font-medium text-sm">
                                  🤖 AI Summary
                                </span>
                              </div>
                              <p className="text-sm text-primary-800">
                                {discussion.ai_summary}
                              </p>
                            </div>
                          )}

                          {/* Author and Stats */}
                          <div className="flex items-center justify-between text-sm text-secondary-500">
                            <div className="flex items-center gap-4">
                              <span>
                                By{" "}
                                <span className="text-secondary-700 font-medium">
                                  {discussion.author.first_name ||
                                    discussion.author.username}
                                </span>
                              </span>
                              <span>
                                {formatTimeAgo(discussion.created_at)}
                              </span>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                💬 {discussion.reply_count}
                              </span>
                              <span className="flex items-center gap-1">
                                👁️ {discussion.view_count}
                              </span>
                              <button
                                onClick={() =>
                                  likeMutation.mutate(discussion.id)
                                }
                                className={`flex items-center gap-1 hover:text-primary-600 transition-colors ${
                                  discussion.user_liked
                                    ? "text-primary-600"
                                    : ""
                                }`}
                              >
                                {discussion.user_liked ? "❤️" : "🤍"}{" "}
                                {discussion.like_count}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && discussions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              No discussions found
            </h3>
            <p className="text-secondary-600 mb-6">
              {searchQuery || selectedCategory
                ? "Try adjusting your filters or search terms."
                : "Be the first to start a discussion in the community!"}
            </p>
            <Link to="/forum/new" className="btn btn-primary">
              Start New Discussion
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};
