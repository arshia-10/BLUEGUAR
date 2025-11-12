# BlueGuard AI Vision - Backend

Django REST API backend for BlueGuard AI Vision project.

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   # On Windows
   python -m venv venv
   venv\Scripts\activate

   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run database migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create a superuser (optional, for admin access):**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run the development server:**
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/`

## API Endpoints

- `GET /api/` - API root endpoint
- `GET /admin/` - Django admin panel

## Database

The project uses SQLite database by default. The database file (`db.sqlite3`) will be created automatically when you run migrations.

## Project Structure

```
backend/
├── api/                    # API application
│   ├── models.py          # Database models
│   ├── views.py           # API views
│   ├── urls.py            # API URL routes
│   └── admin.py           # Admin panel configuration
├── blueguard_backend/     # Main Django project
│   ├── settings.py        # Django settings
│   ├── urls.py            # Main URL configuration
│   ├── wsgi.py            # WSGI configuration
│   └── asgi.py            # ASGI configuration
├── manage.py              # Django management script
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## Models

### FloodAlert
- Represents flood alerts with location, severity, and coordinates
- Fields: location, severity, description, latitude, longitude, created_at, updated_at, is_active

### CitizenReport
- Represents citizen reports about flood incidents
- Fields: reporter_name, reporter_email, location, description, latitude, longitude, image, status, created_at, updated_at

## CORS Configuration

The backend is configured to allow requests from the React frontend running on `http://localhost:8080`. You can modify CORS settings in `blueguard_backend/settings.py`.

## Development

- Make sure to activate your virtual environment before running commands
- Use `python manage.py makemigrations` after modifying models
- Use `python manage.py migrate` to apply database changes
- Access the admin panel at `http://localhost:8000/admin/` after creating a superuser

## Environment Variables

For production, create a `.env` file in the backend directory and set:
- `SECRET_KEY` - Django secret key
- `DEBUG` - Set to `False` in production
- `ALLOWED_HOSTS` - List of allowed hostnames














