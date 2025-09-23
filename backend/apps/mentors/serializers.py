from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import MentorProfile, MentorshipSession, MentorAvailability, MentorSpecificAvailability

User = get_user_model()


class MentorOnboardingSerializer(serializers.ModelSerializer):
    """Serializer for mentor onboarding"""
    class Meta:
        model = MentorProfile
        fields = [
            'current_position',
            'current_company',
            'years_of_experience',
            'specializations',
            'mentoring_experience',
            'languages_spoken',
            'hourly_rate',
            'time_zone',
        ]
    
    def create(self, validated_data):
        # Get user from context
        user = self.context['request'].user
        
        # Create mentor profile
        mentor_profile = MentorProfile.objects.create(
            user=user,
            active=True,
            available_for_mentoring=True,
            **validated_data
        )
        
        return mentor_profile


class MentorUserSerializer(serializers.ModelSerializer):
    """Serializer for user information in mentor profile"""
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'profile_picture']
        read_only_fields = fields


class MentorProfileSerializer(serializers.ModelSerializer):
    """Serializer for mentor profile"""
    user = MentorUserSerializer(read_only=True)
    expertise_list = serializers.SerializerMethodField()
    languages_list = serializers.SerializerMethodField()
    match_score = serializers.IntegerField(read_only=True, default=75)
    
    # Map frontend expected fields to model fields
    title = serializers.CharField(source='current_position', read_only=True)
    company = serializers.CharField(source='current_company', read_only=True)
    location = serializers.CharField(source='user.location', read_only=True)
    bio = serializers.CharField(source='mentoring_experience', read_only=True)
    experience_years = serializers.IntegerField(source='years_of_experience', read_only=True)
    rating = serializers.DecimalField(source='average_rating', max_digits=3, decimal_places=2, read_only=True)
    availability = serializers.SerializerMethodField()
    response_time_hours = serializers.IntegerField(default=24, read_only=True)
    education = serializers.CharField(source='user.field_of_study', read_only=True)
    certifications = serializers.CharField(default='', read_only=True)
    
    def get_expertise_list(self, obj):
        """Convert specializations text to list"""
        if obj.specializations:
            return [skill.strip() for skill in obj.specializations.split(',')]
        return []
    
    def get_languages_list(self, obj):
        """Convert languages_spoken to list"""
        if obj.languages_spoken:
            return [lang.strip() for lang in obj.languages_spoken.split(',')]
        return ['English']
    
    def get_availability(self, obj):
        """Determine availability status"""
        if obj.available_for_mentoring and obj.active:
            return 'Available'
        return 'Busy'
    
    class Meta:
        model = MentorProfile
        fields = [
            'id', 'user', 'title', 'company', 'location', 'bio', 
            'hourly_rate', 'experience_years', 'rating', 'total_sessions',
            'availability', 'response_time_hours', 'expertise_list', 
            'languages_list', 'education', 'certifications', 'match_score',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['rating', 'total_sessions', 'created_at', 'updated_at']


class MentorSearchSerializer(MentorProfileSerializer):
    """Serializer for mentor search results with additional fields"""
    name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    
    def get_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_avatar(self, obj):
        if obj.user.profile_picture:
            return self.context['request'].build_absolute_uri(obj.user.profile_picture.url)
        return None

    class Meta(MentorProfileSerializer.Meta):
        fields = MentorProfileSerializer.Meta.fields + ['name', 'avatar']


class MentorAvailabilitySerializer(serializers.ModelSerializer):
    """Serializer for mentor weekly availability"""
    day_name = serializers.SerializerMethodField()
    
    class Meta:
        model = MentorAvailability
        fields = ['id', 'day_of_week', 'day_name', 'start_time', 'end_time', 'timezone', 'is_active']
        read_only_fields = ['id']
    
    def get_day_name(self, obj):
        return obj.get_day_of_week_display()


class MentorSpecificAvailabilitySerializer(serializers.ModelSerializer):
    """Serializer for mentor specific date availability"""
    class Meta:
        model = MentorSpecificAvailability
        fields = [
            'id', 'date', 'start_time', 'end_time', 'timezone', 
            'is_available', 'reason'
        ]
        read_only_fields = ['id']


class AvailableSlotSerializer(serializers.Serializer):
    """Serializer for available time slots (computed)"""
    date = serializers.DateField()
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    timezone = serializers.CharField()
    slot_type = serializers.CharField()  # 'weekly' or 'specific'


class MentorSessionSerializer(serializers.ModelSerializer):
    """Serializer for mentor sessions"""
    mentee_name = serializers.SerializerMethodField()
    mentor_name = serializers.SerializerMethodField()
    mentor_id = serializers.IntegerField(source='mentor.id', read_only=True)
    mentor_avatar = serializers.SerializerMethodField()
    mentor_company = serializers.CharField(source='mentor.current_company', read_only=True)
    session_date = serializers.DateTimeField(source='scheduled_start', read_only=True)
    session_end_date = serializers.DateTimeField(source='scheduled_end', read_only=True)
    start_time = serializers.SerializerMethodField()
    end_time = serializers.SerializerMethodField()
    duration_minutes = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    session_type_display = serializers.CharField(source='get_session_type_display', read_only=True)
    can_reschedule = serializers.SerializerMethodField()
    can_cancel = serializers.SerializerMethodField()
    is_upcoming = serializers.SerializerMethodField()
    
    def get_mentee_name(self, obj):
        return obj.mentee.get_full_name()
    
    def get_mentor_name(self, obj):
        return obj.mentor.user.get_full_name()
    
    def get_mentor_avatar(self, obj):
        if hasattr(obj.mentor.user, 'profile_picture') and obj.mentor.user.profile_picture:
            return obj.mentor.user.profile_picture.url
        return None
    
    def get_start_time(self, obj):
        return obj.scheduled_start.time() if obj.scheduled_start else None
        
    def get_end_time(self, obj):
        return obj.scheduled_end.time() if obj.scheduled_end else None
    
    def get_duration_minutes(self, obj):
        if obj.scheduled_start and obj.scheduled_end:
            return int((obj.scheduled_end - obj.scheduled_start).total_seconds() / 60)
        return None
    
    def get_can_reschedule(self, obj):
        from django.utils import timezone
        return (
            obj.scheduled_start > timezone.now() and 
            obj.status in ['scheduled', 'requested']
        )
    
    def get_can_cancel(self, obj):
        from django.utils import timezone
        return (
            obj.scheduled_start > timezone.now() and 
            obj.status not in ['completed', 'cancelled', 'no_show']
        )
    
    def get_is_upcoming(self, obj):
        from django.utils import timezone
        return obj.scheduled_start > timezone.now()

    class Meta:
        model = MentorshipSession
        fields = [
            'id', 'mentee_name', 'mentor_name', 'mentor_id', 'mentor_avatar', 
            'mentor_company', 'session_date', 'session_end_date', 'start_time', 
            'end_time', 'duration_minutes', 'session_type', 'session_type_display',
            'status', 'status_display', 'notes', 'mentee_notes', 'agenda',
            'meeting_link', 'meeting_id', 'location', 'can_reschedule', 
            'can_cancel', 'is_upcoming', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'mentee_name', 'mentor_name', 
            'mentor_id', 'mentor_avatar', 'mentor_company', 'session_date', 
            'session_end_date', 'start_time', 'end_time', 'duration_minutes',
            'status_display', 'session_type_display', 'can_reschedule', 
            'can_cancel', 'is_upcoming'
        ]


class BookSessionSerializer(serializers.Serializer):
    """Serializer for booking a mentor session"""
    session_date = serializers.DateField()
    start_time = serializers.TimeField()
    duration = serializers.IntegerField(default=60, min_value=30, max_value=180)
    session_type = serializers.ChoiceField(choices=[
        ('career_guidance', 'Career Guidance'),
        ('interview_prep', 'Interview Preparation'),
        ('skill_development', 'Skill Development'),
        ('portfolio_review', 'Portfolio Review'),
        ('networking', 'Networking'),
        ('other', 'Other')
    ])
    notes = serializers.CharField(required=False, allow_blank=True)
