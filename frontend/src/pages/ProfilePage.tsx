import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "../components/layout";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Link as LinkIcon,
  Github,
  Linkedin,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Building,
  BookOpen,
} from "lucide-react";
import { profileApi } from "../api/profile";
import type {
  UserProfile,
  UserSkill,
  UserEducation,
  UserExperience,
} from "../api/profile";

export const ProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [isEditingEducation, setIsEditingEducation] = useState(false);
  const [isEditingExperience, setIsEditingExperience] = useState(false);

  // Fetch profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => profileApi.getProfile().then((res) => res.data),
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) => profileApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEditingBasic(false);
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-secondary-600">Failed to load profile</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="card mb-6">
          <div className="card-body">
            <div className="flex items-start gap-6">
              {/* Profile Picture */}
              <div className="relative">
                {profile.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt={profile.first_name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="w-12 h-12 text-primary-600" />
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-bold text-secondary-900">
                    {profile.first_name} {profile.last_name}
                  </h1>
                  <button
                    onClick={() => setIsEditingBasic(!isEditingBasic)}
                    className="btn btn-secondary btn-sm"
                  >
                    {isEditingBasic ? (
                      <>
                        <X className="w-4 h-4" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-primary">
                    {profile.user_type}
                  </span>
                  {profile.email_verified && (
                    <span className="badge badge-success">Verified</span>
                  )}
                </div>

                <div className="space-y-2 text-secondary-600">
                  {profile.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Basic Info Form */}
        {isEditingBasic && (
          <BasicInfoForm
            profile={profile}
            onSave={(data) => updateProfileMutation.mutate(data)}
            onCancel={() => setIsEditingBasic(false)}
            isSaving={updateProfileMutation.isPending}
          />
        )}

        {/* Bio */}
        {!isEditingBasic && (
          <div className="card mb-6">
            <div className="card-body">
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                About
              </h2>
              {profile.bio ? (
                <p className="text-secondary-700 whitespace-pre-wrap leading-relaxed">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-secondary-500 italic">
                  No bio added yet. Click "Edit Profile" to add one.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Education & Academic Info */}
        <div className="card mb-6">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-secondary-900">
                Education & Academic Info
              </h2>
            </div>

            <div className="space-y-4">
              {profile.university && (
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-primary-600 mt-1" />
                  <div>
                    <p className="font-medium text-secondary-900">
                      {profile.university}
                    </p>
                    <p className="text-sm text-secondary-600">University</p>
                  </div>
                </div>
              )}
              {profile.field_of_study && (
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-primary-600 mt-1" />
                  <div>
                    <p className="font-medium text-secondary-900">
                      {profile.field_of_study}
                    </p>
                    <p className="text-sm text-secondary-600">Field of Study</p>
                  </div>
                </div>
              )}
              {profile.graduation_year && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary-600 mt-1" />
                  <div>
                    <p className="font-medium text-secondary-900">
                      {profile.graduation_year}
                    </p>
                    <p className="text-sm text-secondary-600">
                      Graduation Year
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Links */}
        {(profile.linkedin_profile ||
          profile.github_profile ||
          profile.portfolio_website) && (
          <div className="card mb-6">
            <div className="card-body">
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                Links
              </h2>
              <div className="space-y-3">
                {profile.linkedin_profile && (
                  <a
                    href={profile.linkedin_profile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-primary-600 hover:text-primary-700"
                  >
                    <Linkedin className="w-5 h-5" />
                    <span>LinkedIn Profile</span>
                  </a>
                )}
                {profile.github_profile && (
                  <a
                    href={profile.github_profile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-primary-600 hover:text-primary-700"
                  >
                    <Github className="w-5 h-5" />
                    <span>GitHub Profile</span>
                  </a>
                )}
                {profile.portfolio_website && (
                  <a
                    href={profile.portfolio_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-primary-600 hover:text-primary-700"
                  >
                    <LinkIcon className="w-5 h-5" />
                    <span>Portfolio Website</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Skills Section */}
        <SkillsSection
          isEditing={isEditingSkills}
          onEditToggle={() => setIsEditingSkills(!isEditingSkills)}
        />

        {/* Education Section */}
        <EducationSection
          isEditing={isEditingEducation}
          onEditToggle={() => setIsEditingEducation(!isEditingEducation)}
        />

        {/* Experience Section */}
        <ExperienceSection
          isEditing={isEditingExperience}
          onEditToggle={() => setIsEditingExperience(!isEditingExperience)}
        />
      </div>
    </Layout>
  );
};

// Basic Info Form Component
interface BasicInfoFormProps {
  profile: UserProfile;
  onSave: (data: Partial<UserProfile>) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  profile,
  onSave,
  onCancel,
  isSaving,
}) => {
  const [formData, setFormData] = useState({
    first_name: profile.first_name,
    last_name: profile.last_name,
    bio: profile.bio,
    location: profile.location,
    phone_number: profile.phone_number || "",
    university: profile.university,
    field_of_study: profile.field_of_study,
    graduation_year: profile.graduation_year || undefined,
    linkedin_profile: profile.linkedin_profile,
    github_profile: profile.github_profile,
    portfolio_website: profile.portfolio_website,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="card mb-6 shadow-md">
      <div className="card-body">
        <div className="flex items-center gap-2 mb-6">
          <Edit className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-semibold text-secondary-900">
            Edit Basic Information
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label text-sm font-medium text-secondary-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="form-input w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                required
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <label className="form-label text-sm font-medium text-secondary-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="form-input w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                required
                placeholder="Enter your last name"
              />
            </div>
          </div>

          {/* Bio Field */}
          <div>
            <label className="form-label text-sm font-medium text-secondary-700 mb-2">
              Bio / About Me
            </label>
            <textarea
              className="form-input w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
              rows={5}
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Tell us about yourself, your interests, goals, and what you're passionate about..."
              maxLength={500}
            />
            <p className="text-xs text-secondary-500 mt-1">
              {formData.bio.length}/500 characters
            </p>
          </div>

          {/* Location & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label text-sm font-medium text-secondary-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <input
                type="text"
                className="form-input w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="City, Country"
              />
            </div>
            <div>
              <label className="form-label text-sm font-medium text-secondary-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                className="form-input w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className="border-t border-secondary-200 pt-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary-600" />
              Academic Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-sm font-medium text-secondary-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    University
                  </label>
                  <input
                    type="text"
                    className="form-input w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    value={formData.university}
                    onChange={(e) =>
                      setFormData({ ...formData, university: e.target.value })
                    }
                    placeholder="Your university name"
                  />
                </div>
                <div>
                  <label className="form-label text-sm font-medium text-secondary-700 mb-2">
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    Field of Study
                  </label>
                  <input
                    type="text"
                    className="form-input w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    value={formData.field_of_study}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        field_of_study: e.target.value,
                      })
                    }
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-sm font-medium text-secondary-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Graduation Year
                </label>
                <input
                  type="number"
                  className="form-input w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  value={formData.graduation_year || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      graduation_year: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  min="1950"
                  max="2050"
                  placeholder="e.g., 2024"
                />
              </div>
            </div>
          </div>

          {/* Professional Links */}
          <div className="border-t border-secondary-200 pt-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-primary-600" />
              Professional Links
            </h3>
            <div className="space-y-4">
              <div>
                <label className="form-label text-sm font-medium text-secondary-700 mb-2">
                  <Linkedin className="w-4 h-4 inline mr-1 text-blue-600" />
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  className="form-input w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  value={formData.linkedin_profile}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      linkedin_profile: e.target.value,
                    })
                  }
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <label className="form-label text-sm font-medium text-secondary-700 mb-2">
                  <Github className="w-4 h-4 inline mr-1" />
                  GitHub Profile
                </label>
                <input
                  type="url"
                  className="form-input w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  value={formData.github_profile}
                  onChange={(e) =>
                    setFormData({ ...formData, github_profile: e.target.value })
                  }
                  placeholder="https://github.com/yourusername"
                />
              </div>

              <div>
                <label className="form-label text-sm font-medium text-secondary-700 mb-2">
                  <LinkIcon className="w-4 h-4 inline mr-1" />
                  Portfolio Website
                </label>
                <input
                  type="url"
                  className="form-input w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  value={formData.portfolio_website}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      portfolio_website: e.target.value,
                    })
                  }
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-secondary-200">
            <button
              type="submit"
              className="btn btn-primary flex-1 md:flex-initial px-6 py-2.5"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary flex-1 md:flex-initial px-6 py-2.5"
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Skills Section Component
interface SkillsSectionProps {
  isEditing: boolean;
  onEditToggle: () => void;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({
  isEditing,
  onEditToggle,
}) => {
  const queryClient = useQueryClient();
  const [newSkill, setNewSkill] = useState({
    name: "",
    level: "beginner" as const,
  });

  const { data: skills = [] } = useQuery({
    queryKey: ["skills"],
    queryFn: () => profileApi.getSkills().then((res) => res.data),
  });

  const addSkillMutation = useMutation({
    mutationFn: (skill: Omit<UserSkill, "id" | "verified" | "created_at">) =>
      profileApi.addSkill(skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      setNewSkill({ name: "", level: "beginner" });
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: (id: number) => profileApi.deleteSkill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
  });

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.name.trim()) {
      addSkillMutation.mutate(newSkill);
    }
  };

  const getLevelColor = (level: string) => {
    const colors = {
      beginner: "bg-blue-100 text-blue-800",
      intermediate: "bg-green-100 text-green-800",
      advanced: "bg-orange-100 text-orange-800",
      expert: "bg-purple-100 text-purple-800",
    };
    return colors[level as keyof typeof colors] || colors.beginner;
  };

  return (
    <div className="card mb-6">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-secondary-900 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Skills
          </h2>
          <button onClick={onEditToggle} className="btn btn-secondary btn-sm">
            {isEditing ? (
              <>
                <X className="w-4 h-4" />
                Done
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                Manage Skills
              </>
            )}
          </button>
        </div>

        {isEditing && (
          <form
            onSubmit={handleAddSkill}
            className="mb-4 p-4 bg-secondary-50 rounded-lg border border-secondary-200"
          >
            <div className="flex gap-3">
              <input
                type="text"
                className="form-input flex-1 px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Skill name (e.g., JavaScript, Python, Marketing)"
                value={newSkill.name}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, name: e.target.value })
                }
              />
              <select
                className="form-input px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={newSkill.level}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, level: e.target.value as any })
                }
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
              <button
                type="submit"
                className="btn btn-primary whitespace-nowrap px-5"
                disabled={addSkillMutation.isPending || !newSkill.name.trim()}
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </form>
        )}

        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getLevelColor(
                  skill.level
                )}`}
              >
                <span>{skill.name}</span>
                <span className="text-xs opacity-75">({skill.level})</span>
                {isEditing && (
                  <button
                    onClick={() =>
                      skill.id && deleteSkillMutation.mutate(skill.id)
                    }
                    className="hover:opacity-70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-secondary-500 italic">No skills added yet</p>
        )}
      </div>
    </div>
  );
};

// Education Section Component
interface EducationSectionProps {
  isEditing: boolean;
  onEditToggle: () => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({
  isEditing,
  onEditToggle,
}) => {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEducation, setNewEducation] = useState<
    Omit<UserEducation, "id" | "created_at" | "updated_at">
  >({
    institution: "",
    degree: "",
    field_of_study: "",
    start_date: "",
    end_date: "",
    grade: "",
    description: "",
    current: false,
  });

  const { data: education = [] } = useQuery({
    queryKey: ["education"],
    queryFn: () => profileApi.getEducation().then((res) => res.data),
  });

  const addEducationMutation = useMutation({
    mutationFn: (
      data: Omit<UserEducation, "id" | "created_at" | "updated_at">
    ) => profileApi.addEducation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education"] });
      setShowAddForm(false);
      setNewEducation({
        institution: "",
        degree: "",
        field_of_study: "",
        start_date: "",
        end_date: "",
        grade: "",
        description: "",
        current: false,
      });
    },
  });

  const deleteEducationMutation = useMutation({
    mutationFn: (id: number) => profileApi.deleteEducation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education"] });
    },
  });

  const handleAddEducation = (e: React.FormEvent) => {
    e.preventDefault();
    addEducationMutation.mutate(newEducation);
  };

  return (
    <div className="card mb-6">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-secondary-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Education
          </h2>
          <button onClick={onEditToggle} className="btn btn-secondary btn-sm">
            {isEditing ? (
              <>
                <X className="w-4 h-4" />
                Done
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                Manage Education
              </>
            )}
          </button>
        </div>

        {isEditing && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary btn-sm mb-4"
          >
            <Plus className="w-4 h-4" />
            Add Education
          </button>
        )}

        {showAddForm && (
          <form
            onSubmit={handleAddEducation}
            className="mb-6 p-4 border border-secondary-200 rounded-lg"
          >
            <h3 className="font-semibold text-secondary-900 mb-3">
              Add Education
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                className="form-input"
                placeholder="Institution"
                value={newEducation.institution}
                onChange={(e) =>
                  setNewEducation({
                    ...newEducation,
                    institution: e.target.value,
                  })
                }
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Degree"
                  value={newEducation.degree}
                  onChange={(e) =>
                    setNewEducation({ ...newEducation, degree: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Field of Study"
                  value={newEducation.field_of_study}
                  onChange={(e) =>
                    setNewEducation({
                      ...newEducation,
                      field_of_study: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-sm">Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newEducation.start_date}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        start_date: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="form-label text-sm">End Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newEducation.end_date}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        end_date: e.target.value,
                      })
                    }
                    disabled={newEducation.current}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newEducation.current}
                  onChange={(e) =>
                    setNewEducation({
                      ...newEducation,
                      current: e.target.checked,
                      end_date: "",
                    })
                  }
                />
                <span className="text-sm text-secondary-700">
                  Currently studying here
                </span>
              </label>
              <textarea
                className="form-input"
                placeholder="Description (optional)"
                rows={3}
                value={newEducation.description}
                onChange={(e) =>
                  setNewEducation({
                    ...newEducation,
                    description: e.target.value,
                  })
                }
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={addEducationMutation.isPending}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {education.length > 0 ? (
          <div className="space-y-4">
            {education.map((edu) => (
              <div
                key={edu.id}
                className="p-4 border border-secondary-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-secondary-900">
                      {edu.degree} in {edu.field_of_study}
                    </h3>
                    <p className="text-primary-600 font-medium">
                      {edu.institution}
                    </p>
                    <p className="text-sm text-secondary-600 mt-1">
                      {new Date(edu.start_date).getFullYear()} -{" "}
                      {edu.current
                        ? "Present"
                        : new Date(edu.end_date || "").getFullYear()}
                    </p>
                    {edu.description && (
                      <p className="text-sm text-secondary-700 mt-2">
                        {edu.description}
                      </p>
                    )}
                  </div>
                  {isEditing && edu.id && (
                    <button
                      onClick={() => deleteEducationMutation.mutate(edu.id!)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-secondary-500 italic">
            No education history added yet
          </p>
        )}
      </div>
    </div>
  );
};

// Experience Section Component
interface ExperienceSectionProps {
  isEditing: boolean;
  onEditToggle: () => void;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  isEditing,
  onEditToggle,
}) => {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExperience, setNewExperience] = useState<
    Omit<UserExperience, "id" | "created_at" | "updated_at">
  >({
    company: "",
    position: "",
    location: "",
    start_date: "",
    end_date: "",
    description: "",
    current: false,
  });

  const { data: experience = [] } = useQuery({
    queryKey: ["experience"],
    queryFn: () => profileApi.getExperience().then((res) => res.data),
  });

  const addExperienceMutation = useMutation({
    mutationFn: (
      data: Omit<UserExperience, "id" | "created_at" | "updated_at">
    ) => profileApi.addExperience(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience"] });
      setShowAddForm(false);
      setNewExperience({
        company: "",
        position: "",
        location: "",
        start_date: "",
        end_date: "",
        description: "",
        current: false,
      });
    },
  });

  const deleteExperienceMutation = useMutation({
    mutationFn: (id: number) => profileApi.deleteExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience"] });
    },
  });

  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault();
    addExperienceMutation.mutate(newExperience);
  };

  return (
    <div className="card mb-6">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-secondary-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Experience
          </h2>
          <button onClick={onEditToggle} className="btn btn-secondary btn-sm">
            {isEditing ? (
              <>
                <X className="w-4 h-4" />
                Done
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                Manage Experience
              </>
            )}
          </button>
        </div>

        {isEditing && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary btn-sm mb-4"
          >
            <Plus className="w-4 h-4" />
            Add Experience
          </button>
        )}

        {showAddForm && (
          <form
            onSubmit={handleAddExperience}
            className="mb-6 p-4 border border-secondary-200 rounded-lg"
          >
            <h3 className="font-semibold text-secondary-900 mb-3">
              Add Experience
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                className="form-input"
                placeholder="Company"
                value={newExperience.company}
                onChange={(e) =>
                  setNewExperience({
                    ...newExperience,
                    company: e.target.value,
                  })
                }
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Position"
                  value={newExperience.position}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      position: e.target.value,
                    })
                  }
                  required
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Location (optional)"
                  value={newExperience.location}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      location: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-sm">Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newExperience.start_date}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        start_date: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="form-label text-sm">End Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newExperience.end_date}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        end_date: e.target.value,
                      })
                    }
                    disabled={newExperience.current}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newExperience.current}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      current: e.target.checked,
                      end_date: "",
                    })
                  }
                />
                <span className="text-sm text-secondary-700">
                  Currently working here
                </span>
              </label>
              <textarea
                className="form-input"
                placeholder="Description (optional)"
                rows={3}
                value={newExperience.description}
                onChange={(e) =>
                  setNewExperience({
                    ...newExperience,
                    description: e.target.value,
                  })
                }
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={addExperienceMutation.isPending}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {experience.length > 0 ? (
          <div className="space-y-4">
            {experience.map((exp) => (
              <div
                key={exp.id}
                className="p-4 border border-secondary-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-secondary-900">
                      {exp.position}
                    </h3>
                    <p className="text-primary-600 font-medium">
                      {exp.company}
                    </p>
                    {exp.location && (
                      <p className="text-sm text-secondary-600">
                        {exp.location}
                      </p>
                    )}
                    <p className="text-sm text-secondary-600 mt-1">
                      {new Date(exp.start_date).toLocaleDateString()} -{" "}
                      {exp.current
                        ? "Present"
                        : new Date(exp.end_date || "").toLocaleDateString()}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-secondary-700 mt-2 whitespace-pre-wrap">
                        {exp.description}
                      </p>
                    )}
                  </div>
                  {isEditing && exp.id && (
                    <button
                      onClick={() => deleteExperienceMutation.mutate(exp.id!)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-secondary-500 italic">
            No work experience added yet
          </p>
        )}
      </div>
    </div>
  );
};
