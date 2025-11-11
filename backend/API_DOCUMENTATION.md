# BlueGuard AI Vision - API Documentation

## Authentication Endpoints

### 1. Admin Signup
**Endpoint:** `POST /api/auth/signup/admin/`

**Description:** Register a new admin user

**Request Body:**
```json
{
  "username": "adminuser",
  "email": "admin@example.com",
  "password": "password123",
  "first_name": "Admin",
  "last_name": "User",
  "phone_number": "1234567890",
  "address": "123 Admin Street"
}
```

**Response (201 Created):**
```json
{
  "message": "Admin account created successfully",
  "user": {
    "id": 1,
    "username": "adminuser",
    "email": "admin@example.com",
    "user_type": "admin"
  },
  "token": "your-auth-token-here"
}
```

---

### 2. Citizen Signup
**Endpoint:** `POST /api/auth/signup/citizen/`

**Description:** Register a new citizen user

**Request Body:**
```json
{
  "username": "citizenuser",
  "email": "citizen@example.com",
  "password": "password123",
  "first_name": "Citizen",
  "last_name": "User",
  "phone_number": "1234567890",
  "address": "123 Citizen Street"
}
```

**Response (201 Created):**
```json
{
  "message": "Citizen account created successfully",
  "user": {
    "id": 2,
    "username": "citizenuser",
    "email": "citizen@example.com",
    "user_type": "citizen"
  },
  "token": "your-auth-token-here"
}
```

---

### 3. Login
**Endpoint:** `POST /api/auth/login/`

**Description:** Login with username and password

**Request Body:**
```json
{
  "username": "adminuser",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "adminuser",
    "email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "User",
    "user_type": "admin",
    "is_staff": true
  },
  "token": "your-auth-token-here"
}
```

**Note:** The `user_type` field will be either `"admin"` or `"citizen"` to identify the user type.

---

### 4. Logout
**Endpoint:** `POST /api/auth/logout/`

**Description:** Logout and invalidate the current token

**Headers:**
```
Authorization: Token your-auth-token-here
```

**Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

---

### 5. Get User Info
**Endpoint:** `GET /api/auth/user/`

**Description:** Get current authenticated user information

**Headers:**
```
Authorization: Token your-auth-token-here
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "adminuser",
    "email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "User",
    "user_type": "admin",
    "is_staff": true
  }
}
```

---

## Usage Examples

### Using cURL

#### Citizen Signup:
```bash
curl -X POST http://localhost:8000/api/auth/signup/citizen/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

#### Admin Signup:
```bash
curl -X POST http://localhost:8000/api/auth/signup/admin/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_jane",
    "email": "jane@example.com",
    "password": "securepassword123",
    "first_name": "Jane",
    "last_name": "Admin"
  }'
```

#### Login:
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "securepassword123"
  }'
```

#### Get User Info (Authenticated):
```bash
curl -X GET http://localhost:8000/api/auth/user/ \
  -H "Authorization: Token your-auth-token-here"
```

---

### Using JavaScript/Fetch

#### Citizen Signup:
```javascript
fetch('http://localhost:8000/api/auth/signup/citizen/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'john_doe',
    email: 'john@example.com',
    password: 'securepassword123',
    first_name: 'John',
    last_name: 'Doe'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Signup successful:', data);
  // Store the token: data.token
  // Check user type: data.user.user_type ('citizen' or 'admin')
})
.catch(error => console.error('Error:', error));
```

#### Login:
```javascript
fetch('http://localhost:8000/api/auth/login/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'john_doe',
    password: 'securepassword123'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Login successful:', data);
  localStorage.setItem('token', data.token);
  localStorage.setItem('userType', data.user.user_type);
  
  // Redirect based on user type
  if (data.user.user_type === 'admin') {
    window.location.href = '/admin';
  } else {
    window.location.href = '/citizen';
  }
})
.catch(error => console.error('Error:', error));
```

#### Get User Info:
```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:8000/api/auth/user/', {
  method: 'GET',
  headers: {
    'Authorization': `Token ${token}`
  }
})
.then(response => response.json())
.then(data => {
  console.log('User info:', data.user);
})
.catch(error => console.error('Error:', error));
```

---

## User Types

- **admin**: Admin users have `is_staff=True` and can access admin features
- **citizen**: Regular citizen users who can submit reports

## Token Authentication

All authenticated endpoints require the token to be sent in the Authorization header:
```
Authorization: Token your-auth-token-here
```

Store the token after signup/login and include it in all authenticated requests.

---

## Error Responses

### 400 Bad Request
```json
{
  "username": ["Username already exists."],
  "email": ["Email already exists."],
  "password": ["This field is required."]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

## Database Schema

### UserProfile Model
- `user`: OneToOne relationship with Django User
- `user_type`: Choices: 'admin' or 'citizen'
- `phone_number`: Optional phone number
- `address`: Optional address
- `created_at`: Timestamp
- `updated_at`: Timestamp

### User Model (Django Default)
- `username`: Unique username
- `email`: Email address
- `password`: Hashed password
- `first_name`: First name
- `last_name`: Last name
- `is_staff`: Boolean (True for admin users)










