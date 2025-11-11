from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import AnonymousUser
from .models import Admin, AdminToken


class AdminTokenAuthentication(BaseAuthentication):
    """
    Custom authentication class that supports both Admin and User tokens
    This handles authentication for both Admin (from Admin table) and User (from User table)
    """
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        # If no authorization header, return None to let other auth classes try
        if not auth_header or not auth_header.startswith('Token '):
            return None
        
        token_key = auth_header.split(' ')[1] if len(auth_header.split(' ')) > 1 else ''
        
        if not token_key:
            return None
        
        # First, try to find an AdminToken
        try:
            admin_token = AdminToken.objects.select_related('admin').get(key=token_key)
            admin = admin_token.admin
            if not admin.is_active:
                raise AuthenticationFailed('Admin account is disabled.')
            # Return admin as the user and token as the auth object
            return (admin, admin_token)
        except AdminToken.DoesNotExist:
            pass
        
        # If not an admin token, try regular user token
        try:
            token = Token.objects.select_related('user').get(key=token_key)
            user = token.user
            if not user.is_active:
                raise AuthenticationFailed('User account is disabled.')
            return (user, token)
        except Token.DoesNotExist:
            # Token not found in either table
            raise AuthenticationFailed('Invalid token.')
    
    def authenticate_header(self, request):
        return 'Token'

