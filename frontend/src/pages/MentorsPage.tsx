import React, { useState } from "react";
import {
  Search,
  Filter,
  MapPin,
  Star,
  Calendar,
  Video,
  MessageCircle,
  Award,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Layout } from "../components/layout/Layout";

interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  avatar: string;
  rating: number;
  totalSessions: number;
  experience: number;
  expertise: string[];
  bio: string;
  hourlyRate: number;
  availability: "Available" | "Busy" | "Offline";
  responseTime: string;
  matchScore: number;
  languages: string[];
  education: string;
}

// Mock data for mentors
const mockMentors: Mentor[] = [
  {
    id: "1",
    name: "Sarah Chen",
    title: "Senior Product Manager",
    company: "Google",
    location: "Mountain View, CA",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
    rating: 4.9,
    totalSessions: 127,
    experience: 8,
    expertise: [
      "Product Strategy",
      "User Research",
      "Data Analysis",
      "Team Leadership",
    ],
    bio: "Passionate product leader with 8+ years at top tech companies. I help professionals transition into product management and advance their careers.",
    hourlyRate: 150,
    availability: "Available",
    responseTime: "~2 hours",
    matchScore: 95,
    languages: ["English", "Mandarin"],
    education: "MBA Stanford, BS Computer Science MIT",
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    title: "Principal Software Engineer",
    company: "Microsoft",
    location: "Seattle, WA",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
    rating: 4.8,
    totalSessions: 89,
    experience: 12,
    expertise: [
      "System Design",
      "Cloud Architecture",
      "JavaScript",
      "React",
      "Node.js",
    ],
    bio: "Full-stack engineer turned architect. I mentor developers on system design, coding best practices, and career growth in tech.",
    hourlyRate: 120,
    availability: "Available",
    responseTime: "~4 hours",
    matchScore: 92,
    languages: ["English", "Spanish"],
    education: "MS Computer Science Stanford",
  },
  {
    id: "3",
    name: "Emily Watson",
    title: "Head of Design",
    company: "Airbnb",
    location: "San Francisco, CA",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
    rating: 4.9,
    totalSessions: 156,
    experience: 10,
    expertise: [
      "UX Design",
      "Design Systems",
      "User Research",
      "Design Leadership",
    ],
    bio: "Design leader passionate about creating user-centered experiences. I help designers at all levels improve their craft and advance their careers.",
    hourlyRate: 180,
    availability: "Busy",
    responseTime: "~1 day",
    matchScore: 88,
    languages: ["English", "French"],
    education: "MFA Design RISD, BA Psychology UCLA",
  },
];

const MentorCard: React.FC<{ mentor: Mentor }> = ({ mentor }) => {
  const handleMessage = () => {
    // TODO: Implement messaging functionality
    console.log("Message mentor:", mentor.id);
  };

  const handleBookSession = () => {
    // TODO: Implement booking functionality
    console.log("Book session with:", mentor.id);
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <img
          src={mentor.avatar}
          alt={mentor.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-semibold text-gray-900">
              {mentor.name}
            </h3>
            <Badge variant="primary" className="text-xs">
              {mentor.matchScore}% Match
            </Badge>
          </div>
          <p className="text-lg text-gray-700 mb-1">{mentor.title}</p>
          <p className="text-gray-600 mb-2">{mentor.company}</p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {mentor.location}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              {mentor.rating} ({mentor.totalSessions} sessions)
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              {mentor.experience} years exp.
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge
            variant={
              mentor.availability === "Available"
                ? "success"
                : mentor.availability === "Busy"
                ? "warning"
                : "secondary"
            }
            className="text-xs"
          >
            {mentor.availability}
          </Badge>
          <p className="text-sm text-gray-500">
            Responds {mentor.responseTime}
          </p>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{mentor.bio}</p>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Expertise:</h4>
        <div className="flex flex-wrap gap-2">
          {mentor.expertise.map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            {mentor.education}
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-900">
          ${mentor.hourlyRate}/hour
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleMessage}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Message
        </Button>
        <Button onClick={handleBookSession} size="sm" className="flex-1">
          <Calendar className="h-4 w-4 mr-2" />
          Book Session
        </Button>
      </div>
    </Card>
  );
};

export const MentorsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterExpertise, setFilterExpertise] = useState<string>("all");
  const [filterAvailability, setFilterAvailability] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("match");

  const allExpertise = Array.from(
    new Set(mockMentors.flatMap((mentor) => mentor.expertise))
  );

  const filteredMentors = mockMentors.filter((mentor) => {
    const matchesSearch =
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.expertise.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesExpertise =
      filterExpertise === "all" || mentor.expertise.includes(filterExpertise);
    const matchesAvailability =
      filterAvailability === "all" ||
      mentor.availability === filterAvailability;

    return matchesSearch && matchesExpertise && matchesAvailability;
  });

  const sortedMentors = [...filteredMentors].sort((a, b) => {
    switch (sortBy) {
      case "match":
        return b.matchScore - a.matchScore;
      case "rating":
        return b.rating - a.rating;
      case "experience":
        return b.experience - a.experience;
      case "price_low":
        return a.hourlyRate - b.hourlyRate;
      case "price_high":
        return b.hourlyRate - a.hourlyRate;
      default:
        return 0;
    }
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Your Mentor
          </h1>
          <p className="text-gray-600">
            Connect with experienced professionals who can guide your career
            journey
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
                  placeholder="Search mentors by name, expertise, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterExpertise}
                onChange={(e) => setFilterExpertise(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Expertise</option>
                {allExpertise.map((expertise) => (
                  <option key={expertise} value={expertise}>
                    {expertise}
                  </option>
                ))}
              </select>
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Availability</option>
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="Offline">Offline</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="match">Best Match</option>
                <option value="rating">Highest Rated</option>
                <option value="experience">Most Experience</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Mentors */}
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 p-6 rounded-lg mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary-100 p-2 rounded-lg">
              <Award className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Top Rated Mentors
              </h3>
              <p className="text-gray-600">
                Highly recommended by our community
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Sarah Chen</h4>
              <p className="text-sm text-gray-600">
                4.9★ rating • 127 sessions
              </p>
              <p className="text-sm text-primary-600">
                Product Management Expert
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Emily Watson</h4>
              <p className="text-sm text-gray-600">
                4.9★ rating • 156 sessions
              </p>
              <p className="text-sm text-primary-600">Design Leadership</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                Marcus Rodriguez
              </h4>
              <p className="text-sm text-gray-600">4.8★ rating • 89 sessions</p>
              <p className="text-sm text-primary-600">Software Architecture</p>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {sortedMentors.length} of {mockMentors.length} mentors
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Save Search
            </Button>
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4 mr-2" />
              Group Sessions
            </Button>
          </div>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedMentors.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline">Load More Mentors</Button>
        </div>
      </div>
    </Layout>
  );
};
