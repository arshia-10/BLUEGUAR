from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Admin, AdminToken, UserProfile, FloodAlert, CitizenReport, ResponseTeam, CompletedTask


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
    aadhaar_card = serializers.ImageField(required=False, allow_null=True)
    otp_verified = serializers.BooleanField(required=False, default=False)
    
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
    
    def validate(self, data):
        # Check if OTP is verified (optional for now, can be made required later)
        email = data.get('email')
        otp_verified = data.get('otp_verified', False)
        
        # For now, OTP verification is optional
        # You can make it required by uncommenting below
        # if not otp_verified:
        #     from .models import OTP
        #     try:
        #         otp = OTP.objects.filter(email=email, is_verified=True).latest('created_at')
        #         if otp.is_expired():
        #             raise serializers.ValidationError("OTP verification expired. Please verify again.")
        #     except OTP.DoesNotExist:
        #         raise serializers.ValidationError("Please verify your email with OTP first.")
        
        return data
    
    def create(self, validated_data):
        phone_number = validated_data.pop('phone_number', '')
        address = validated_data.pop('address', '')
        password = validated_data.pop('password')
        aadhaar_card = validated_data.pop('aadhaar_card', None)
        validated_data.pop('otp_verified', None)  # Remove from validated_data
        
        # Create admin without password first
        admin = Admin(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=phone_number,
            address=address,
        )
        
        # Add aadhaar card if provided
        if aadhaar_card:
            admin.aadhaar_card = aadhaar_card
        
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
    aadhaar_card = serializers.ImageField(required=False, allow_null=True)
    otp_verified = serializers.BooleanField(required=False, default=False)
    
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
    
    def validate(self, data):
        # Check if OTP is verified (optional for now, can be made required later)
        email = data.get('email')
        otp_verified = data.get('otp_verified', False)
        
        # For now, OTP verification is optional
        # You can make it required by uncommenting below
        # if not otp_verified:
        #     from .models import OTP
        #     try:
        #         otp = OTP.objects.filter(email=email, is_verified=True).latest('created_at')
        #         if otp.is_expired():
        #             raise serializers.ValidationError("OTP verification expired. Please verify again.")
        #     except OTP.DoesNotExist:
        #         raise serializers.ValidationError("Please verify your email with OTP first.")
        
        return data
    
    def create(self, validated_data):
        phone_number = validated_data.pop('phone_number', '')
        address = validated_data.pop('address', '')
        password = validated_data.pop('password')
        aadhaar_card = validated_data.pop('aadhaar_card', None)
        validated_data.pop('otp_verified', None)  # Remove from validated_data
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        
        profile = UserProfile.objects.create(
            user=user,
            user_type='citizen',
            phone_number=phone_number,
            address=address
        )
        
        # Add aadhaar card if provided
        if aadhaar_card:
            profile.aadhaar_card = aadhaar_card
            profile.save()
        
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
        
        # First, try to authenticate as admin (username or email)
        admin = None
        admin_qs = Admin.objects.filter(username__iexact=username)
        if not admin_qs.exists():
            admin_qs = Admin.objects.filter(email__iexact=username)
        admin = admin_qs.first()

        if admin:
            if admin.check_password(password):
                if not admin.is_active:
                    raise serializers.ValidationError({
                        'non_field_errors': ['Admin account is disabled.']
                    })
                data['admin'] = admin
                data['user_type'] = 'admin'
                return data
            else:
                # Admin exists but password mismatch
                raise serializers.ValidationError({
                    'non_field_errors': ['Invalid username or password.']
                })

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


class ResponseTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResponseTeam
        fields = '__all__'
        read_only_fields = ['created_at']


class CompletedTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompletedTask
        fields = ['notes', 'completed_at']
        read_only_fields = ['completed_at']


class CitizenReportSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    audio = serializers.FileField(required=False, allow_null=True)
    assigned_team = ResponseTeamSerializer(read_only=True)
    assigned_team_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    completed_task = CompletedTaskSerializer(read_only=True)
    
    class Meta:
        model = CitizenReport
        fields = [
            'id', 'reporter_name', 'reporter_email', 'location', 'description',
            'latitude', 'longitude', 'image', 'audio', 'status',
            'assigned_team', 'assigned_team_id', 'completed_task',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'assigned_team', 'completed_task']
    
    def create(self, validated_data):
        # Set status to pending by default (only when creating)
        validated_data['status'] = 'pending'
        # Handle assigned_team_id
        if 'assigned_team_id' in validated_data:
            team_id = validated_data.pop('assigned_team_id')
            if team_id:
                validated_data['assigned_team_id'] = team_id
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Handle assigned_team_id
        if 'assigned_team_id' in validated_data:
            team_id = validated_data.pop('assigned_team_id')
            if team_id:
                instance.assigned_team_id = team_id
            else:
                instance.assigned_team = None
        return super().update(instance, validated_data)




