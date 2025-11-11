"""
Script to check database structure
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blueguard_backend.settings')
django.setup()

from django.db import connection
from api.models import CitizenReport, Admin, AdminToken, UserProfile

def check_database():
    print("=" * 60)
    print("DATABASE STRUCTURE CHECK")
    print("=" * 60)
    
    # Check all tables
    cursor = connection.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    
    print("\nAll Database Tables:")
    for table in sorted(tables):
        print(f"  [OK] {table}")
    
    # Check CitizenReport table structure
    print("\nCitizenReport Table Structure:")
    cursor.execute("PRAGMA table_info(api_citizenreport)")
    columns = cursor.fetchall()
    for col in columns:
        col_name = col[1]
        col_type = col[2]
        nullable = "NULL" if not col[3] else "NOT NULL"
        default = f" DEFAULT {col[4]}" if col[4] else ""
        print(f"  - {col_name}: {col_type} {nullable}{default}")
    
    # Check Admin table
    print("\nAdmin Table Structure:")
    cursor.execute("PRAGMA table_info(api_admin)")
    columns = cursor.fetchall()
    for col in columns:
        col_name = col[1]
        col_type = col[2]
        nullable = "NULL" if not col[3] else "NOT NULL"
        print(f"  - {col_name}: {col_type} {nullable}")
    
    # Count records
    print("\nRecord Counts:")
    print(f"  - Citizen Reports: {CitizenReport.objects.count()}")
    print(f"  - Admins: {Admin.objects.count()}")
    print(f"  - Admin Tokens: {AdminToken.objects.count()}")
    print(f"  - User Profiles: {UserProfile.objects.count()}")
    
    print("\n" + "=" * 60)
    print("[SUCCESS] Database is ready!")
    print("=" * 60)

if __name__ == "__main__":
    check_database()

