from django.urls import path
from . import views

urlpatterns = [
    path('', views.api_root, name='api-root'),
    path('auth/signup/admin/', views.admin_signup, name='admin-signup'),
    path('auth/signup/citizen/', views.citizen_signup, name='citizen-signup'),
    path('auth/login/', views.user_login, name='user-login'),
    path('auth/logout/', views.user_logout, name='user-logout'),
    path('auth/user/', views.user_info, name='user-info'),
    path('auth/change-password/', views.change_password, name='change-password'),
    path('reports/create/', views.create_report, name='create-report'),
    path('reports/', views.get_reports, name='get-reports'),
]

