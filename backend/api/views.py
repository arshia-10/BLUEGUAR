from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.conf import settings
from .models import Admin, AdminToken, CitizenReport
from .serializers import (
    AdminSignupSerializer, 
    CitizenSignupSerializer, 
    LoginSerializer,
    UpdateUserSerializer,
    ChangePasswordSerializer,
    CitizenReportSerializer,
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
    Admin user signup endpoint - creates admin in separate Admin table
    """
    try:
        serializer = AdminSignupSerializer(data=request.data)
        if serializer.is_valid():
            admin = serializer.save()
            # Delete any existing token for this admin and create a new one
            AdminToken.objects.filter(admin=admin).delete()
            token = AdminToken.objects.create(admin=admin)
            
            # Update last_login
            from django.utils import timezone
            admin.last_login = timezone.now()
            admin.save()
            
            return Response({
                'message': 'Admin account created successfully',
                'user': {
                    'id': admin.id,
                    'username': admin.username,
                    'email': admin.email,
                    'first_name': admin.first_name,
                    'last_name': admin.last_name,
                    'user_type': 'admin',
                    'phone_number': admin.phone_number or '',
                    'address': admin.address or '',
                    'is_staff': True,
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
    User login endpoint - checks Admin table first, then User table
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        validated_data = serializer.validated_data
        user_type = validated_data.get('user_type', 'citizen')
        
        # Check if it's an admin login
        if 'admin' in validated_data:
            admin = validated_data['admin']
            
            # Delete existing token if it exists and create a new one
            AdminToken.objects.filter(admin=admin).delete()
            token = AdminToken.objects.create(admin=admin)
            
            # Update last_login
            from django.utils import timezone
            admin.last_login = timezone.now()
            admin.save()
            
            return Response({
                'message': 'Login successful',
                'user': {
                    'id': admin.id,
                    'username': admin.username,
                    'email': admin.email,
                    'first_name': admin.first_name,
                    'last_name': admin.last_name,
                    'user_type': 'admin',
                    'is_staff': True,
                    'phone_number': admin.phone_number or '',
                    'address': admin.address or '',
                },
                'token': token.key,
            }, status=status.HTTP_200_OK)
        
        # Regular user login (citizen or other user types)
        if 'user' in validated_data:
            user = validated_data['user']
            
            # Delete existing token if it exists and create a new one
            Token.objects.filter(user=user).delete()
            token = Token.objects.create(user=user)
            
            # Get user type from profile (default to 'citizen')
            user_type = validated_data.get('user_type', 'citizen')
            if hasattr(user, 'profile') and user.profile.user_type:
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
                    'phone_number': getattr(user.profile, 'phone_number', '') if hasattr(user, 'profile') else '',
                    'address': getattr(user.profile, 'address', '') if hasattr(user, 'profile') else '',
                },
                'token': token.key,
            }, status=status.HTTP_200_OK)
        
        # This shouldn't happen if serializer is valid, but add safety check
        return Response({
            'detail': 'Authentication failed. Please check your credentials.',
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Return proper error message for invalid credentials
    error_message = "Invalid username or password"
    if serializer.errors:
        if 'non_field_errors' in serializer.errors:
            error_message = serializer.errors['non_field_errors'][0]
            if isinstance(error_message, list):
                error_message = error_message[0] if error_message else "Invalid username or password"
        elif 'username' in serializer.errors:
            error_message = serializer.errors['username'][0]
            if isinstance(error_message, list):
                error_message = error_message[0] if error_message else "Invalid username"
        elif 'password' in serializer.errors:
            error_message = serializer.errors['password'][0]
            if isinstance(error_message, list):
                error_message = error_message[0] if error_message else "Invalid password"
    
    return Response({
        'detail': error_message,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_logout(request):
    """
    User logout endpoint - handles both Admin and User tokens
    """
    try:
        # Check if it's an admin
        if isinstance(request.user, Admin):
            try:
                request.user.auth_token.delete()
            except:
                pass
        else:
            # Regular user
            try:
                request.user.auth_token.delete()
            except:
                pass
    except:
        pass
    return Response({
        'message': 'Logout successful'
    }, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_info(request):
    """
    Get or update current user information - handles both Admin and User
    """
    user = request.user
    
    # Check if it's an admin
    if isinstance(user, Admin):
        if request.method == 'PUT':
            serializer = UpdateUserSerializer(data=request.data)
            if serializer.is_valid():
                data = serializer.validated_data
                user.first_name = data.get('first_name', user.first_name)
                user.last_name = data.get('last_name', user.last_name)
                user.email = data.get('email', user.email)
                user.phone_number = data.get('phone_number', user.phone_number)
                user.address = data.get('address', user.address)
                user.save()
                return Response({'message': 'Profile updated successfully'}, status=status.HTTP_200_OK)
            return Response({'detail': 'Validation failed', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'user_type': 'admin',
                'is_staff': True,
                'phone_number': user.phone_number or '',
                'address': user.address or '',
            }
        }, status=status.HTTP_200_OK)
    
    # Regular user
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
        
        # Check if it's an admin
        if isinstance(user, Admin):
            if not user.check_password(old_password):
                return Response({'detail': 'Old password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(new_password)
            user.save()
            # Invalidate old tokens
            AdminToken.objects.filter(admin=user).delete()
        else:
            # Regular user
            if not user.check_password(old_password):
                return Response({'detail': 'Old password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(new_password)
            user.save()
            # Invalidate old tokens
            Token.objects.filter(user=user).delete()
        
        return Response({'message': 'Password changed successfully. Please log in again.'}, status=status.HTTP_200_OK)
    return Response({'detail': 'Validation failed', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_report(request):
    """
    Create a new citizen report - handles file uploads (image and audio)
    """
    try:
        # Get user information for the report
        user = request.user
        
        # Check if it's an admin (admins can also create reports)
        if isinstance(user, Admin):
            reporter_name = f"{user.first_name} {user.last_name}".strip() or user.username
            reporter_email = user.email
        else:
            # Regular user
            reporter_name = f"{user.first_name} {user.last_name}".strip() or user.username
            reporter_email = user.email
        
        # Prepare data with user info
        # DRF's request.data automatically handles both JSON and FormData
        # Convert QueryDict to regular dict for easier handling
        from django.http import QueryDict
        if isinstance(request.data, QueryDict):
            report_data = request.data.dict()
        else:
            report_data = dict(request.data) if hasattr(request, 'data') else {}
        
        # Add user info
        report_data['reporter_name'] = reporter_name
        report_data['reporter_email'] = reporter_email
        
        # Handle file uploads - image and audio
        # Files need to be added separately from request.FILES
        if 'image' in request.FILES:
            report_data['image'] = request.FILES['image']
        if 'audio' in request.FILES:
            report_data['audio'] = request.FILES['audio']
        
        serializer = CitizenReportSerializer(data=report_data)
        if serializer.is_valid():
            report = serializer.save()
            return Response({
                'message': 'Report submitted successfully',
                'report': {
                    'id': report.id,
                    'location': report.location,
                    'description': report.description,
                    'status': report.status,
                    'created_at': report.created_at,
                    'image': report.image.url if report.image else None,
                    'audio': report.audio.url if report.audio else None,
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'detail': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        import logging
        import traceback
        logger = logging.getLogger(__name__)
        logger.error(f"Report creation error: {str(e)}")
        logger.error(traceback.format_exc())
        return Response({
            'detail': 'An error occurred while submitting the report. Please try again.',
            'error': str(e) if settings.DEBUG else None,
            'traceback': traceback.format_exc() if settings.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_reports(request):
    """
    Get reports for the authenticated user
    """
    try:
        user = request.user
        
        # Get user email to filter reports
        if isinstance(user, Admin):
            user_email = user.email
        else:
            user_email = user.email
        
        # Get reports for this user
        reports = CitizenReport.objects.filter(reporter_email=user_email).order_by('-created_at')
        serializer = CitizenReportSerializer(reports, many=True)
        
        return Response({
            'reports': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Get reports error: {str(e)}")
        return Response({
            'detail': 'An error occurred while fetching reports.',
            'error': str(e) if settings.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

