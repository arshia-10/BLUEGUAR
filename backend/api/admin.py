from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Admin, AdminToken, UserProfile, FloodAlert, CitizenReport


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


@admin.register(Admin)
class AdminAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_active', 'last_login', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone_number']
    readonly_fields = ['created_at', 'updated_at', 'last_login']
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone_number', 'address')}),
        ('Status', {'fields': ('is_active',)}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    def save_model(self, request, obj, form, change):
        # If password was changed in admin, hash it
        if 'password' in form.changed_data:
            obj.set_password(form.cleaned_data['password'])
        super().save_model(request, obj, form, change)


@admin.register(AdminToken)
class AdminTokenAdmin(admin.ModelAdmin):
    list_display = ['admin', 'key', 'created']
    search_fields = ['admin__username', 'key']
    readonly_fields = ['key', 'created']
    
    def has_add_permission(self, request):
        # Tokens are created automatically, so don't allow manual creation
        return False


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

