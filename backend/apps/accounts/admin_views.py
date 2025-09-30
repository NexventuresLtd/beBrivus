from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta, datetime
from .models import User
from .serializers import UserSerializer, UserProfileSerializer
from apps.opportunities.models import Opportunity, OpportunityCategory
from apps.opportunities.serializers import OpportunitySerializer, OpportunityCategorySerializer
from apps.resources.models import Resource
from apps.resources.serializers import ResourceSerializer
from apps.applications.models import Application

User = get_user_model()


class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access the view.
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.user_type == 'admin' or request.user.is_staff or request.user.is_superuser)
        )


class AdminUserViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for managing users
    """
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        queryset = User.objects.all().order_by('-created_at')
        
        # Filter by user type
        user_type = self.request.query_params.get('user_type', None)
        if user_type:
            queryset = queryset.filter(user_type=user_type)
        
        # Filter by status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(username__icontains=search)
            )
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        """Toggle user active status"""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({
            'message': f'User {"activated" if user.is_active else "deactivated"} successfully',
            'is_active': user.is_active
        })


class AdminOpportunityViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for managing opportunities
    """
    queryset = Opportunity.objects.all().order_by('-created_at')
    serializer_class = OpportunitySerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        queryset = Opportunity.objects.all().order_by('-created_at')
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category_id=category)
        
        # Search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(company__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        """Toggle opportunity active status"""
        opportunity = self.get_object()
        opportunity.is_active = not opportunity.is_active
        opportunity.save()
        return Response({
            'message': f'Opportunity {"activated" if opportunity.is_active else "deactivated"} successfully',
            'is_active': opportunity.is_active
        })


class AdminOpportunityCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Admin viewset for viewing opportunity categories
    """
    queryset = OpportunityCategory.objects.filter(active=True).order_by('name')
    serializer_class = OpportunityCategorySerializer
    permission_classes = [IsAdminUser]


class AdminResourceViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for managing resources
    """
    queryset = Resource.objects.all().order_by('-created_at')
    serializer_class = ResourceSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        queryset = Resource.objects.all().order_by('-created_at')
        
        # Filter by resource type
        resource_type = self.request.query_params.get('resource_type', None)
        if resource_type:
            queryset = queryset.filter(resource_type=resource_type)
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category_id=category)
        
        # Search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset


class DashboardStatsView(APIView):
    """
    API view for dashboard statistics
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Get date range for recent stats (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        # User statistics
        total_users = User.objects.count()
        new_users_30d = User.objects.filter(created_at__gte=thirty_days_ago).count()
        active_users = User.objects.filter(is_active=True).count()
        
        # User type breakdown
        user_types = User.objects.values('user_type').annotate(count=Count('id'))
        
        # Opportunity statistics
        total_opportunities = Opportunity.objects.count()
        active_opportunities = Opportunity.objects.filter(is_active=True).count()
        new_opportunities_30d = Opportunity.objects.filter(created_at__gte=thirty_days_ago).count()
        
        # Application statistics
        total_applications = Application.objects.count()
        new_applications_30d = Application.objects.filter(created_at__gte=thirty_days_ago).count()
        
        # Resource statistics
        total_resources = Resource.objects.count()
        new_resources_30d = Resource.objects.filter(created_at__gte=thirty_days_ago).count()
        
        return Response({
            'users': {
                'total': total_users,
                'new_30d': new_users_30d,
                'active': active_users,
                'by_type': list(user_types)
            },
            'opportunities': {
                'total': total_opportunities,
                'active': active_opportunities,
                'new_30d': new_opportunities_30d
            },
            'applications': {
                'total': total_applications,
                'new_30d': new_applications_30d
            },
            'resources': {
                'total': total_resources,
                'new_30d': new_resources_30d
            }
        })


class RecentActivityView(APIView):
    """
    API view for recent activity feed
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Get recent activities from last 7 days
        seven_days_ago = timezone.now() - timedelta(days=7)
        
        activities = []
        
        # Recent user registrations
        recent_users = User.objects.filter(
            created_at__gte=seven_days_ago
        ).order_by('-created_at')[:10]
        
        for user in recent_users:
            activities.append({
                'type': 'user_registration',
                'message': f'New user registered: {user.get_full_name() or user.username}',
                'timestamp': user.created_at,
                'user': user.username,
                'icon': 'user-plus'
            })
        
        # Recent applications
        recent_applications = Application.objects.filter(
            created_at__gte=seven_days_ago
        ).select_related('user', 'opportunity').order_by('-created_at')[:10]
        
        for app in recent_applications:
            activities.append({
                'type': 'application',
                'message': f'{app.user.get_full_name() or app.user.username} applied to {app.opportunity.title}',
                'timestamp': app.created_at,
                'user': app.user.username,
                'icon': 'file-text'
            })
        
        # Recent opportunities
        recent_opportunities = Opportunity.objects.filter(
            created_at__gte=seven_days_ago
        ).order_by('-created_at')[:5]
        
        for opp in recent_opportunities:
            activities.append({
                'type': 'opportunity',
                'message': f'New opportunity posted: {opp.title}',
                'timestamp': opp.created_at,
                'user': 'System',
                'icon': 'briefcase'
            })
        
        # Sort all activities by timestamp
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return Response({
            'activities': activities[:20]  # Return top 20 most recent
        })


