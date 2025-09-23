from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Prefetch
from django.shortcuts import get_object_or_404
from .models import Conversation, Message, MessageRead
from .serializers import (
    ConversationSerializer, 
    ConversationCreateSerializer,
    MessageSerializer
)


class ConversationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing conversations"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ConversationCreateSerializer
        return ConversationSerializer
    
    def get_queryset(self):
        """Get conversations for current user"""
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related(
            'participants',
            'mentor',
            Prefetch('messages', queryset=Message.objects.order_by('-created_at')[:1])
        ).order_by('-updated_at')

    def create(self, request, *args, **kwargs):
        """Create a new conversation"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        conversation = serializer.save()
        
        # Return the created conversation with full data
        response_serializer = ConversationSerializer(
            conversation, 
            context={'request': request}
        )
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get messages for a specific conversation"""
        conversation = self.get_object()
        messages = conversation.messages.order_by('-created_at')
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 50))
        offset = (page - 1) * page_size
        
        paginated_messages = messages[offset:offset + page_size]
        serializer = MessageSerializer(
            paginated_messages, 
            many=True, 
            context={'request': request}
        )
        
        return Response({
            'results': serializer.data,
            'has_more': messages.count() > offset + page_size
        })

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Send a message to the conversation"""
        conversation = self.get_object()
        
        serializer = MessageSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        message = serializer.save(
            conversation=conversation,
            sender=request.user
        )
        
        # Update conversation timestamp
        conversation.save(update_fields=['updated_at'])
        
        return Response(
            MessageSerializer(message, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark all messages in conversation as read"""
        conversation = self.get_object()
        
        # Get all unread messages in this conversation
        unread_messages = conversation.messages.exclude(sender=request.user)
        
        # Create read receipts for unread messages
        for message in unread_messages:
            MessageRead.objects.get_or_create(
                message=message,
                user=request.user
            )
        
        return Response({'status': 'marked_read'})


class MessageViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for reading messages (mostly read-only)"""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get messages from user's conversations"""
        user_conversations = Conversation.objects.filter(
            participants=self.request.user
        ).values_list('id', flat=True)
        
        return Message.objects.filter(
            conversation__in=user_conversations
        ).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a specific message as read"""
        message = self.get_object()
        
        # Only allow marking messages from conversations user is part of
        if not message.conversation.participants.filter(id=request.user.id).exists():
            return Response(
                {'error': 'Not authorized'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create read receipt
        read_receipt, created = MessageRead.objects.get_or_create(
            message=message,
            user=request.user
        )
        
        return Response({
            'status': 'marked_read',
            'already_read': not created
        })
