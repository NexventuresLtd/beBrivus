from rest_framework import serializers
from django.utils import timezone
from .models import Application
from apps.opportunities.serializers import OpportunitySerializer


class ApplicationSerializer(serializers.ModelSerializer):
    """Serializer for application list and basic operations"""
    opportunity_title = serializers.CharField(source='opportunity.title', read_only=True)
    company_name = serializers.CharField(source='opportunity.company', read_only=True)
    company_logo = serializers.ImageField(source='opportunity.company_logo', read_only=True)
    location = serializers.CharField(source='opportunity.location', read_only=True)
    employment_type = serializers.CharField(source='opportunity.employment_type', read_only=True)
    salary_range = serializers.SerializerMethodField()
    days_since_applied = serializers.SerializerMethodField()
    next_action_date = serializers.SerializerMethodField()
    is_upcoming_action = serializers.SerializerMethodField()
    
    def get_salary_range(self, obj):
        if obj.opportunity.salary_min and obj.opportunity.salary_max:
            return f"{obj.opportunity.salary_currency}{obj.opportunity.salary_min:,} - {obj.opportunity.salary_currency}{obj.opportunity.salary_max:,}"
        return "Not specified"
    
    def get_days_since_applied(self, obj):
        if obj.applied_date:
            delta = timezone.now().date() - obj.applied_date
            return delta.days
        return 0
    
    def get_next_action_date(self, obj):
        # Simple logic for next action - can be enhanced
        if obj.status == 'applied' and obj.applied_date:
            # Follow up after 1 week if no response
            next_action = obj.applied_date + timezone.timedelta(days=7)
            return next_action
        elif obj.status == 'interview' and obj.interview_date:
            return obj.interview_date
        return None
    
    def get_is_upcoming_action(self, obj):
        next_action = self.get_next_action_date(obj)
        if next_action:
            days_until = (next_action - timezone.now().date()).days
            return 0 <= days_until <= 7
        return False

    class Meta:
        model = Application
        fields = [
            'id', 'opportunity', 'opportunity_title', 'company_name', 'company_logo',
            'location', 'employment_type', 'salary_range', 'status', 'priority',
            'applied_date', 'interview_date', 'notes', 'cover_letter', 
            'days_since_applied', 'next_action_date', 'is_upcoming_action',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'days_since_applied']


class ApplicationDetailSerializer(ApplicationSerializer):
    """Detailed serializer for application with full opportunity details"""
    opportunity = OpportunitySerializer(read_only=True)
    interview_dates = serializers.ListField(read_only=True)
    status_history = serializers.SerializerMethodField()
    
    def get_status_history(self, obj):
        # This would require a separate StatusHistory model in a real app
        # For now, return a simple history based on dates
        history = []
        
        if obj.applied_date:
            history.append({
                'status': 'applied',
                'date': obj.applied_date,
                'note': 'Application submitted'
            })
        
        if obj.interview_date:
            history.append({
                'status': 'interview',
                'date': obj.interview_date,
                'note': 'Interview scheduled'
            })
        
        return history

    class Meta(ApplicationSerializer.Meta):
        fields = ApplicationSerializer.Meta.fields + [
            'interview_dates', 'status_history', 'feedback'
        ]


class ApplicationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new applications"""
    
    class Meta:
        model = Application
        fields = [
            'opportunity', 'status', 'priority', 'applied_date',
            'interview_date', 'notes', 'cover_letter'
        ]
        
    def validate_applied_date(self, value):
        if value and value > timezone.now().date():
            raise serializers.ValidationError("Applied date cannot be in the future")
        return value


class ApplicationStatsSerializer(serializers.Serializer):
    """Serializer for application statistics"""
    total_applications = serializers.IntegerField()
    recent_applications = serializers.IntegerField()
    interview_rate = serializers.FloatField()
    offer_rate = serializers.FloatField()
    status_breakdown = serializers.DictField()
    upcoming_actions = serializers.DictField()
