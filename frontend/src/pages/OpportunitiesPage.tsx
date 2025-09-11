import React, { useState } from "react";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Star,
  Heart,
  Share2,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Layout } from "../components/layout/Layout";

interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship" | "Remote";
  salary: string;
  description: string;
  requirements: string[];
  skills: string[];
  postedDate: string;
  deadline: string;
  matchScore: number;
  isSaved: boolean;
  isApplied: boolean;
}

// Mock data for opportunities
const mockOpportunities: Opportunity[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120,000 - $150,000",
    description:
      "We are looking for a Senior Frontend Developer to join our growing team...",
    requirements: [
      "5+ years experience",
      "React/TypeScript",
      "Leadership skills",
    ],
    skills: ["React", "TypeScript", "JavaScript", "CSS", "Node.js"],
    postedDate: "2024-01-15",
    deadline: "2024-02-15",
    matchScore: 92,
    isSaved: false,
    isApplied: false,
  },
  {
    id: "2",
    title: "Product Manager",
    company: "StartupXYZ",
    location: "New York, NY",
    type: "Full-time",
    salary: "$100,000 - $130,000",
    description: "Join our product team to drive innovation and growth...",
    requirements: ["3+ years PM experience", "Agile/Scrum", "Data analysis"],
    skills: ["Product Management", "Analytics", "User Research", "Agile"],
    postedDate: "2024-01-14",
    deadline: "2024-02-10",
    matchScore: 85,
    isSaved: true,
    isApplied: false,
  },
  {
    id: "3",
    title: "UX Designer",
    company: "Design Studio",
    location: "Remote",
    type: "Contract",
    salary: "$80 - $120/hour",
    description: "Create beautiful and intuitive user experiences...",
    requirements: ["Portfolio required", "Figma/Sketch", "3+ years experience"],
    skills: ["UX Design", "UI Design", "Figma", "User Research", "Prototyping"],
    postedDate: "2024-01-13",
    deadline: "2024-02-05",
    matchScore: 78,
    isSaved: false,
    isApplied: true,
  },
];

const OpportunityCard: React.FC<{ opportunity: Opportunity }> = ({
  opportunity,
}) => {
  const [isSaved, setIsSaved] = useState(opportunity.isSaved);

  const handleSave = () => {
    setIsSaved(!isSaved);
    // TODO: Implement save functionality
  };

  const handleApply = () => {
    // TODO: Implement apply functionality
    console.log("Apply to:", opportunity.id);
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log("Share:", opportunity.id);
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {opportunity.title}
            </h3>
            <Badge variant="primary" className="text-xs">
              {opportunity.matchScore}% Match
            </Badge>
          </div>
          <p className="text-lg text-gray-700 mb-1">{opportunity.company}</p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {opportunity.location}
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              {opportunity.type}
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {opportunity.salary}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className={isSaved ? "text-red-600" : "text-gray-400"}
          >
            <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">
        {opportunity.description}
      </p>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Required Skills:
        </h4>
        <div className="flex flex-wrap gap-2">
          {opportunity.skills.map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Posted {new Date(opportunity.postedDate).toLocaleDateString()}
          </div>
          <div>
            Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
          </div>
        </div>
        <div className="flex gap-2">
          {opportunity.isApplied ? (
            <Badge variant="success">Applied</Badge>
          ) : (
            <Button onClick={handleApply} size="sm">
              Apply Now
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export const OpportunitiesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("match");

  const filteredOpportunities = mockOpportunities.filter((opportunity) => {
    const matchesSearch =
      opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFilter =
      filterType === "all" || opportunity.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    switch (sortBy) {
      case "match":
        return b.matchScore - a.matchScore;
      case "date":
        return (
          new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        );
      case "deadline":
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      default:
        return 0;
    }
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Opportunities
          </h1>
          <p className="text-gray-600">
            Find the perfect opportunities tailored to your skills and
            preferences
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search opportunities, companies, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="match">Best Match</option>
                <option value="date">Most Recent</option>
                <option value="deadline">Deadline</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 p-6 rounded-lg mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary-100 p-2 rounded-lg">
              <Star className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                AI-Powered Recommendations
              </h3>
              <p className="text-gray-600">
                Based on your profile and preferences
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Skills Match</h4>
              <p className="text-sm text-gray-600">
                92% of your skills align with top opportunities
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Salary Range</h4>
              <p className="text-sm text-gray-600">
                $110K - $140K based on your experience
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                Location Preference
              </h4>
              <p className="text-sm text-gray-600">
                Remote and San Francisco opportunities prioritized
              </p>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {sortedOpportunities.length} of {mockOpportunities.length}{" "}
            opportunities
          </p>
          <Button variant="outline" size="sm">
            Save Search
          </Button>
        </div>

        {/* Opportunities List */}
        <div className="space-y-6">
          {sortedOpportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline">Load More Opportunities</Button>
        </div>
      </div>
    </Layout>
  );
};
