from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, UserSkill, UserEducation, UserExperience


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 'password', 'password_confirm', 'user_type')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include email and password')
        
        return attrs


class UserSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSkill
        fields = '__all__'
        read_only_fields = ('user',)


class UserEducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserEducation
        fields = '__all__'
        read_only_fields = ('user',)


class UserExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserExperience
        fields = '__all__'
        read_only_fields = ('user',)


class UserProfileSerializer(serializers.ModelSerializer):
    skills = UserSkillSerializer(many=True, read_only=True)
    education = UserEducationSerializer(many=True, read_only=True)
    experience = UserExperienceSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = (
            'id', 'email', 'username', 'first_name', 'last_name', 'user_type',
            'phone_number', 'date_of_birth', 'profile_picture', 'bio', 'location',
            'university', 'field_of_study', 'graduation_year', 'linkedin_profile',
            'github_profile', 'portfolio_website', 'profile_public',
            'email_notifications', 'push_notifications', 'email_verified',
            'phone_verified', 'last_active', 'skills', 'education', 'experience'
        )
        read_only_fields = ('id', 'email_verified', 'phone_verified', 'last_active')


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'user_type', 'profile_picture', 'bio', 'location')
        read_only_fields = ('id', 'email')
