from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Q, Case, When, IntegerField
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.utils import timezone
from .models import Opportunity, SavedOpportunity, OpportunityRecommendation
from .serializers import (
    OpportunitySerializer, 
    OpportunitySearchSerializer,
    SavedOpportunitySerializer
)
from apps.applications.models import Application
from apps.applications.serializers import ApplicationSerializer
from apps.ai_services.gemini_service import gemini_service
import logging

logger = logging.getLogger(__name__)


class OpportunityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing and retrieving opportunities
    """
    serializer_class = OpportunitySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'company', 'location', 'description', 'required_skills']
    filterset_fields = ['employment_type', 'experience_level', 'is_remote']
    ordering_fields = ['posted_date', 'application_deadline', 'salary_min', 'salary_max']
    ordering = ['-posted_date']

    def get_queryset(self):
        queryset = Opportunity.objects.filter(is_active=True).prefetch_related(
            'required_skills', 'benefits'
        )
        
        # Add match score calculation based on user's skills and profile
        user = self.request.user
        user_skills = []
        if hasattr(user, 'skills') and user.skills.exists():
            user_skills = list(user.skills.values_list('name', flat=True))
        
        # Simple matching algorithm - can be enhanced with ML
        queryset = queryset.annotate(
            match_score=Case(
                When(required_skills__name__in=user_skills, then=92),
                default=75,
                output_field=IntegerField()
            )
        )
        
        return queryset.distinct()

    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        """Apply to an opportunity"""
        opportunity = self.get_object()
        
        # Check if user already applied
        if Application.objects.filter(user=request.user, opportunity=opportunity).exists():
            return Response(
                {'error': 'You have already applied to this opportunity'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        application = Application.objects.create(
            user=request.user,
            opportunity=opportunity,
            status='applied',
            applied_date=timezone.now().date()
        )
        
        return Response(
            ApplicationSerializer(application).data, 
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post', 'delete'])
    def save(self, request, pk=None):
        """Save or unsave an opportunity"""
        opportunity = self.get_object()
        
        if request.method == 'POST':
            saved_opportunity, created = SavedOpportunity.objects.get_or_create(
                user=request.user,
                opportunity=opportunity
            )
            return Response(
                SavedOpportunitySerializer(saved_opportunity).data,
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
            )
        
        elif request.method == 'DELETE':
            SavedOpportunity.objects.filter(
                user=request.user,
                opportunity=opportunity
            ).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def ai_recommendations(self, request):
        """Get AI-powered opportunity recommendations for user"""
        user = request.user
        
        # Build user profile
        user_profile = {
            'skills': getattr(user, 'skills', []),
            'experience_years': getattr(user, 'experience_years', 0),
            'education': getattr(user, 'education', ''),
            'career_goals': getattr(user, 'career_goals', ''),
            'interests': getattr(user, 'interests', []),
        }
        
        # Get active opportunities
        opportunities = Opportunity.objects.filter(status='published', application_deadline__gt=timezone.now())[:20]
        recommendations = []
        
        for opportunity in opportunities:
            try:
                # Check if we already have a cached recommendation
                existing_rec = OpportunityRecommendation.objects.filter(
                    user=user,
                    opportunity=opportunity,
                    created_at__gte=timezone.now() - timezone.timedelta(days=7)  # 7-day cache
                ).first()
                
                if existing_rec:
                    rec_data = {
                        'opportunity': OpportunitySerializer(opportunity).data,
                        'match_score': existing_rec.score * 100,
                        'reasons': existing_rec.reasons,
                        'recommendation_id': existing_rec.id
                    }
                    recommendations.append(rec_data)
                    continue
                
                # Generate new AI analysis
                opportunity_data = {
                    'title': opportunity.title,
                    'description': opportunity.description,
                    'requirements': opportunity.requirements,
                    'category': opportunity.category.name if opportunity.category else '',
                    'organization': opportunity.organization,
                }
                
                match_analysis = gemini_service.analyze_opportunity_match(user_profile, opportunity_data)
                match_score = match_analysis.get('match_score', 50)
                
                # Save recommendation
                recommendation = OpportunityRecommendation.objects.create(
                    user=user,
                    opportunity=opportunity,
                    score=match_score / 100.0,
                    reasons=match_analysis.get('recommendations', [])
                )
                
                rec_data = {
                    'opportunity': OpportunitySerializer(opportunity).data,
                    'match_score': match_score,
                    'reasons': match_analysis.get('recommendations', []),
                    'strengths': match_analysis.get('strengths', []),
                    'gaps': match_analysis.get('gaps', []),
                    'recommendation_id': recommendation.id
                }
                recommendations.append(rec_data)
                
            except Exception as e:
                logger.error(f"Error generating recommendation for opportunity {opportunity.id}: {str(e)}")
                continue
        
        # Sort by match score
        recommendations.sort(key=lambda x: x['match_score'], reverse=True)
        
        return Response({
            'recommendations': recommendations[:10],  # Top 10 recommendations
            'total_analyzed': len(opportunities),
            'user_profile_completeness': self._calculate_profile_completeness(user_profile)
        })
    
    def _calculate_profile_completeness(self, user_profile):
        """Calculate how complete the user profile is for better matching"""
        required_fields = ['skills', 'experience_years', 'education', 'career_goals']
        completed = sum(1 for field in required_fields if user_profile.get(field))
        return int((completed / len(required_fields)) * 100)


class OpportunitySearchView(APIView):
    """
    Advanced search for opportunities with AI-powered matching
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Opportunity.objects.filter(is_active=True).prefetch_related(
            'required_skills', 'benefits'
        )
        
        # Apply filters
        search_term = request.query_params.get('search', '')
        if search_term:
            queryset = queryset.filter(
                Q(title__icontains=search_term) |
                Q(company__icontains=search_term) |
                Q(description__icontains=search_term) |
                Q(required_skills__name__icontains=search_term)
            ).distinct()

        employment_type = request.query_params.get('type', '')
        if employment_type:
            queryset = queryset.filter(employment_type=employment_type)

        location = request.query_params.get('location', '')
        if location:
            queryset = queryset.filter(
                Q(location__icontains=location) |
                Q(is_remote=True)
            )

        min_salary = request.query_params.get('min_salary', '')
        if min_salary:
            try:
                queryset = queryset.filter(salary_min__gte=int(min_salary))
            except ValueError:
                pass

        max_salary = request.query_params.get('max_salary', '')
        if max_salary:
            try:
                queryset = queryset.filter(salary_max__lte=int(max_salary))
            except ValueError:
                pass

        experience_level = request.query_params.get('experience_level', '')
        if experience_level:
            queryset = queryset.filter(experience_level=experience_level)

        # Sort
        sort_by = request.query_params.get('sort', 'match')
        if sort_by == 'match':
            # Add match score calculation
            user_skills = []
            if hasattr(request.user, 'skills') and request.user.skills.exists():
                user_skills = list(request.user.skills.values_list('name', flat=True))
            
            queryset = queryset.annotate(
                match_score=Case(
                    When(required_skills__name__in=user_skills, then=92),
                    default=75,
                    output_field=IntegerField()
                )
            ).order_by('-match_score')
        elif sort_by == 'date':
            queryset = queryset.order_by('-posted_date')
        elif sort_by == 'deadline':
            queryset = queryset.order_by('application_deadline')
        elif sort_by == 'salary':
            queryset = queryset.order_by('-salary_max')

        # Paginate
        page_size = min(int(request.query_params.get('page_size', 20)), 100)
        page = int(request.query_params.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size

        total = queryset.count()
        opportunities = queryset[start:end]

        # Check if user has applied or saved each opportunity
        user_applications = set(
            Application.objects.filter(
                user=request.user,
                opportunity__in=opportunities
            ).values_list('opportunity_id', flat=True)
        )
        
        user_saved = set(
            SavedOpportunity.objects.filter(
                user=request.user,
                opportunity__in=opportunities
            ).values_list('opportunity_id', flat=True)
        )

        serializer = OpportunitySearchSerializer(
            opportunities, 
            many=True, 
            context={
                'request': request,
                'user_applications': user_applications,
                'user_saved': user_saved
            }
        )
        
        return Response({
            'results': serializer.data,
            'total': total,
            'page': page,
            'page_size': page_size,
            'has_next': end < total,
            'has_previous': page > 1
        })


class ApplyToOpportunityView(APIView):
    """
    Apply to a specific opportunity
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, opportunity_id):
        try:
            opportunity = Opportunity.objects.get(id=opportunity_id, is_active=True)
        except Opportunity.DoesNotExist:
            return Response(
                {'error': 'Opportunity not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user already applied
        if Application.objects.filter(user=request.user, opportunity=opportunity).exists():
            return Response(
                {'error': 'You have already applied to this opportunity'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create application
        application = Application.objects.create(
            user=request.user,
            opportunity=opportunity,
            status='applied',
            applied_date=timezone.now().date(),
            cover_letter=request.data.get('cover_letter', ''),
            notes=request.data.get('notes', '')
        )

        return Response(
            ApplicationSerializer(application).data, 
            status=status.HTTP_201_CREATED
        )


class SaveOpportunityView(APIView):
    """
    Save or unsave an opportunity
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, opportunity_id):
        try:
            opportunity = Opportunity.objects.get(id=opportunity_id, is_active=True)
        except Opportunity.DoesNotExist:
            return Response(
                {'error': 'Opportunity not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        saved_opportunity, created = SavedOpportunity.objects.get_or_create(
            user=request.user,
            opportunity=opportunity
        )
        
        return Response(
            SavedOpportunitySerializer(saved_opportunity).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

    def delete(self, request, opportunity_id):
        SavedOpportunity.objects.filter(
            user=request.user,
            opportunity_id=opportunity_id
        ).delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)
