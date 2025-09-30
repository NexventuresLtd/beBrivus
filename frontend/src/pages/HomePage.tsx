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
  Award,
  Star,
  Trophy,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Layout } from "../components/layout";
import { Button, Card, CardBody, Badge } from "../components/ui";

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black bg-opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-transparent"></div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-600/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-20 h-20 bg-secondary-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 left-10 w-16 h-16 bg-primary-300/30 rounded-full animate-bounce"></div>
        <div className="absolute bottom-40 right-32 w-12 h-12 bg-warning-400/40 rounded-full animate-pulse"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex items-center min-h-screen">
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
            {/* Content */}
            <div className="text-left lg:pr-8">              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Your Gateway to
                <span className="bg-gradient-to-r from-secondary-300 to-warning-300 bg-clip-text text-transparent block">
                  Global Excellence
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl mb-8 text-primary-100 leading-relaxed">
                Discover life-changing scholarships, internships, and career opportunities 
                worldwide. Get AI-powered recommendations, expert mentorship, and 
                comprehensive support throughout your application journey.
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-6 mb-10">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-success-500/20 rounded-lg flex items-center justify-center mr-3">
                    <Users className="w-6 h-6 text-success-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">15K+</div>
                    <div className="text-sm text-primary-200">Active Fellows</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-warning-500/20 rounded-lg flex items-center justify-center mr-3">
                    <Trophy className="w-6 h-6 text-warning-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">92%</div>
                    <div className="text-sm text-primary-200">Success Rate</div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              {!isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/register">
                    <Button className="group relative px-8 py-4 bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white font-semibold rounded-xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-secondary-500/25">
                      <span className="flex items-center">
                        Apply Now
                        <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                    </Button>
                  </Link>
                  <Link to="/opportunities">
                    <Button className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 hover:scale-105">
                      Explore Opportunities
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link to="/dashboard">
                  <Button className="group px-8 py-4 bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white font-semibold rounded-xl shadow-2xl transform transition-all duration-300 hover:scale-105">
                    <span className="flex items-center">
                      Go to Dashboard
                      <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </Link>
              )}
            </div>

            {/* Visual Elements */}
            <div className="hidden lg:block relative">
              <div className="relative">
                {/* Main Card */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mr-4">
                      <Globe className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Global Network</h3>
                      <p className="text-primary-200">Connect worldwide</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <span className="text-white font-medium">Scholarships</span>
                      <span className="text-secondary-300 font-semibold">2,847</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <span className="text-white font-medium">Internships</span>
                      <span className="text-secondary-300 font-semibold">1,923</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <span className="text-white font-medium">Fellowships</span>
                      <span className="text-secondary-300 font-semibold">456</span>
                    </div>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-6 -right-6 bg-gradient-to-br from-warning-400 to-warning-600 rounded-2xl p-4 shadow-2xl rotate-12 transform hover:rotate-6 transition-transform">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-gradient-to-br from-success-400 to-success-600 rounded-2xl p-4 shadow-2xl -rotate-12 transform hover:-rotate-6 transition-transform">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32V120H1392C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120H0V64Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-primary-100 px-4 py-2 rounded-full mb-6">
              <Star className="w-4 h-4 mr-2 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">Comprehensive Platform</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6 leading-tight">
              Everything You Need to
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent block">
                Succeed Globally
              </span>
            </h2>
            <p className="text-xl text-secondary-600 max-w-4xl mx-auto leading-relaxed">
              From AI-powered opportunity discovery to expert mentorship, we provide 
              all the cutting-edge tools and personalized support you need to unlock 
              your potential and advance your career on the global stage.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-primary-50/30">
              <CardBody className="text-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-xl">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-secondary-900 mb-4">
                  AI-Powered Discovery
                </h3>
                <p className="text-secondary-600 leading-relaxed">
                  Get personalized opportunity recommendations based on your
                  profile, skills, and career goals using advanced machine learning.
                </p>
              </CardBody>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-success-50/30">
              <CardBody className="text-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-xl">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-secondary-900 mb-4">
                  Expert Mentorship
                </h3>
                <p className="text-secondary-600 leading-relaxed">
                  Connect with industry professionals for personalized guidance on
                  applications, interviews, and strategic career development.
                </p>
              </CardBody>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-warning-50/30">
              <CardBody className="text-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-warning-500 to-warning-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-xl">
                  <Target className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-secondary-900 mb-4">
                  Smart Tracking
                </h3>
                <p className="text-secondary-600 leading-relaxed">
                  Never miss a deadline with intelligent application tracking,
                  automated reminders, and comprehensive status monitoring.
                </p>
              </CardBody>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-error-50/30">
              <CardBody className="text-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-error-500 to-error-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-xl">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-secondary-900 mb-4">
                  Premium Resources
                </h3>
                <p className="text-secondary-600 leading-relaxed">
                  Access exclusive templates, comprehensive guides, and expert tutorials
                  to elevate your applications and interview performance.
                </p>
              </CardBody>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-secondary-50/30">
              <CardBody className="text-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-xl">
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-secondary-900 mb-4">
                  Global Community
                </h3>
                <p className="text-secondary-600 leading-relaxed">
                  Join an exclusive community of ambitious peers, share experiences,
                  and build lasting connections with future global leaders.
                </p>
              </CardBody>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-primary-50/30">
              <CardBody className="text-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-xl">
                  <BarChart3 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-secondary-900 mb-4">
                  Success Analytics
                </h3>
                <p className="text-secondary-600 leading-relaxed">
                  Track your progress with detailed analytics, success metrics,
                  and actionable insights to continuously improve your approach.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-secondary-900 via-secondary-800 to-primary-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-500/10 rounded-full translate-y-48 -translate-x-48"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-success-500/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6 border border-success-400/30">
              <Globe className="w-5 h-5 mr-2 text-success-300" />
              <span className="text-lg font-semibold text-success-200">Global Impact</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Trusted by Students
              <span className="bg-gradient-to-r from-secondary-300 to-primary-300 bg-clip-text text-transparent block">
                Worldwide
              </span>
            </h2>
            <p className="text-xl text-secondary-200 max-w-3xl mx-auto leading-relaxed">
              Join a thriving community of ambitious students who have transformed their 
              futures through our comprehensive fellowship platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-success-400 to-success-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-5xl font-bold bg-gradient-to-r from-success-300 to-success-400 bg-clip-text text-transparent mb-3">
                  15K+
                </div>
                <div className="text-lg font-semibold text-white mb-2">Active Fellows</div>
                <div className="text-secondary-300 text-sm">Growing daily</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div className="text-5xl font-bold bg-gradient-to-r from-primary-300 to-primary-400 bg-clip-text text-transparent mb-3">
                  8.5K+
                </div>
                <div className="text-lg font-semibold text-white mb-2">Opportunities</div>
                <div className="text-secondary-300 text-sm">Updated weekly</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-warning-400 to-warning-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div className="text-5xl font-bold bg-gradient-to-r from-warning-300 to-warning-400 bg-clip-text text-transparent mb-3">
                  750+
                </div>
                <div className="text-lg font-semibold text-white mb-2">Expert Mentors</div>
                <div className="text-secondary-300 text-sm">Industry leaders</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div className="text-5xl font-bold bg-gradient-to-r from-secondary-300 to-secondary-400 bg-clip-text text-transparent mb-3">
                  92%
                </div>
                <div className="text-lg font-semibold text-white mb-2">Success Rate</div>
                <div className="text-secondary-300 text-sm">Proven results</div>
              </div>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="mt-20 text-center">
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-10 border border-white/10 max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-warning-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-2xl font-semibold text-white mb-6 leading-relaxed italic">
                "beBrivus transformed my approach to finding opportunities. Within 3 months, 
                I secured a prestigious fellowship that launched my career in international development."
              </blockquote>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">A</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">Anna Chen</div>
                  <div className="text-secondary-300 text-sm">Rhodes Scholar, Oxford University</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <section className="relative py-24 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary-900/80 to-primary-600/80"></div>
            <div className="absolute top-20 right-20 w-32 h-32 bg-secondary-400/10 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-24 h-24 bg-warning-400/10 rounded-full animate-bounce"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-success-400/10 rounded-full animate-pulse"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-secondary-500/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6 border border-secondary-400/30">
                <Trophy className="w-5 h-5 mr-2 text-secondary-300" />
                <span className="text-lg font-semibold text-secondary-200">Limited Time Application</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Ready to Transform
                <span className="bg-gradient-to-r from-secondary-300 to-warning-300 bg-clip-text text-transparent block">
                  Your Future?
                </span>
              </h2>
              
              <p className="text-xl md:text-2xl text-primary-100 mb-12 max-w-4xl mx-auto leading-relaxed">
                Join thousands of ambitious students who have already unlocked their potential and secured life-changing opportunities through beBrivus. Your journey to global excellence starts with a single click.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-secondary-400/20 to-secondary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-10 h-10 text-secondary-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Instant Matching</h3>
                <p className="text-primary-200">AI finds your perfect opportunities in seconds</p>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-warning-400/20 to-warning-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-10 h-10 text-warning-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Expert Guidance</h3>
                <p className="text-primary-200">1-on-1 mentorship from industry leaders</p>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-success-400/20 to-success-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-10 h-10 text-success-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Guaranteed Results</h3>
                <p className="text-primary-200">92% of our fellows secure their dream opportunity</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="text-center">
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link to="/register">
                  <Button className="group relative px-12 py-6 bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white text-xl font-bold rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-110 hover:shadow-secondary-500/30">
                    <span className="flex items-center">
                      Apply Now - It's Free
                      <ArrowRight className="ml-3 w-6 h-6 transition-transform group-hover:translate-x-2" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                  </Button>
                </Link>
                
                <div className="flex items-center text-primary-200">
                  <div className="flex -space-x-2 mr-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white flex items-center justify-center text-white font-bold">A</div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-white flex items-center justify-center text-white font-bold">M</div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full border-2 border-white flex items-center justify-center text-white font-bold">S</div>
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full border-2 border-white flex items-center justify-center text-white font-bold">+</div>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Join 15,000+ Fellows</div>
                    <div className="text-sm">Start your journey today</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Link to="/opportunities">
                  <Button className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 hover:scale-105">
                    Browse Opportunities First
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};
