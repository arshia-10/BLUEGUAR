from django.db import models
from django.contrib.auth.models import AbstractUser, User
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
import secrets


# Add your models here
# Example models for BlueGuard AI Vision:

class Admin(models.Model):
    """Separate Admin model for admin users"""
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  # Hashed password
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    aadhaar_card = models.ImageField(upload_to='aadhaar/admin/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    @property
    def is_authenticated(self):
        # Required by Django/DRF permission checks
        return True
    
    @property
    def is_anonymous(self):
        return False
    
    def set_password(self, raw_password):
        """Hash and set the password"""
        self.password = make_password(raw_password)
    
    def check_password(self, raw_password):
        """Check if the provided password matches"""
        return check_password(raw_password, self.password)
    
    def save(self, *args, **kwargs):
        # Always ensure password is hashed - but only if it's a new object or password changed
        # We'll handle password setting through set_password method to avoid double hashing
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.username} - Admin"
    
    class Meta:
        verbose_name = "Admin"
        verbose_name_plural = "Admins"
        ordering = ['-created_at']


class AdminToken(models.Model):
    """Token model for Admin authentication"""
    admin = models.OneToOneField(Admin, on_delete=models.CASCADE, related_name='auth_token')
    key = models.CharField(max_length=64, unique=True)
    created = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if not self.key:
            self.key = self.generate_key()
        return super().save(*args, **kwargs)
    
    def generate_key(self):
        # Generate a 40-character token (similar to Django's Token model)
        return secrets.token_urlsafe(30)[:40]
    
    def __str__(self):
        return f"Token for {self.admin.username}"
    
    class Meta:
        verbose_name = "Admin Token"
        verbose_name_plural = "Admin Tokens"


class UserProfile(models.Model):
    """Extended user profile with user type"""
    USER_TYPE_CHOICES = [
        ('admin', 'Admin'),
        ('citizen', 'Citizen'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='citizen')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    aadhaar_card = models.ImageField(upload_to='aadhaar/citizen/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.user_type}"
    
    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"

class FloodAlert(models.Model):
    """Model for flood alerts"""
    location = models.CharField(max_length=255)
    severity = models.CharField(max_length=50, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ])
    description = models.TextField()
    latitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.location} - {self.severity}"


class CitizenReport(models.Model):
    """Model for citizen reports"""
    reporter_name = models.CharField(max_length=255)
    reporter_email = models.EmailField()
    location = models.CharField(max_length=255)
    description = models.TextField()
    latitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    image = models.ImageField(upload_to='reports/images/', null=True, blank=True)
    audio = models.FileField(upload_to='reports/audio/', null=True, blank=True)
    status = models.CharField(max_length=50, choices=[
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('resolved', 'Resolved'),
    ], default='pending')
    assigned_team = models.ForeignKey('ResponseTeam', on_delete=models.SET_NULL, null=True, blank=True, related_name='reports')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Report from {self.reporter_name} at {self.location}"


class CompletedTask(models.Model):
    """Tracks reports that have been completed"""
    report = models.OneToOneField(CitizenReport, on_delete=models.CASCADE, related_name='completed_task')
    notes = models.TextField(blank=True)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-completed_at']

    def __str__(self):
        return f"Completed task for report #{self.report_id}"


class ReportUpvote(models.Model):
    """Track which users upvoted which reports"""
    report = models.ForeignKey(CitizenReport, on_delete=models.CASCADE, related_name='upvotes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='report_upvotes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('report', 'user')
        indexes = [
            models.Index(fields=['report', 'user']),
        ]

    def __str__(self):
        return f"Upvote by {self.user.username} on report {self.report_id}"

class OTP(models.Model):
    """OTP model for email/phone verification"""
    email = models.EmailField()
    otp_code = models.CharField(max_length=6)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email', 'otp_code']),
        ]
    
    def __str__(self):
        return f"OTP for {self.email} - {self.otp_code}"
    
    def is_expired(self):
        return timezone.now() > self.expires_at


class ResponseTeam(models.Model):
    """Response teams for admin panel"""
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Deployed', 'Deployed'),
        ('Standby', 'Standby'),
    ]
    name = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.status}"

