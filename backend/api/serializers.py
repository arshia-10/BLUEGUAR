from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Admin, AdminToken, UserProfile, FloodAlert, CitizenReport


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['user_type', 'phone_number', 'address']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'profile']
        extra_kwargs = {
            'email': {'required': True},
            'username': {'required': True},
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class AdminSignupSerializer(serializers.Serializer):
    username = serializers.CharField(required=True, max_length=150)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True, min_length=6)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    
    def validate_username(self, value):
        if Admin.objects.filter(username=value).exists():
            raise serializers.ValidationError("Admin username already exists.")
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value
    
    def validate_email(self, value):
        if Admin.objects.filter(email=value).exists():
            raise serializers.ValidationError("Admin email already exists.")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value
    
    def create(self, validated_data):
        phone_number = validated_data.pop('phone_number', '')
        address = validated_data.pop('address', '')
        password = validated_data.pop('password')
        
        # Create admin without password first
        admin = Admin(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=phone_number,
            address=address,
        )
        
        # Set password using the model's set_password method (this hashes it)
        admin.set_password(password)
        admin.save()
        
        return admin


class CitizenSignupSerializer(serializers.Serializer):
    username = serializers.CharField(required=True, max_length=150)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True, min_length=6)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    
    def validate_username(self, value):
        # Check if username exists in User table (for citizens)
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        # Also check Admin table to prevent conflicts
        if Admin.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value
    
    def validate_email(self, value):
        # Check if email exists in User table (for citizens)
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        # Also check Admin table to prevent conflicts
        if Admin.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value
    
    def create(self, validated_data):
        phone_number = validated_data.pop('phone_number', '')
        address = validated_data.pop('address', '')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        
        UserProfile.objects.create(
            user=user,
            user_type='citizen',
            phone_number=phone_number,
            address=address
        )
        
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            raise serializers.ValidationError({
                'non_field_errors': ['Must include username and password.']
            })
        
        # First, try to authenticate as admin
        admin_authenticated = False
        try:
            admin = Admin.objects.get(username=username)
            if admin.check_password(password):
                if not admin.is_active:
                    raise serializers.ValidationError({
                        'non_field_errors': ['Admin account is disabled.']
                    })
                data['admin'] = admin
                data['user_type'] = 'admin'
                admin_authenticated = True
                return data
        except Admin.DoesNotExist:
            pass
        except serializers.ValidationError:
            # Re-raise validation errors (like disabled account)
            raise
        
        # If admin authentication failed, try regular user authentication
        # This ensures citizen login works even if admin with same username exists
        user = authenticate(username=username, password=password)
        if user:
            if not user.is_active:
                raise serializers.ValidationError({
                    'non_field_errors': ['User account is disabled.']
                })
            
            # Check if user has a profile and get user type
            user_type = 'citizen'  # default
            if hasattr(user, 'profile'):
                user_type = user.profile.user_type
            
            data['user'] = user
            data['user_type'] = user_type
            return data
        
        # If neither admin nor user authentication succeeded
        raise serializers.ValidationError({
            'non_field_errors': ['Invalid username or password.']
        })


class UpdateUserSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)


class FloodAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = FloodAlert
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class CitizenReportSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    audio = serializers.FileField(required=False, allow_null=True)
    
    class Meta:
        model = CitizenReport
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'status']
    
    def create(self, validated_data):
        # Set status to pending by default
        validated_data['status'] = 'pending'
        return super().create(validated_data)

