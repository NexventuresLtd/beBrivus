import React from "react";
import {
  Search,
  Users,
  Target,
  BookOpen,
  BarChart3,
  MessageSquare,
  Plus,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Layout } from "../components/layout";
import { Button, Card, CardHeader, CardBody, Badge } from "../components/ui";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-secondary-600 mt-2">
            Here's what's happening with your opportunities today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardBody>
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Search className="w-6 h-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">
                    New Opportunities
                  </p>
                  <p className="text-2xl font-bold text-secondary-900">12</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <Clock className="w-6 h-6 text-warning-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">
                    Pending Applications
                  </p>
                  <p className="text-2xl font-bold text-secondary-900">5</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center">
                <div className="p-2 bg-success-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold text-secondary-900">78%</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center">
                <div className="p-2 bg-error-100 rounded-lg">
                  <Star className="w-6 h-6 text-error-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">
                    Achievements
                  </p>
                  <p className="text-2xl font-bold text-secondary-900">3</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Opportunities */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-secondary-900">
                    Recommended for You
                  </h2>
                  <Button size="sm" variant="secondary">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="flex items-start space-x-4 p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-secondary-900">
                          Google Summer Internship Program
                        </h3>
                        <p className="text-sm text-secondary-600 mt-1">
                          Software Engineering Internship at Google
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <Badge variant="primary">Technology</Badge>
                          <Badge variant="success">Remote</Badge>
                          <span className="text-sm text-secondary-500">
                            Due in 5 days
                          </span>
                        </div>
                      </div>
                      <Button size="sm">Apply</Button>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-secondary-900">
                  Quick Actions
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="secondary">
                    <Search className="w-4 h-4 mr-2" />
                    Find Opportunities
                  </Button>
                  <Button className="w-full justify-start" variant="secondary">
                    <Users className="w-4 h-4 mr-2" />
                    Find a Mentor
                  </Button>
                  <Button className="w-full justify-start" variant="secondary">
                    <Target className="w-4 h-4 mr-2" />
                    Track Applications
                  </Button>
                  <Button className="w-full justify-start" variant="secondary">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Resources
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-secondary-900">
                  Recent Activity
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="text-secondary-600">
                      Applied to{" "}
                      <span className="font-medium text-secondary-900">
                        Microsoft Internship
                      </span>
                    </p>
                    <p className="text-xs text-secondary-500">2 hours ago</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-secondary-600">
                      Saved{" "}
                      <span className="font-medium text-secondary-900">
                        Tesla Engineering Role
                      </span>
                    </p>
                    <p className="text-xs text-secondary-500">1 day ago</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-secondary-600">
                      Completed profile setup
                    </p>
                    <p className="text-xs text-secondary-500">3 days ago</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Profile Completion */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-secondary-900">
                  Profile Completion
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Profile Progress</span>
                    <span className="font-medium">75%</span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                  <div className="text-sm text-secondary-600">
                    <p>Add work experience to improve your profile</p>
                  </div>
                  <Button size="sm" className="w-full">
                    Complete Profile
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};