class AnalyticsView(APIView):
    """
    API view for analytics data
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Get the last 12 months of data
        twelve_months_ago = timezone.now() - timedelta(days=365)
        
        # Monthly user growth
        monthly_users = []
        for i in range(12):
            start_date = twelve_months_ago + timedelta(days=30*i)
            end_date = start_date + timedelta(days=30)
            count = User.objects.filter(
                created_at__gte=start_date,
                created_at__lt=end_date
            ).count()
            monthly_users.append({
                'month': start_date.strftime('%Y-%m'),
                'users': count
            })
        
        # Monthly applications
        monthly_applications = []
        for i in range(12):
            start_date = twelve_months_ago + timedelta(days=30*i)
            end_date = start_date + timedelta(days=30)
            count = Application.objects.filter(
                created_at__gte=start_date,
                created_at__lt=end_date
            ).count()
            monthly_applications.append({
                'month': start_date.strftime('%Y-%m'),
                'applications': count
            })
        
        return Response({
            'monthly_users': monthly_users,
            'monthly_applications': monthly_applications
        })


class UserBulkActionsView(APIView):
    """
    API view for bulk user actions
    """
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        action = request.data.get('action')
        user_ids = request.data.get('user_ids', [])
        
        if not action or not user_ids:
            return Response(
                {'error': 'Action and user_ids are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        users = User.objects.filter(id__in=user_ids)
        
        if action == 'activate':
            users.update(is_active=True)
            message = f'{users.count()} users activated successfully'
        elif action == 'deactivate':
            users.update(is_active=False)
            message = f'{users.count()} users deactivated successfully'
        elif action == 'delete':
            count = users.count()
            users.delete()
            message = f'{count} users deleted successfully'
        else:
            return Response(
                {'error': 'Invalid action'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({'message': message})


class ToggleUserStatusView(APIView):
    """
    API view to toggle individual user status
    """
    permission_classes = [IsAdminUser]
    
    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            user.is_active = not user.is_active
            user.save()
            
            return Response({
                'message': f'User {"activated" if user.is_active else "deactivated"} successfully',
                'is_active': user.is_active,
                'user_id': user.id
            })
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class AnnouncementViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for managing announcements
    """
    permission_classes = [IsAdminUser]
    
    def list(self, request):
        # Placeholder for announcements - you can create an Announcement model later
        return Response({
            'results': [],
            'count': 0
        })
    
    def create(self, request):
        # Placeholder for creating announcements
        return Response({
            'message': 'Announcement created successfully',
            'id': 1
        }, status=status.HTTP_201_CREATED)
