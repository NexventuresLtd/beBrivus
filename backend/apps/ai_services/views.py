from django.shortcuts import render

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from datetime import timedelta
import time

from .models import AIAnalysis, ChatSession, ChatMessage, AIInsight, AIFeedback
from .serializers import (
    AIAnalysisSerializer, ChatSessionSerializer, ChatMessageSerializer,
    AIInsightSerializer, AIFeedbackSerializer, ChatSessionCreateSerializer,
    OpportunityMatchRequestSerializer, DocumentReviewRequestSerializer,
    InterviewPrepRequestSerializer
)
from .gemini_service import gemini_service
from apps.opportunities.models import Opportunity
from apps.applications.models import Application


class AIAnalysisViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for AI analysis history"""
    serializer_class = AIAnalysisSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return AIAnalysis.objects.filter(user=self.request.user)


class ChatSessionViewSet(viewsets.ModelViewSet):
    """ViewSet for AI chat sessions"""
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ChatSessionCreateSerializer
        return ChatSessionSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Send a message in a chat session"""
        session = self.get_object()
        user_message = request.data.get('message', '')
        
        if not user_message:
            return Response(
                {'error': 'Message content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Save user message
        user_msg = ChatMessage.objects.create(
            session=session,
            is_user=True,
            content=user_message
        )
        
        # Generate AI response
        try:
            start_time = time.time()
            
            # Build context from session history
            context = self._build_chat_context(session)
            prompt = f"{context}\n\nUser: {user_message}\n\nAI Assistant:"
            
            ai_response = gemini_service.generate_content(prompt)
            processing_time = int((time.time() - start_time) * 1000)
            
            # Save AI response
            ai_msg = ChatMessage.objects.create(
                session=session,
                is_user=False,
                content=ai_response,
                model_version='gemini-1.5-flash',
                processing_time_ms=processing_time,
                confidence_score=0.8
            )
            
            # Update session timestamp
            session.updated_at = timezone.now()
            session.save()
            
            return Response({
                'user_message': ChatMessageSerializer(user_msg).data,
                'ai_response': ChatMessageSerializer(ai_msg).data
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to generate response: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _build_chat_context(self, session):
        """Build conversation context for AI"""
        context_parts = [
            "You are a career counselor and application coach.",
            f"Session type: {session.get_session_type_display()}"
        ]
        
        if session.opportunity:
            context_parts.append(f"Related opportunity: {session.opportunity.title}")
        
        if session.application:
            context_parts.append(f"Related application: {session.application.opportunity.title}")
        
        # Add recent conversation history
        recent_messages = session.messages.all()[:10]
        if recent_messages:
            context_parts.append("Recent conversation:")
            for msg in reversed(recent_messages):
                sender = "User" if msg.is_user else "AI"
                context_parts.append(f"{sender}: {msg.content}")
        
        return "\n".join(context_parts)


class AIInsightViewSet(viewsets.ModelViewSet):
    """ViewSet for AI insights and recommendations"""
    serializer_class = AIInsightSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = AIInsight.objects.filter(user=self.request.user)
        
        # Filter by viewed status
        viewed = self.request.query_params.get('viewed')
        if viewed is not None:
            queryset = queryset.filter(viewed=viewed.lower() == 'true')
        
        # Filter by dismissed status
        dismissed = self.request.query_params.get('dismissed')
        if dismissed is not None:
            queryset = queryset.filter(dismissed=dismissed.lower() == 'true')
        
        return queryset
    
    @action(detail=True, methods=['patch'])
    def mark_viewed(self, request, pk=None):
        """Mark insight as viewed"""
        insight = self.get_object()
        insight.viewed = True
        insight.save()
        return Response(AIInsightSerializer(insight).data)
    
    @action(detail=True, methods=['patch'])
    def dismiss(self, request, pk=None):
        """Dismiss an insight"""
        insight = self.get_object()
        insight.dismissed = True
        insight.save()
        return Response(AIInsightSerializer(insight).data)


class OpportunityMatchView(APIView):
    """Analyze opportunity match using AI"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = OpportunityMatchRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        opportunity_id = serializer.validated_data['opportunity_id']
        opportunity = get_object_or_404(Opportunity, id=opportunity_id)
        user = request.user
        
        # Build user profile data
        user_profile = {
            'skills': getattr(user, 'skills', []),
            'experience_years': getattr(user, 'experience_years', 0),
            'education': getattr(user, 'education', ''),
            'career_goals': getattr(user, 'career_goals', ''),
            'interests': getattr(user, 'interests', []),
        }
        
        # Build opportunity data
        opportunity_data = {
            'title': opportunity.title,
            'description': opportunity.description,
            'requirements': opportunity.requirements,
            'category': opportunity.category.name if opportunity.category else '',
            'organization': opportunity.organization,
        }
        
        try:
            start_time = time.time()
            analysis_result = gemini_service.analyze_opportunity_match(
                user_profile, opportunity_data
            )
            processing_time = int((time.time() - start_time) * 1000)
            
            # Save analysis
            analysis = AIAnalysis.objects.create(
                user=user,
                analysis_type='opportunity_match',
                opportunity=opportunity,
                input_data={'user_profile': user_profile, 'opportunity': opportunity_data},
                results=analysis_result,
                confidence_score=analysis_result.get('match_score', 50) / 100,
                processing_time_ms=processing_time
            )
            
            return Response({
                'analysis_id': analysis.id,
                'match_score': analysis_result.get('match_score', 50),
                'reasoning': analysis_result.get('reasoning', ''),
                'strengths': analysis_result.get('strengths', []),
                'gaps': analysis_result.get('gaps', []),
                'recommendations': analysis_result.get('recommendations', [])
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to analyze match: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DocumentReviewView(APIView):
    """Review application documents using AI"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = DocumentReviewRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        document_type = serializer.validated_data['document_type']
        content = serializer.validated_data['content']
        opportunity_id = serializer.validated_data.get('opportunity_id')
        
        opportunity = None
        opportunity_data = {}
        
        if opportunity_id:
            opportunity = get_object_or_404(Opportunity, id=opportunity_id)
            opportunity_data = {
                'title': opportunity.title,
                'organization': opportunity.organization,
                'requirements': opportunity.requirements,
                'description': opportunity.description,
            }
        
        try:
            start_time = time.time()
            review_result = gemini_service.improve_application_document(
                document_type, content, opportunity_data
            )
            processing_time = int((time.time() - start_time) * 1000)
            
            # Save analysis
            analysis = AIAnalysis.objects.create(
                user=request.user,
                analysis_type='document_review',
                opportunity=opportunity,
                input_data={
                    'document_type': document_type,
                    'content': content[:1000],  # Store truncated content
                    'opportunity': opportunity_data
                },
                results=review_result,
                confidence_score=review_result.get('overall_score', 70) / 100,
                processing_time_ms=processing_time
            )
            
            return Response({
                'analysis_id': analysis.id,
                'overall_score': review_result.get('overall_score', 70),
                'strengths': review_result.get('strengths', []),
                'improvements': review_result.get('improvements', []),
                'suggestions': review_result.get('suggestions', []),
                'keywords_to_add': review_result.get('keywords_to_add', []),
                'formatting_tips': review_result.get('formatting_tips', [])
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to review document: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class InterviewPrepView(APIView):
    """Generate interview questions using AI"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = InterviewPrepRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        opportunity_id = serializer.validated_data['opportunity_id']
        difficulty_level = serializer.validated_data['difficulty_level']
        
        opportunity = get_object_or_404(Opportunity, id=opportunity_id)
        
        opportunity_data = {
            'title': opportunity.title,
            'organization': opportunity.organization,
            'category': opportunity.category.name if opportunity.category else '',
            'requirements': opportunity.requirements,
            'description': opportunity.description,
        }
        
        try:
            start_time = time.time()
            questions = gemini_service.generate_interview_questions(
                opportunity_data, difficulty_level
            )
            processing_time = int((time.time() - start_time) * 1000)
            
            # Save analysis
            analysis = AIAnalysis.objects.create(
                user=request.user,
                analysis_type='interview_prep',
                opportunity=opportunity,
                input_data={
                    'opportunity': opportunity_data,
                    'difficulty_level': difficulty_level
                },
                results={'questions': questions},
                confidence_score=0.85,
                processing_time_ms=processing_time
            )
            
            return Response({
                'analysis_id': analysis.id,
                'questions': questions,
                'difficulty_level': difficulty_level
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to generate questions: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
