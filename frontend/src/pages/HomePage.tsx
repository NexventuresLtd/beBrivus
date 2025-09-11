import React from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Users,
  Target,
  BookOpen,
  BarChart3,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Zap,
  Globe,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Layout } from "../components/layout";
import { Button, Card, CardBody, Badge } from "../components/ui";

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Gateway to Global Opportunities
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Discover scholarships, internships, and career opportunities
              worldwide. Get AI-powered recommendations, expert mentorship, and
              track your application journey.
            </p>
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-primary-600"
                >
                  <Link to="/register" className="flex items-center">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="primary"
                  className="bg-primary-500 hover:bg-primary-400"
                >
                  <Link to="/opportunities">Explore Opportunities</Link>
                </Button>
              </div>
            ) : (
              <Button
                size="lg"
                variant="secondary"
                className="text-primary-600"
              >
                <Link to="/dashboard" className="flex items-center">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              From AI-powered opportunity discovery to expert mentorship, we
              provide all the tools you need to advance your career.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardBody className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  AI-Powered Discovery
                </h3>
                <p className="text-secondary-600">
                  Get personalized opportunity recommendations based on your
                  profile, skills, and career goals.
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="text-center">
                <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-success-600" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  Expert Mentorship
                </h3>
                <p className="text-secondary-600">
                  Connect with industry professionals for guidance on
                  applications, interviews, and career development.
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="text-center">
                <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-warning-600" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  Application Tracking
                </h3>
                <p className="text-secondary-600">
                  Keep track of deadlines, application status, and never miss an
                  important opportunity again.
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="text-center">
                <div className="w-12 h-12 bg-error-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-error-600" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  Resource Library
                </h3>
                <p className="text-secondary-600">
                  Access templates, guides, and tutorials to improve your
                  applications and interview skills.
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  Peer Community
                </h3>
                <p className="text-secondary-600">
                  Join discussions, share experiences, and learn from peers in
                  our supportive community forum.
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="text-center">
                <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-success-600" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  Analytics & Insights
                </h3>
                <p className="text-secondary-600">
                  Track your progress, analyze your application success rate,
                  and identify areas for improvement.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Trusted by Students Worldwide
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">
                10K+
              </div>
              <div className="text-secondary-600">Active Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">
                5K+
              </div>
              <div className="text-secondary-600">Opportunities Listed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">
                500+
              </div>
              <div className="text-secondary-600">Expert Mentors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">
                85%
              </div>
              <div className="text-secondary-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <section className="py-20 bg-primary-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students who have already found their dream
              opportunities through beBrivus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-primary-600"
              >
                <Link to="/register">Sign Up Free</Link>
              </Button>
              <Button size="lg" className="bg-primary-500 hover:bg-primary-400">
                <Link to="/opportunities">Browse Opportunities</Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};
