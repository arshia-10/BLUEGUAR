from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.conf import settings
from .serializers import (
    AdminSignupSerializer, 
    CitizenSignupSerializer, 
    LoginSerializer,
    UpdateUserSerializer,
    ChangePasswordSerializer,
)


@api_view(['GET'])
def api_root(request):
    """
    API root endpoint
    """
    return Response({
        'message': 'Welcome to BlueGuard AI Vision API',
        'version': '1.0.0',
        'endpoints': {
            'admin': '/admin/',
            'signup_admin': '/api/auth/signup/admin/',
            'signup_citizen': '/api/auth/signup/citizen/',
            'login': '/api/auth/login/',
            'logout': '/api/auth/logout/',
            'user_info': '/api/auth/user/',
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_signup(request):
    """
    Admin user signup endpoint
    """
    try:
        serializer = AdminSignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Delete any existing token for this user and create a new one
            Token.objects.filter(user=user).delete()
            token = Token.objects.create(user=user)
            return Response({
                'message': 'Admin account created successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'user_type': user.profile.user_type,
                    'phone_number': getattr(user.profile, 'phone_number', ''),
                    'address': getattr(user.profile, 'address', ''),
                },
                'token': token.key,
            }, status=status.HTTP_201_CREATED)
        
        # Return validation errors with proper format
        return Response({
            'detail': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        # Log the error for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Admin signup error: {str(e)}")
        return Response({
            'detail': 'An error occurred during registration. Please try again.',
            'error': str(e) if settings.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def citizen_signup(request):
    """
    Citizen user signup endpoint
    """
    try:
        serializer = CitizenSignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Delete any existing token for this user and create a new one
            Token.objects.filter(user=user).delete()
            token = Token.objects.create(user=user)
            return Response({
                'message': 'Citizen account created successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'user_type': user.profile.user_type,
                    'phone_number': getattr(user.profile, 'phone_number', ''),
                    'address': getattr(user.profile, 'address', ''),
                },
                'token': token.key,
            }, status=status.HTTP_201_CREATED)
        
        # Return validation errors with proper format
        return Response({
            'detail': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        # Log the error for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Citizen signup error: {str(e)}")
        return Response({
            'detail': 'An error occurred during registration. Please try again.',
            'error': str(e) if settings.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    """
    User login endpoint
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Delete existing token if it exists and create a new one
        Token.objects.filter(user=user).delete()
        token = Token.objects.create(user=user)
        
        # Get user type from profile
        user_type = 'citizen'  # default
        if hasattr(user, 'profile'):
            user_type = user.profile.user_type
        
        return Response({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'user_type': user_type,
                'is_staff': user.is_staff,
                'phone_number': getattr(user.profile, 'phone_number', ''),
                'address': getattr(user.profile, 'address', ''),
            },
            'token': token.key,
        }, status=status.HTTP_200_OK)
    
    # Return proper error message for invalid credentials
    error_message = "Invalid username or password"
    if serializer.errors:
        if 'non_field_errors' in serializer.errors:
            error_message = serializer.errors['non_field_errors'][0]
        elif 'username' in serializer.errors:
            error_message = serializer.errors['username'][0]
        elif 'password' in serializer.errors:
            error_message = serializer.errors['password'][0]
    
    return Response({
        'detail': error_message,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_logout(request):
    """
    User logout endpoint
    """
    try:
        request.user.auth_token.delete()
    except:
        pass
    return Response({
        'message': 'Logout successful'
    }, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_info(request):
    """
    Get or update current user information
    """
    user = request.user
    if request.method == 'PUT':
        serializer = UpdateUserSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            user.first_name = data.get('first_name', user.first_name)
            user.last_name = data.get('last_name', user.last_name)
            user.email = data.get('email', user.email)
            user.save()
            if hasattr(user, 'profile'):
                user.profile.phone_number = data.get('phone_number', user.profile.phone_number)
                user.profile.address = data.get('address', user.profile.address)
                user.profile.save()
            return Response({'message': 'Profile updated successfully'}, status=status.HTTP_200_OK)
        return Response({'detail': 'Validation failed', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    user_type = 'citizen'  # default
    if hasattr(user, 'profile'):
        user_type = user.profile.user_type
    
    return Response({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'user_type': user_type,
            'is_staff': user.is_staff,
            'phone_number': getattr(user.profile, 'phone_number', ''),
            'address': getattr(user.profile, 'address', ''),
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']
        user = request.user
        if not user.check_password(old_password):
            return Response({'detail': 'Old password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        # Invalidate old tokens
        Token.objects.filter(user=user).delete()
        return Response({'message': 'Password changed successfully. Please log in again.'}, status=status.HTTP_200_OK)
    return Response({'detail': 'Validation failed', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

