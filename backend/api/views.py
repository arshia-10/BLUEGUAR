from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.conf import settings
from django.core.files.storage import default_storage
from .models import Admin, AdminToken, CitizenReport, OTP, ResponseTeam, CompletedTask
from .serializers import (
    AdminSignupSerializer,
    CitizenSignupSerializer,
    LoginSerializer,
    UpdateUserSerializer,
    ChangePasswordSerializer,
    CitizenReportSerializer,
    ResponseTeamSerializer,
    CompletedTaskSerializer,
)
from django.utils import timezone
from datetime import timedelta
import random
import string


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
    Handles file uploads (aadhaar card)
    """
    try:
        # Prepare data - handle both JSON and FormData
        from django.http import QueryDict
        if isinstance(request.data, QueryDict):
            signup_data = request.data.dict()
        else:
            signup_data = dict(request.data) if hasattr(request, 'data') else {}
        
        # Handle file uploads - aadhaar card
        if 'aadhaar_card' in request.FILES:
            signup_data['aadhaar_card'] = request.FILES['aadhaar_card']
        
        serializer = AdminSignupSerializer(data=signup_data)
        if serializer.is_valid():
            admin = serializer.save()
            # Delete any existing token for this admin and create a new one
            AdminToken.objects.filter(admin=admin).delete()
            token = AdminToken.objects.create(admin=admin)
            
            # Update last_login
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
        import traceback
        logger = logging.getLogger(__name__)
        logger.error(f"Admin signup error: {str(e)}")
        logger.error(traceback.format_exc())
        return Response({
            'detail': 'An error occurred during registration. Please try again.',
            'error': str(e) if settings.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_report_count(request):
    """
    Return total number of citizen reports (all entries in CitizenReport table).
    """
    try:
        total = CitizenReport.objects.count()
        return Response({'count': total}, status=status.HTTP_200_OK)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Get report count error: {str(e)}")
        return Response({
            'detail': 'An error occurred while fetching report count.',
            'error': str(e) if settings.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def citizen_signup(request):
    """
    Citizen user signup endpoint
    Handles file uploads (aadhaar card)
    """
    try:
        # Prepare data - handle both JSON and FormData
        from django.http import QueryDict
        if isinstance(request.data, QueryDict):
            signup_data = request.data.dict()
        else:
            signup_data = dict(request.data) if hasattr(request, 'data') else {}
        
        # Handle file uploads - aadhaar card
        if 'aadhaar_card' in request.FILES:
            signup_data['aadhaar_card'] = request.FILES['aadhaar_card']
        
        serializer = CitizenSignupSerializer(data=signup_data)
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
        import traceback
        logger = logging.getLogger(__name__)
        logger.error(f"Citizen signup error: {str(e)}")
        logger.error(traceback.format_exc())
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
    import logging
    import traceback
    logger = logging.getLogger(__name__)
    
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
        
        # Log incoming request data for debugging
        logger.info(f"Create report request received from {reporter_email}")
        logger.info(f"Request data type: {type(request.data)}")
        logger.info(f"Request content type: {request.content_type}")
        
        # Prepare data with user info
        # For FormData requests, we need to handle QueryDict specially
        from django.http import QueryDict
        report_data = {}
        
        # Copy all form fields from request.data
        if hasattr(request.data, 'items'):
            for key, value in request.data.items():
                # Skip files, we'll handle them separately
                if key not in ['image', 'audio']:
                    report_data[key] = value
        else:
            report_data = dict(request.data) if hasattr(request, 'data') else {}
        
        # Add user info
        report_data['reporter_name'] = reporter_name
        report_data['reporter_email'] = reporter_email
        
        # Handle file uploads - image and audio
        if 'image' in request.FILES:
            report_data['image'] = request.FILES['image']
        if 'audio' in request.FILES:
            report_data['audio'] = request.FILES['audio']
        
        logger.info(f"Final report_data keys: {list(report_data.keys())}")
        logger.info(f"Report data: location={report_data.get('location')}, description={report_data.get('description')}")
        
        serializer = CitizenReportSerializer(data=report_data)
        if serializer.is_valid():
            report = serializer.save()
            logger.info(f"Report created successfully with ID {report.id}")
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
        
        # Log validation errors
        logger.error(f"Validation errors: {serializer.errors}")
        logger.error(f"Serializer is_valid returned False")
        return Response({
            'detail': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
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
        # Admins can view all citizen reports
        if isinstance(user, Admin):
            reports = CitizenReport.objects.all().order_by('-created_at')
        else:
            # Regular users only see their own reports
            user_email = user.email
            reports = CitizenReport.objects.filter(reporter_email=user_email).order_by('-created_at')
        
        # Auto-update status for reports with assigned teams but still pending
        for report in reports:
            if report.assigned_team and report.status == 'pending':
                report.status = 'reviewed'
                report.save()
        
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


@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_reports(request):
    """
    Return all citizen reports regardless of requester auth.
    Intended for admin dashboard listing.
    """
    try:
        reports = CitizenReport.objects.all().order_by('-created_at')
        
        # Auto-update status for reports with assigned teams but still pending
        for report in reports:
            if report.assigned_team and report.status == 'pending':
                report.status = 'reviewed'
                report.save()
        
        serializer = CitizenReportSerializer(reports, many=True)
        return Response({'reports': serializer.data}, status=status.HTTP_200_OK)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Get all reports error: {str(e)}")
        return Response({
            'detail': 'An error occurred while fetching all reports.',
            'error': str(e) if settings.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['POST'])
@permission_classes([AllowAny])
def generate_otp(request):
    """
    Generate OTP for email verification
    """
    try:
        email = request.data.get('email')
        if not email:
            return Response({
                'detail': 'Email is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate 6-digit OTP
        otp_code = ''.join(random.choices(string.digits, k=6))
        
        # Delete old OTPs for this email
        OTP.objects.filter(email=email, is_verified=False).delete()
        
        # Create new OTP (expires in 10 minutes)
        otp = OTP.objects.create(
            email=email,
            otp_code=otp_code,
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        
        # In production, send OTP via email/SMS
        # For development, we'll return it in response
        if settings.DEBUG:
            return Response({
                'message': 'OTP generated successfully',
                'otp': otp_code,  # Only in DEBUG mode
                'expires_in': 600  # 10 minutes in seconds
            }, status=status.HTTP_200_OK)
        else:
            # In production, send OTP via email
            # TODO: Implement email sending
            return Response({
                'message': 'OTP sent to your email',
                'expires_in': 600
            }, status=status.HTTP_200_OK)
            
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"OTP generation error: {str(e)}")
        return Response({
            'detail': 'An error occurred while generating OTP.',
            'error': str(e) if settings.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """
    Verify OTP code
    """
    try:
        email = request.data.get('email')
        otp_code = request.data.get('otp')
        
        if not email or not otp_code:
            return Response({
                'detail': 'Email and OTP code are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the most recent OTP for this email
        try:
            otp = OTP.objects.filter(email=email, is_verified=False).latest('created_at')
        except OTP.DoesNotExist:
            return Response({
                'detail': 'Invalid or expired OTP'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if OTP is expired
        if otp.is_expired():
            return Response({
                'detail': 'OTP has expired. Please generate a new one.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify OTP code
        if otp.otp_code != otp_code:
            return Response({
                'detail': 'Invalid OTP code'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark OTP as verified
        otp.is_verified = True
        otp.save()
        
        return Response({
            'message': 'OTP verified successfully',
            'verified': True
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"OTP verification error: {str(e)}")
        return Response({
            'detail': 'An error occurred while verifying OTP.',
            'error': str(e) if settings.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def list_teams(request):
    """
    Get all response teams
    """
    try:
        teams = ResponseTeam.objects.all().order_by('-created_at')
        serializer = ResponseTeamSerializer(teams, many=True)
        return Response({
            'teams': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"List teams error: {str(e)}")
        return Response({
            'detail': 'An error occurred while fetching teams.',
            'error': str(e) if settings.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_team(request):
    """
    Create a new response team
    """
    try:
        serializer = ResponseTeamSerializer(data=request.data)
        if serializer.is_valid():
            team = serializer.save()
            return Response({
                'message': 'Team created successfully',
                'team': ResponseTeamSerializer(team).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'detail': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Create team error: {str(e)}")
        return Response({
            'detail': 'An error occurred while creating team.',
            'error': str(e) if settings.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def assign_team_to_report(request, report_id):
    """
    Assign a team to a report
    """
    try:
        team_id = request.data.get('team_id')
        
        if not team_id:
            return Response({
                'detail': 'team_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            report = CitizenReport.objects.get(id=report_id)
        except CitizenReport.DoesNotExist:
            return Response({
                'detail': 'Report not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        try:
            team = ResponseTeam.objects.get(id=team_id)
        except ResponseTeam.DoesNotExist:
            return Response({
                'detail': 'Team not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        report.assigned_team = team
        # Change status to 'reviewed' (in-progress) when team is assigned
        report.status = 'reviewed'
        report.save()
        
        serializer = CitizenReportSerializer(report)
        return Response({
            'message': 'Team assigned successfully',
            'report': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Assign team error: {str(e)}")
        return Response({
            'detail': 'An error occurred while assigning team.',
            'error': str(e) if settings.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def complete_report(request, report_id):
    """
    Mark a report as completed and record completion details
    """
    try:
        notes = request.data.get('notes', '').strip()

        try:
            report = CitizenReport.objects.get(id=report_id)
        except CitizenReport.DoesNotExist:
            return Response({
                'detail': 'Report not found'
            }, status=status.HTTP_404_NOT_FOUND)

        report.status = 'resolved'
        report.save()

        completed_task, _ = CompletedTask.objects.update_or_create(
            report=report,
            defaults={'notes': notes}
        )

        serializer = CitizenReportSerializer(report)

        return Response({
            'message': 'Report marked as completed',
            'report': serializer.data,
            'completed_task': CompletedTaskSerializer(completed_task).data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Complete report error: {str(e)}")
        return Response({
            'detail': 'An error occurred while completing the report.',
            'error': str(e) if settings.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_report(request, report_id):
    """
    Delete a citizen report along with any associated media files.
    """
    try:
        try:
            report = CitizenReport.objects.get(id=report_id)
        except CitizenReport.DoesNotExist:
            return Response({
                'detail': 'Report not found'
            }, status=status.HTTP_404_NOT_FOUND)

        image_name = report.image.name if report.image else None
        audio_name = report.audio.name if report.audio else None

        report.delete()

        for file_name in (image_name, audio_name):
            if file_name:
                try:
                    if default_storage.exists(file_name):
                        default_storage.delete(file_name)
                except Exception:
                    # Ignore storage deletion errors to avoid failing the request
                    pass

        return Response({
            'message': 'Report deleted successfully'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Delete report error: {str(e)}")
        return Response({
            'detail': 'An error occurred while deleting the report.',
            'error': str(e) if settings.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

