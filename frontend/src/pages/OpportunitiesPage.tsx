import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Heart,
  Share2,
  Award,
  Calendar,
  ExternalLink,
  BookOpen,
  GraduationCap,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button, Card, CardBody } from "../components/ui";
import { Layout } from "../components/layout";
import { opportunitiesApi, type Opportunity } from "../api/opportunities";

const OpportunityCard: React.FC<{
  opportunity: Opportunity;
  onSave?: (id: number) => void;
}> = ({ opportunity, onSave }) => {
  const handleSave = () => {
    if (onSave) {
      onSave(opportunity.id);
    }
  };

  const handleApply = async () => {
    try {
      if (opportunity.application_url) {
        window.open(opportunity.application_url, "_blank");
      }
      // Mark as applied in the backend
      await opportunitiesApi.applyToOpportunity(opportunity.id, {});
    } catch (err) {
      console.error("Failed to apply to opportunity:", err);
    }
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log("Share:", opportunity.id);
  };
  
  const getTypeColor = (employmentType: string) => {
    switch (employmentType.toLowerCase()) {
      case "full-time":
        return "bg-success-100 text-success-800";
      case "part-time":
        return "bg-secondary-100 text-secondary-800";
      case "contract":
        return "bg-warning-100 text-warning-800";
      case "internship":
        return "bg-primary-100 text-primary-800";
      case "remote":
        return "bg-info-100 text-info-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  const getDaysUntilDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft =
    opportunity.days_remaining ||
    getDaysUntilDeadline(opportunity.application_deadline);

  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <CardBody className="p-8">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-2xl font-bold text-neutral-900 hover:text-primary-600 transition-colors">
                {opportunity.title}
              </h3>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(
                  opportunity.employment_type
                )}`}
              >
                {opportunity.employment_type}
              </div>
              {opportunity.remote_allowed && (
                <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  <MapPin className="w-4 h-4 mr-1" />
                  Remote
                </div>
              )}
            </div>

            <div className="flex items-center text-neutral-600 mb-4 gap-6">
              <div className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                {opportunity.company}
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {opportunity.location}
              </div>
              {(opportunity.salary_min || opportunity.salary_max) && (
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  {opportunity.salary_min && opportunity.salary_max
                    ? `${opportunity.salary_min.toLocaleString()} - ${opportunity.salary_max.toLocaleString()} ${
                        opportunity.salary_currency
                      }`
                    : opportunity.salary_min
                    ? `${opportunity.salary_min.toLocaleString()}+ ${
                        opportunity.salary_currency
                      }`
                    : opportunity.salary_max
                    ? `Up to ${opportunity.salary_max.toLocaleString()} ${
                        opportunity.salary_currency
                      }`
                    : ""}
                </div>
              )}
            </div>

            <p className="text-neutral-700 mb-4 leading-relaxed line-clamp-3">
              {opportunity.description}
            </p>

            {/* Requirements Preview */}
            {opportunity.requirements && (
              <div className="mb-4">
                <h4 className="font-semibold text-neutral-900 mb-2">
                  Requirements:
                </h4>
                <div className="text-sm text-neutral-600 line-clamp-3">
                  {opportunity.requirements}
                </div>
              </div>
            )}

            {/* Skills Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {opportunity.required_skills_list.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-neutral-500">
              <div className="flex items-center">
                <GraduationCap className="w-4 h-4 mr-1" />
                {opportunity.experience_level}
              </div>
              {daysLeft !== null && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"}
                </div>
              )}
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {new Date(opportunity.posted_date).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Match Score & Actions */}
          <div className="flex flex-col items-end gap-4 ml-8">
            {opportunity.match_score > 0 && (
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    opportunity.match_score >= 90
                      ? "text-success-600"
                      : opportunity.match_score >= 70
                      ? "text-warning-600"
                      : "text-neutral-600"
                  }`}
                >
                  {opportunity.match_score}%
                </div>
                <div className="text-xs text-neutral-500">Match</div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSave}
                  className={opportunity.is_saved ? "text-error-600" : ""}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      opportunity.is_saved ? "fill-current" : ""
                    }`}
                  />
                </Button>
                <Button variant="secondary" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                <Button size="sm" variant="secondary">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Learn More
                </Button>
                {opportunity.application_url && (
                  <Button
                    size="sm"
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                    onClick={handleApply}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Apply Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Deadline Warning */}
        {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
          <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg flex items-center">
            <Clock className="w-5 h-5 text-warning-600 mr-2" />
            <span className="text-warning-800 font-medium">
              Deadline approaching: Only {daysLeft} days left to apply!
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export const OpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("match");

  // Load opportunities on component mount
  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await opportunitiesApi.getOpportunities();
      setOpportunities(response.results || []);
    } catch (err) {
      console.error("Failed to load opportunities:", err);
      setError("Failed to load opportunities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Save/unsave opportunity
  const handleSaveOpportunity = async (opportunityId: number) => {
    try {
      const opportunity = opportunities.find((o) => o.id === opportunityId);
      if (!opportunity) return;

      if (opportunity.is_saved) {
        await opportunitiesApi.unsaveOpportunity(opportunityId);
      } else {
        await opportunitiesApi.saveOpportunity(opportunityId);
      }

      // Update local state
      setOpportunities(
        opportunities.map((opp) =>
          opp.id === opportunityId ? { ...opp, is_saved: !opp.is_saved } : opp
        )
      );
    } catch (err) {
      console.error("Failed to save/unsave opportunity:", err);
    }
  };

  const filteredOpportunities = opportunities.filter((opportunity) => {
    const matchesSearch =
      opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.required_skills_list.some((skill: string) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFilter =
      filterType === "all" ||
      opportunity.employment_type.toLowerCase() === filterType;

    return matchesSearch && matchesFilter;
  });

  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    switch (sortBy) {
      case "match":
        return b.match_score - a.match_score;
      case "date":
        return (
          new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime()
        );
      case "deadline":
        if (!a.application_deadline && !b.application_deadline) return 0;
        if (!a.application_deadline) return 1;
        if (!b.application_deadline) return -1;
        return (
          new Date(a.application_deadline).getTime() -
          new Date(b.application_deadline).getTime()
        );
      default:
        return 0;
    }
  });

  return (
    <Layout>
      <div className="min-h-screen bg-neutral-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Discover Your Next Opportunity
              </h1>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto">
                Explore scholarships, fellowships, and internships from top
                organizations worldwide. Your journey to global excellence
                starts here.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <Card className="mb-8">
            <CardBody className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Search opportunities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Type Filter */}
                <select
                  className="px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="scholarship">Scholarships</option>
                  <option value="fellowship">Fellowships</option>
                  <option value="internship">Internships</option>
                  <option value="job">Jobs</option>
                </select>

                {/* Sort */}
                <select
                  className="px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="match">Best Match</option>
                  <option value="deadline">Deadline</option>
                  <option value="date">Most Recent</option>
                </select>

                <Button variant="secondary" className="flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* AI Recommendations */}
          <Card className="mb-8 bg-gradient-to-r from-primary-50 to-secondary-50">
            <CardBody className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <Star className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">
                    AI-Powered Recommendations
                  </h3>
                  <p className="text-neutral-600">
                    Based on your profile and preferences
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-neutral-900 mb-2 flex items-center">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Academic Match
                  </h4>
                  <p className="text-sm text-neutral-600">
                    92% alignment with your academic profile
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-neutral-900 mb-2 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Funding Range
                  </h4>
                  <p className="text-sm text-neutral-600">
                    $50K - $100K based on your field
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-neutral-900 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Location Match
                  </h4>
                  <p className="text-sm text-neutral-600">
                    International and US opportunities prioritized
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Results Summary */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">
              {sortedOpportunities.length} opportunities found
            </h2>
            <div className="text-sm text-neutral-600">
              Showing personalized matches based on your profile
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <Card>
              <CardBody className="text-center py-16">
                <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-12 h-12 text-neutral-400 animate-spin" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Loading Opportunities
                </h3>
                <p className="text-neutral-600 mb-8">
                  Please wait while we fetch the latest opportunities for you...
                </p>
              </CardBody>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card>
              <CardBody className="text-center py-16">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-12 h-12 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Failed to Load Opportunities
                </h3>
                <p className="text-neutral-600 mb-8">{error}</p>
                <Button
                  onClick={loadOpportunities}
                  className="bg-primary-600 text-white hover:bg-primary-700"
                >
                  Try Again
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Opportunities List */}
          {!loading && !error && (
            <div className="space-y-6">
              {sortedOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onSave={handleSaveOpportunity}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && sortedOpportunities.length === 0 && (
            <Card>
              <CardBody className="text-center py-16">
                <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  No opportunities found
                </h3>
                <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                  Try adjusting your search criteria or check back later for new
                  opportunities.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                  }}
                  variant="secondary"
                >
                  Clear Filters
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Load More */}
          {sortedOpportunities.length > 0 && (
            <div className="text-center mt-8">
              <Button variant="secondary">Load More Opportunities</Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
