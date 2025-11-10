from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile, FloodAlert, CitizenReport


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'


class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    
    def get_inline_instances(self, request, obj=None):
        if not obj:
            return list()
        return super().get_inline_instances(request, obj)


admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'user_type', 'phone_number', 'created_at']
    list_filter = ['user_type', 'created_at']
    search_fields = ['user__username', 'user__email', 'phone_number']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(FloodAlert)
class FloodAlertAdmin(admin.ModelAdmin):
    list_display = ['location', 'severity', 'is_active', 'created_at']
    list_filter = ['severity', 'is_active', 'created_at']
    search_fields = ['location', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(CitizenReport)
class CitizenReportAdmin(admin.ModelAdmin):
    list_display = ['reporter_name', 'location', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['reporter_name', 'location', 'description']
    readonly_fields = ['created_at', 'updated_at']

