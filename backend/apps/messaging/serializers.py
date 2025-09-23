from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Conversation, Message, MessageRead
from apps.mentors.models import MentorProfile

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user info for messaging"""
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for messages"""
    sender = UserBasicSerializer(read_only=True)
    is_read = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'content', 
            'message_type', 'created_at', 'is_read'
        ]
        read_only_fields = ['id', 'sender', 'created_at']

    def get_is_read(self, obj):
        """Check if current user has read this message"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_read_by(request.user)
        return False

    def create(self, validated_data):
        """Create a new message"""
        request = self.context.get('request')
        validated_data['sender'] = request.user
        return super().create(validated_data)


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer for conversations"""
    participants = UserBasicSerializer(many=True, read_only=True)
    last_message = MessageSerializer(read_only=True)
    unread_count = serializers.SerializerMethodField()
    other_participant = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'participants', 'mentor', 'last_message',
            'unread_count', 'other_participant', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_unread_count(self, obj):
        """Get unread message count for current user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.exclude(
                read_by=request.user
            ).exclude(
                sender=request.user
            ).count()
        return 0

    def get_other_participant(self, obj):
        """Get the other participant in conversation"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            other_user = obj.get_other_participant(request.user)
            if other_user:
                return UserBasicSerializer(other_user).data
        return None


class ConversationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating conversations"""
    participant_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        help_text="List of user IDs to include in conversation"
    )
    mentor_id = serializers.IntegerField(
        required=False, 
        allow_null=True,
        help_text="ID of mentor if this is mentor-related conversation"
    )
    initial_message = serializers.CharField(
        write_only=True,
        required=False,
        help_text="Optional initial message to send"
    )

    class Meta:
        model = Conversation
        fields = ['participant_ids', 'mentor_id', 'initial_message']

    def create(self, validated_data):
        """Create conversation with participants"""
        participant_ids = validated_data.pop('participant_ids', [])
        mentor_id = validated_data.pop('mentor_id', None)
        initial_message = validated_data.pop('initial_message', None)
        
        request = self.context.get('request')
        current_user = request.user
        
        # Create conversation
        conversation = Conversation.objects.create(**validated_data)
        
        # Add current user to participants
        conversation.participants.add(current_user)
        
        # Add other participants
        if participant_ids:
            users = User.objects.filter(id__in=participant_ids)
            conversation.participants.add(*users)
        
        # Link to mentor if provided
        if mentor_id:
            try:
                mentor = MentorProfile.objects.get(id=mentor_id)
                conversation.mentor = mentor
                conversation.participants.add(mentor.user)
                conversation.save()
            except MentorProfile.DoesNotExist:
                pass
        
        # Send initial message if provided
        if initial_message:
            Message.objects.create(
                conversation=conversation,
                sender=current_user,
                content=initial_message
            )
        
        return conversation
