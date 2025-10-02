from re import M
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Q, Avg, Case, When, IntegerField, Value
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.utils import timezone
from django.contrib.auth import get_user_model
import uuid
from .models import MentorProfile, MentorshipSession, MentorAvailability, MentorSpecificAvailability
from .serializers import (
    MentorProfileSerializer, 
    MentorSearchSerializer,
    MentorSessionSerializer,
    MentorAvailabilitySerializer,
    MentorSpecificAvailabilitySerializer,
    AvailableSlotSerializer,
    BookSessionSerializer,
    MentorOnboardingSerializer
)


class MentorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing and retrieving mentors
    """
    serializer_class = MentorProfileSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__first_name', 'user__last_name', 'current_company', 'specializations']
    filterset_fields = ['available_for_mentoring', 'hourly_rate', 'expertise_level']
    ordering_fields = ['hourly_rate', 'average_rating', 'total_sessions', 'user__date_joined']
    ordering = ['-average_rating']

    def get_queryset(self):
        queryset = MentorProfile.objects.select_related('user').prefetch_related(
            'weekly_availability'
        )

        user = self.request.user
        if hasattr(user, 'skills'):
            user_skills = list(user.skills.values_list('name', flat=True))
            if user_skills:  # only annotate if user has at least one skill
                first_skill = user_skills[0]
                queryset = queryset.annotate(
                    match_score=Case(
                        When(specializations__icontains=first_skill, then=Value(95)),
                        default=Value(75),
                        output_field=IntegerField()
                    )
                )
            else:
                # fallback if no skills
                queryset = queryset.annotate(
                    match_score=Value(75, output_field=IntegerField())
                )
        else:
            # if user has no skills relation at all
            queryset = queryset.annotate(
                match_score=Value(75, output_field=IntegerField())
            )

        return queryset

    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        """Get mentor's availability"""
        mentor = self.get_object()
        availability = MentorAvailability.objects.filter(mentor=mentor)
        serializer = MentorAvailabilitySerializer(availability, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def book_session(self, request, pk=None):
        """Book a session with the mentor"""
        mentor = self.get_object()
        serializer = BookSessionSerializer(data=request.data)
        if serializer.is_valid():
            session = serializer.save(
                mentee=request.user,
                mentor=mentor.user,
                status='scheduled'
            )
            return Response(MentorSessionSerializer(session).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MentorSearchView(APIView):
    """
    Advanced search for mentors with filtering and matching
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = MentorProfile.objects.select_related('user').prefetch_related(
            'weekly_availability'
        )
        
        # Apply filters
        search_term = request.query_params.get('search', '')
        if search_term:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search_term) |
                Q(user__last_name__icontains=search_term) |
                Q(current_company__icontains=search_term) |
                Q(specializations__icontains=search_term)
            ).distinct()

        expertise_filter = request.query_params.get('expertise', '')
        if expertise_filter:
            queryset = queryset.filter(specializations__icontains=expertise_filter)

        availability_filter = request.query_params.get('availability', '')
        if availability_filter:
            queryset = queryset.filter(available_for_mentoring=availability_filter.lower() == 'true')

        min_rating = request.query_params.get('min_rating', '')
        if min_rating:
            try:
                queryset = queryset.filter(average_rating__gte=float(min_rating))
            except ValueError:
                pass

        max_rate = request.query_params.get('max_rate', '')
        if max_rate:
            try:
                queryset = queryset.filter(hourly_rate__lte=float(max_rate))
            except ValueError:
                pass

        # Sort
        sort_by = request.query_params.get('sort', 'rating')
        if sort_by == 'rating':
            queryset = queryset.order_by('-rating')
        elif sort_by == 'price_low':
            queryset = queryset.order_by('hourly_rate')
        elif sort_by == 'price_high':
            queryset = queryset.order_by('-hourly_rate')
        elif sort_by == 'experience':
            queryset = queryset.order_by('-experience_years')

        # Paginate
        page_size = min(int(request.query_params.get('page_size', 20)), 100)
        page = int(request.query_params.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size

        total = queryset.count()
        mentors = queryset[start:end]

        serializer = MentorSearchSerializer(mentors, many=True, context={'request': request})
        
        return Response({
            'results': serializer.data,
            'total': total,
            'page': page,
            'page_size': page_size,
            'has_next': end < total,
            'has_previous': page > 1
        })


class MentorAvailabilityView(APIView):
    """
    List mentor's available time slots for a specific date range
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, mentor_id):
        """Get available slots for mentor"""
        from datetime import datetime, timedelta
        
        try:
            mentor = MentorProfile.objects.get(id=mentor_id)
        except MentorProfile.DoesNotExist:
            return Response({'error': 'Mentor not found'}, status=404)
        
        # Get date range from query params (default to next 30 days)
        today = timezone.now().date()
        start_date_str = request.GET.get('start_date')
        end_date_str = request.GET.get('end_date')
        
        if start_date_str:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        else:
            start_date = today
            
        if end_date_str:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        else:
            end_date = start_date + timedelta(days=30)
        
        available_slots = []
        current_date = start_date
        
        while current_date <= end_date:
            # Check for specific availability overrides first
            specific_slots = MentorSpecificAvailability.objects.filter(
                mentor=mentor,
                date=current_date,
                is_available=True
            ).order_by('start_time')
            
            if specific_slots.exists():
                # Use specific availability
                for slot in specific_slots:
                    available_slots.append({
                        'date': slot.date,
                        'start_time': slot.start_time,
                        'end_time': slot.end_time,
                        'timezone': slot.timezone,
                        'slot_type': 'specific'
                    })
            else:
                # Check if this date is explicitly marked as unavailable
                unavailable_slots = MentorSpecificAvailability.objects.filter(
                    mentor=mentor,
                    date=current_date,
                    is_available=False
                )
                
                if not unavailable_slots.exists():
                    # Use weekly availability
                    day_of_week = current_date.weekday()  # 0=Monday, 6=Sunday
                    weekly_slots = MentorAvailability.objects.filter(
                        mentor=mentor,
                        day_of_week=day_of_week,
                        is_active=True
                    ).order_by('start_time')
                    
                    for slot in weekly_slots:
                        # Check if this specific time slot is blocked
                        is_blocked = unavailable_slots.filter(
                            start_time__lte=slot.start_time,
                            end_time__gte=slot.end_time
                        ).exists()
                        
                        if not is_blocked:
                            available_slots.append({
                                'date': current_date,
                                'start_time': slot.start_time,
                                'end_time': slot.end_time,
                                'timezone': slot.timezone,
                                'slot_type': 'weekly'
                            })
            
            current_date += timedelta(days=1)
        
        # Serialize the results
        serializer = AvailableSlotSerializer(available_slots, many=True)
        return Response(serializer.data)


class BookMentorSessionView(APIView):
    """
    Book a session with a mentor
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, mentor_id):
        try:
            mentor_profile = MentorProfile.objects.get(id=mentor_id)
        except MentorProfile.DoesNotExist:
            return Response(
                {'error': 'Mentor not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = BookSessionSerializer(data=request.data)
        if serializer.is_valid():
            # Check availability
            availability = MentorAvailability.objects.filter(
                mentor=mentor_profile,
                start_time__lte=serializer.validated_data['start_time'],
                is_available=True
            ).first()

            if not availability:
                return Response(
                    {'error': 'Time slot not available'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            scheduled_start = timezone.make_aware(
                timezone.datetime.combine(
                    serializer.validated_data['session_date'],
                    serializer.validated_data['start_time']
                )
            )
            scheduled_end = scheduled_start + timezone.timedelta(minutes=serializer.validated_data.get('duration', 60))
            # Create session
            session = MentorshipSession.objects.create(
                mentee=request.user,
                mentor=mentor_profile,
                scheduled_start=scheduled_start,
                scheduled_end=scheduled_end,
                session_type=serializer.validated_data['session_type'],
                notes=serializer.validated_data.get('notes', ''),
                status='scheduled'
            )

            # Mark availability as booked
            availability.is_available = False
            availability.save()

            return Response(
                MentorSessionSerializer(session).data, 
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user's mentorship session bookings
    """
    serializer_class = MentorSessionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'session_type']
    ordering_fields = ['scheduled_start', 'created_at', 'status']
    ordering = ['-scheduled_start']

    def get_queryset(self):
        """Get bookings for the current user"""
        user = self.request.user
        return MentorshipSession.objects.filter(
            mentee=user
        ).select_related('mentor', 'mentor__user').order_by('-scheduled_start')

    def create(self, request, *args, **kwargs):
        """Not allowed - use specific booking endpoints"""
        return Response(
            {'error': 'Use the mentor-specific booking endpoints to create sessions'}, 
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def update(self, request, *args, **kwargs):
        """Update a booking - limited fields"""
        instance = self.get_object()
        
        # Only allow updates for future sessions and certain statuses
        if instance.scheduled_start <= timezone.now():
            return Response(
                {'error': 'Cannot update past sessions'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if instance.status not in ['requested', 'scheduled']:
            return Response(
                {'error': f'Cannot update sessions with status: {instance.status}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Only allow updating notes and agenda
        allowed_fields = ['notes', 'mentee_notes', 'agenda']
        update_data = {k: v for k, v in request.data.items() if k in allowed_fields}
        
        for field, value in update_data.items():
            setattr(instance, field, value)
        
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Cancel a booking"""
        instance = self.get_object()
        
        # Only allow cancellation for future sessions
        if instance.scheduled_start <= timezone.now():
            return Response(
                {'error': 'Cannot cancel past sessions'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if instance.status in ['completed', 'cancelled', 'no_show']:
            return Response(
                {'error': f'Cannot cancel sessions with status: {instance.status}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status instead of deleting
        instance.status = 'cancelled'
        instance.save()
        
        return Response({'message': 'Booking cancelled successfully'})

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming bookings"""
        now = timezone.now()
        bookings = self.get_queryset().filter(
            scheduled_start__gte=now,
            status__in=['scheduled', 'requested']
        )[:10]
        
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def past(self, request):
        """Get past bookings"""
        now = timezone.now()
        bookings = self.get_queryset().filter(
            scheduled_start__lt=now
        )
        
        # Pagination
        page_size = int(request.query_params.get('page_size', 20))
        page = int(request.query_params.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size
        
        total = bookings.count()
        paginated_bookings = bookings[start:end]
        
        serializer = self.get_serializer(paginated_bookings, many=True)
        
        return Response({
            'results': serializer.data,
            'total': total,
            'page': page,
            'page_size': page_size,
            'has_next': end < total,
            'has_previous': page > 1
        })

    @action(detail=True, methods=['post'])
    def reschedule(self, request, pk=None):
        """Reschedule a booking"""
        instance = self.get_object()
        
        # Only allow rescheduling for future sessions
        if instance.scheduled_start <= timezone.now():
            return Response(
                {'error': 'Cannot reschedule past sessions'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if instance.status not in ['scheduled', 'requested']:
            return Response(
                {'error': f'Cannot reschedule sessions with status: {instance.status}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate new date/time
        new_date = request.data.get('session_date')
        new_time = request.data.get('start_time')
        duration = request.data.get('duration', 60)
        
        if not new_date or not new_time:
            return Response(
                {'error': 'session_date and start_time are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from datetime import datetime
            new_date_obj = datetime.strptime(new_date, '%Y-%m-%d').date()
            new_time_obj = datetime.strptime(new_time, '%H:%M').time()
            
            new_scheduled_start = timezone.make_aware(
                timezone.datetime.combine(new_date_obj, new_time_obj)
            )
            new_scheduled_end = new_scheduled_start + timezone.timedelta(minutes=int(duration))
            
            # Update the session
            instance.scheduled_start = new_scheduled_start
            instance.scheduled_end = new_scheduled_end
            instance.status = 'scheduled'  # Reset status
            instance.save()
            
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
            
        except ValueError as e:
            return Response(
                {'error': 'Invalid date or time format'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get user's booking statistics"""
        from django.db import models
        
        user = request.user
        all_sessions = MentorshipSession.objects.filter(mentee=user)
        
        stats = {
            'total_sessions': all_sessions.count(),
            'completed_sessions': all_sessions.filter(status='completed').count(),
            'upcoming_sessions': all_sessions.filter(
                scheduled_start__gte=timezone.now(),
                status__in=['scheduled', 'requested']
            ).count(),
            'cancelled_sessions': all_sessions.filter(status='cancelled').count(),
            'total_hours': sum([
                (session.actual_end - session.actual_start).total_seconds() / 3600
                for session in all_sessions.filter(
                    actual_start__isnull=False,
                    actual_end__isnull=False
                )
            ]),
            'favorite_session_types': list(
                all_sessions.values('session_type')
                .annotate(count=models.Count('session_type'))
                .order_by('-count')[:3]
                .values_list('session_type', flat=True)
            )
        }
        
        return Response(stats)


class MentorDashboardViewSet(viewsets.GenericViewSet):
    """
    ViewSet for mentor dashboard functionality
    """
    permission_classes = [IsAuthenticated]
    
    def get_mentor_profile(self):
        """Helper to get the current user's mentor profile"""
        try:
            return self.request.user.mentor_profile
        except MentorProfile.DoesNotExist:
            return None
    
    @action(detail=False, methods=['get'])
    def my_sessions(self, request):
        """Get mentor's sessions with filtering options"""
        mentor_profile = self.get_mentor_profile()
        if not mentor_profile:
            return Response(
                {'error': 'User does not have a mentor profile'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get query parameters
        session_status = request.query_params.get('status')
        session_type = request.query_params.get('session_type')
        
        # Base queryset
        sessions = MentorshipSession.objects.filter(
            mentor=mentor_profile
        ).select_related('mentee').order_by('-scheduled_start')
        
        # Apply filters
        if session_status:
            sessions = sessions.filter(status=session_status)
        if session_type:
            sessions = sessions.filter(session_type=session_type)
            
        serializer = MentorSessionSerializer(sessions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending_sessions(self, request):
        """Get sessions that need mentor's action (requested status)"""
        mentor_profile = self.get_mentor_profile()
        if not mentor_profile:
            return Response(
                {'error': 'User does not have a mentor profile'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        pending_sessions = MentorshipSession.objects.filter(
            mentor=mentor_profile,
            status='scheduled'
        ).select_related('mentee').order_by('-created_at')
        
        serializer = MentorSessionSerializer(pending_sessions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming_sessions(self, request):
        """Get confirmed upcoming sessions"""
        mentor_profile = self.get_mentor_profile()
        if not mentor_profile:
            return Response(
                {'error': 'User does not have a mentor profile'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        now = timezone.now()
        upcoming_sessions = MentorshipSession.objects.filter(
            mentor=mentor_profile,
            status='confirmed',
            scheduled_start__gte=now
        ).select_related('mentee').order_by('scheduled_start')
        serializer = MentorSessionSerializer(upcoming_sessions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_mentees(self, request):
        """Get list of all mentees this mentor has worked with"""
        mentor_profile = self.get_mentor_profile()
        if not mentor_profile:
            return Response(
                {'error': 'User does not have a mentor profile'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get unique mentees from sessions
        User = get_user_model()
        
        mentee_ids = MentorshipSession.objects.filter(
            mentor=mentor_profile
        ).values_list('mentee_id', flat=True).distinct()
        
        mentees = User.objects.filter(id__in=mentee_ids)
        
        # Create mentee info with session stats
        mentees_data = []
        for mentee in mentees:
            sessions = MentorshipSession.objects.filter(
                mentor=mentor_profile, 
                mentee=mentee
            )
            
            mentees_data.append({
                'id': mentee.id,
                'first_name': mentee.first_name,
                'last_name': mentee.last_name,
                'email': mentee.email,
                'username': mentee.username,
                'profile_picture': None,
                'total_sessions': sessions.count(),
                'completed_sessions': sessions.filter(status='completed').count(),
                'last_session': sessions.order_by('-scheduled_start').first().scheduled_start if sessions.exists() else None,
                'next_session': sessions.filter(
                    status='scheduled',
                    scheduled_start__gte=timezone.now()
                ).order_by('scheduled_start').first().scheduled_start if sessions.filter(
                    status='scheduled',
                    scheduled_start__gte=timezone.now()
                ).exists() else None
            })
        
        return Response(mentees_data)
    
    @action(detail=False, methods=['post'])
    def confirm_session(self, request):
        """Confirm a requested session"""
        mentor_profile = self.get_mentor_profile()
        if not mentor_profile:
            return Response(
                {'error': 'User does not have a mentor profile'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        session_id = request.data.get('session_id')
        mentor_notes = request.data.get('mentor_notes', '')
        meeting_link = request.data.get('meeting_link', '')
        
        try:
            session = MentorshipSession.objects.get(
                id=session_id,
                mentor=mentor_profile,
                status='scheduled'
            )
        except MentorshipSession.DoesNotExist:
            return Response(
                {'error': 'Session not found or not in requested status'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Update session
        session.status = 'confirmed'
        session.mentor_notes = mentor_notes
        if meeting_link:
            session.meeting_link = meeting_link
        session.save()
        
        serializer = MentorSessionSerializer(session)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def reject_session(self, request):
        """Reject a requested session"""
        mentor_profile = self.get_mentor_profile()
        if not mentor_profile:
            return Response(
                {'error': 'User does not have a mentor profile'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        session_id = request.data.get('session_id')
        mentor_notes = request.data.get('mentor_notes', '')
        
        try:
            session = MentorshipSession.objects.get(
                id=session_id,
                mentor=mentor_profile,
                status='scheduled'
            )
        except MentorshipSession.DoesNotExist:
            return Response(
                {'error': 'Session not found or not in requested status'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Update session
        session.status = 'rejected'
        session.mentor_notes = mentor_notes
        session.save()
        
        serializer = MentorSessionSerializer(session)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def start_session(self, request):
        """Mark session as in progress and generate/return meeting link"""
        mentor_profile = self.get_mentor_profile()
        if not mentor_profile:
            return Response(
                {'error': 'User does not have a mentor profile'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        session_id = request.data.get('session_id')
        
        try:
            session = MentorshipSession.objects.get(
                id=session_id,
                mentor=mentor_profile,
                status='scheduled'
            )
        except MentorshipSession.DoesNotExist:
            return Response(
                {'error': 'Session not found or not scheduled'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if it's time to start (within 10 minutes of scheduled time)
        now = timezone.now()
        time_until_start = (session.scheduled_start - now).total_seconds() / 60
        
        if time_until_start > 10:
            return Response(
                {'error': f'Session cannot be started yet. Please wait {int(time_until_start)} more minutes.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update session status
        session.status = 'in_progress'
        session.actual_start = now
        
        # Generate meeting ID if not exists
        if not session.meeting_id:
            session.meeting_id = str(uuid.uuid4())[:8]
        
        session.save()
        
        serializer = MentorSessionSerializer(session)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def end_session(self, request):
        """Mark session as completed"""
        mentor_profile = self.get_mentor_profile()
        if not mentor_profile:
            return Response(
                {'error': 'User does not have a mentor profile'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        session_id = request.data.get('session_id')
        mentor_notes = request.data.get('mentor_notes', '')
        
        try:
            session = MentorshipSession.objects.get(
                id=session_id,
                mentor=mentor_profile,
                status='in_progress'
            )
        except MentorshipSession.DoesNotExist:
            return Response(
                {'error': 'Session not found or not in progress'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Update session
        session.status = 'completed'
        session.actual_end = timezone.now()
        if mentor_notes:
            session.mentor_notes = mentor_notes
        session.save()
        
        # Update mentor stats
        mentor_profile.total_sessions += 1
        mentor_profile.save()
        
        serializer = MentorSessionSerializer(session)
        return Response(serializer.data)


class MentorOnboardingView(generics.CreateAPIView):
    """
    View for mentor onboarding - create mentor profile after registration
    """
    serializer_class = MentorOnboardingSerializer
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        """Check if mentor needs onboarding"""
        if request.user.user_type != 'mentor':
            return Response({'needs_onboarding': False})
        
        # Check if mentor profile exists
        needs_onboarding = not hasattr(request.user, 'mentor_profile')
        return Response({
            'needs_onboarding': needs_onboarding,
            'onboarding_type': 'mentor' if needs_onboarding else None
        })
    
    def post(self, request, *args, **kwargs):
        # Check if user is a mentor
        if request.user.user_type != 'mentor':
            return Response(
                {'error': 'Only users with mentor type can create mentor profiles'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if mentor profile already exists
        if hasattr(request.user, 'mentor_profile'):
            return Response(
                {'error': 'Mentor profile already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            mentor_profile = serializer.save()
            response_serializer = MentorProfileSerializer(mentor_profile)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
