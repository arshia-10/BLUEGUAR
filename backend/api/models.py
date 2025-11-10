from django.db import models
from django.contrib.auth.models import AbstractUser, User
from django.contrib.auth.hashers import make_password


# Add your models here
# Example models for BlueGuard AI Vision:

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
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
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
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    image = models.ImageField(upload_to='reports/', null=True, blank=True)
    status = models.CharField(max_length=50, choices=[
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('resolved', 'Resolved'),
    ], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Report from {self.reporter_name} at {self.location}"

