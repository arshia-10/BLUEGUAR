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
    path('auth/otp/generate/', views.generate_otp, name='generate-otp'),
    path('auth/otp/verify/', views.verify_otp, name='verify-otp'),
    path('reports/create/', views.create_report, name='create-report'),
    path('reports/', views.get_reports, name='get-reports'),
    path('reports/count/', views.get_report_count, name='get-report-count'),
    path('reports/all/', views.get_all_reports, name='get-all-reports'),
    path('reports/<int:report_id>/assign-team/', views.assign_team_to_report, name='assign-team-to-report'),
    path('reports/<int:report_id>/complete/', views.complete_report, name='complete-report'),
    path('reports/<int:report_id>/delete/', views.delete_report, name='delete-report'),
    path('teams/', views.list_teams, name='list-teams'),
    path('teams/create/', views.create_team, name='create-team'),
    path('debug/request/', views.debug_request, name='debug-request'),
    path('chatbot/query/', views.chatbot_query, name='chatbot-query'),
]

