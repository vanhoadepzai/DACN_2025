# Complete Frontend Application - API & Database Requirements Documentation

## Project Information
- **Application Name:** TuTi - Urban Incident Reporting System
- **Type:** React Native (Expo) Mobile Application
- **API Base URL:** `http://10.0.2.2:5218/api`
- **Target Platform:** Android & iOS
- **Language:** TypeScript/JavaScript
- **Purpose:** Municipal incident reporting and management system for citizens, staff, and administrators

---

## Table of Contents

1. [Authentication System](#1-authentication-system)
2. [User Management & Profile](#2-user-management--profile)
3. [User Settings & Preferences](#3-user-settings--preferences)
4. [Incident Reporting System](#4-incident-reporting-system)
5. [Admin Dashboard & Management](#5-admin-dashboard--management)
6. [Staff Management System](#6-staff-management-system)
7. [Support & Feedback System](#7-support--feedback-system)
8. [Location Services](#8-location-services)
9. [Complete Database Schema](#9-complete-database-schema)
10. [API Endpoints Summary](#10-api-endpoints-summary)
11. [Error Handling & Validation](#11-error-handling--validation)
12. [Security & Authorization](#12-security--authorization)

---

## 1. AUTHENTICATION SYSTEM

### 1.1 User Login

**Frontend File:** `app/Accounts/Login.tsx`

**Current Mock Data:**
```json
[
  { "email": "admin@gmail.com", "password": "123456", "role": "Admin", "name": "quản trị viên" },
  { "email": "vanhoadepzai@gmail.com", "password": "123456", "role": "User", "name": "người dùng" },
  { "email": "v", "password": "123456", "role": "User", "name": "người dùng" },
  { "email": "nhanvien", "password": "123456", "role": "employyer", "name": "Nhân viên" }
]
```

#### Required API Endpoint:

**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "string (required, email format)",
  "password": "string (required, min 6 characters)"
}
```

**Success Response (200 OK):**
```json
{
  "token": "JWT_TOKEN_STRING",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "Nguyễn Văn A",
    "role": "User | Admin | Staff",
    "avatar": "https://...",
    "createdAt": "2025-11-30T10:00:00Z"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Email hoặc mật khẩu không đúng",
  "code": "INVALID_CREDENTIALS"
}
```

#### Database Requirements:

**Users Table:**
- Must support email/password authentication
- Store hashed passwords (BCrypt or similar)
- Role field with values: "User", "Admin", "Staff"
- JWT token generation

#### Business Logic:
- Validate email format
- Password minimum 6 characters
- Return JWT token valid for 24 hours
- Role-based routing:
  - Admin → Admin Dashboard
  - User → User Home Page
  - Staff → Staff Dashboard

---

### 1.2 User Registration

**Frontend File:** `app/Accounts/Register.tsx`

#### Required API Endpoint:

**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "string (required, 2-100 characters)",
  "email": "string (required, unique, email format)",
  "password": "string (required, min 6 characters)",
  "confirmPassword": "string (must match password)"
}
```

**Success Response (201 Created):**
```json
{
  "message": "Đăng ký thành công! Xin chào người dùng",
  "user": {
    "id": 124,
    "email": "newuser@example.com",
    "name": "Người dùng mới",
    "role": "User",
    "createdAt": "2025-11-30T10:00:00Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Email đã được sử dụng",
  "code": "EMAIL_EXISTS"
}
```

#### Database Requirements:

**Users Table Operations:**
- Check email uniqueness before insert
- Hash password before storage
- Auto-assign role "User" for new registrations
- Generate default avatar or use placeholder

#### Validation Rules:
- Name: 2-100 characters, required
- Email: Valid format, unique in database
- Password: Min 6 characters, max 100 characters
- Password confirmation must match

---

## 2. USER MANAGEMENT & PROFILE

### 2.1 View User Profile

**Frontend File:** `app/SettingsUser/Profile.tsx`

**Current Mock Data:**
```json
{
  "name": "Võ Văn Hòa",
  "email": "hoaxeom@example.com",
  "gender": "Nam",
  "dateOfBirth": "25/10/2003",
  "phoneNumber": "0901234567",
  "address": "TP. Hồ Chí Minh",
  "avatar": "https://i.pravatar.cc/150?img=3"
}
```

#### Required API Endpoint:

**GET** `/users/profile`

**Authentication:** Required (JWT Bearer Token)

**Success Response (200 OK):**
```json
{
  "id": 123,
  "name": "Võ Văn Hòa",
  "email": "hoaxeom@example.com",
  "gender": "Nam | Nữ | Khác",
  "dateOfBirth": "2003-10-25",
  "phoneNumber": "0901234567",
  "address": "TP. Hồ Chí Minh",
  "avatar": "https://storage.example.com/avatars/123.jpg",
  "role": "User",
  "createdAt": "2025-01-15T08:00:00Z",
  "updatedAt": "2025-11-30T10:00:00Z"
}
```

#### Database Requirements:

**Users Table Fields:**
- id (PRIMARY KEY)
- name (NVARCHAR)
- email (NVARCHAR, UNIQUE)
- password (NVARCHAR, hashed)
- gender (NVARCHAR) - "Nam", "Nữ", "Khác"
- dateOfBirth (DATE)
- phoneNumber (NVARCHAR)
- address (NVARCHAR)
- avatar (NVARCHAR, URL)
- role (NVARCHAR)
- createdAt (DATETIME)
- updatedAt (DATETIME)

---

### 2.2 Update User Profile

**Frontend File:** `app/SettingsUser/editProfile.tsx`

#### Required API Endpoint:

**PUT** `/users/profile`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "string (optional)",
  "phoneNumber": "string (optional)",
  "email": "string (optional, must be unique)",
  "gender": "Nam | Nữ | Khác (optional)",
  "dateOfBirth": "YYYY-MM-DD (optional)",
  "address": "string (optional)"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Thông tin cá nhân đã được cập nhật!",
  "user": {
    "id": 123,
    "name": "Võ Văn Hòa",
    "email": "hoaxeom@example.com",
    "phoneNumber": "0909123456",
    "updatedAt": "2025-11-30T10:00:00Z"
  }
}
```

#### Validation Rules:
- Email must be unique if changed
- Phone number format: Vietnamese (10-11 digits, starts with 0)
- Name: 2-100 characters
- Date of birth: Valid date, user must be at least 13 years old

---

### 2.3 Change Password

**Frontend File:** `app/SettingsUser/ChangePassword.tsx`

#### Required API Endpoint:

**POST** `/users/change-password`

**Authentication:** Required

**Request Body:**
```json
{
  "oldPassword": "string (required)",
  "newPassword": "string (required, min 6 characters)",
  "confirmNewPassword": "string (must match newPassword)"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Mật khẩu đã được thay đổi thành công"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Mật khẩu cũ không đúng",
  "code": "INVALID_OLD_PASSWORD"
}
```

#### Business Logic:
- Verify old password matches current password hash
- New password must be different from old password
- Hash new password before storage
- Update `updatedAt` timestamp
- Optionally invalidate old JWT tokens (force re-login)

---

### 2.4 Upload Avatar

**Required API Endpoint:**

**POST** `/users/avatar`

**Authentication:** Required

**Request:** `multipart/form-data`
- File: image file (jpg, png, max 5MB)

**Success Response (200 OK):**
```json
{
  "avatarUrl": "https://storage.example.com/avatars/123.jpg",
  "message": "Avatar đã được cập nhật"
}
```

#### Storage Requirements:
- Store files in cloud storage or wwwroot
- Generate unique filenames (userId + timestamp)
- Create thumbnail version (150x150px)
- Validate file type (jpg, png only)
- Max file size: 5MB
- Delete old avatar when uploading new one

---

## 3. USER SETTINGS & PREFERENCES

### 3.1 User Preferences

**Frontend File:** `app/pageUser/settings.tsx`

**Current State Variables:**
```json
{
  "notificationsEnabled": true,
  "darkModeEnabled": false,
  "locationEnabled": true
}
```

#### Required API Endpoints:

**GET** `/users/preferences`

**Authentication:** Required

**Success Response (200 OK):**
```json
{
  "userId": 123,
  "notificationsEnabled": true,
  "darkModeEnabled": false,
  "locationEnabled": true,
  "language": "vi",
  "updatedAt": "2025-11-30T10:00:00Z"
}
```

**PUT** `/users/preferences`

**Request Body:**
```json
{
  "notificationsEnabled": "boolean (optional)",
  "darkModeEnabled": "boolean (optional)",
  "locationEnabled": "boolean (optional)",
  "language": "string (optional, vi|en)"
}
```

#### Database Requirements:

**UserPreferences Table:**
- id (PRIMARY KEY)
- userId (FOREIGN KEY to Users.id)
- notificationsEnabled (BIT, DEFAULT 1)
- darkModeEnabled (BIT, DEFAULT 0)
- locationEnabled (BIT, DEFAULT 1)
- language (NVARCHAR, DEFAULT 'vi')
- createdAt (DATETIME)
- updatedAt (DATETIME)

**Relationship:** One-to-One with Users table

---

### 3.2 Logout

**Frontend Logic:** Clears AsyncStorage and navigates to login

**No Backend API Required** - Frontend handles token removal

---

## 4. INCIDENT REPORTING SYSTEM

### 4.1 Create New Incident

**Frontend File:** `app/pageUser/modal.tsx`

**Form Fields:**
```json
{
  "type": "Hư hỏng đường sá | Mất điện | Cấp nước | Vệ sinh môi trường | Cây xanh | Khác",
  "title": "string (required, max 200 chars)",
  "description": "string (required)",
  "address": "string (required, max 500 chars)",
  "photoUrls": ["array of strings (optional)"]
}
```

#### Required API Endpoint:

**POST** `/incidents`

**Authentication:** Required

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "title": "Hố sâu đường Nguyễn Văn Linh",
  "description": "Có hố sâu khoảng 30cm trên đường Nguyễn Văn Linh, đoạn gần ngã tư Trần Xuân Soạn",
  "category": "Hư hỏng đường sá",
  "address": "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
  "latitude": 10.729500,
  "longitude": 106.719700,
  "photoUrls": []
}
```

**Success Response (201 Created):**
```json
{
  "id": 123,
  "title": "Hố sâu đường Nguyễn Văn Linh",
  "description": "Có hố sâu khoảng 30cm...",
  "category": "Hư hỏng đường sá",
  "status": "pending",
  "priority": "Trung bình",
  "address": "123 Nguyễn Văn Linh, Quận 7",
  "latitude": 10.729500,
  "longitude": 106.719700,
  "userId": 456,
  "assignedToStaffId": null,
  "photoUrls": [],
  "progress": 0,
  "createdAt": "2025-11-30T10:30:00Z",
  "updatedAt": null,
  "resolvedAt": null
}
```

---

### 4.2 Get User's Incidents

**Frontend File:** `app/pageUser/HomePage.tsx`

**Current Mock Data:** 6 incidents with various statuses

#### Required API Endpoint:

**GET** `/incidents/my-incidents`

**Authentication:** Required

**Query Parameters:**
```
?status=pending|received|resolved (optional)
&search=string (optional, search in title/description)
```

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Hố sâu đường",
    "description": "Đường bị hư hỏng nặng tạo thành hố sâu nguy hiểm",
    "status": "resolved",
    "createdAt": "2025-10-05T08:00:00Z",
    "updatedAt": "2025-10-10T15:00:00Z",
    "category": "Hư hỏng đường sá",
    "address": "Đường ABC, Quận 1",
    "priority": "Cao"
  },
  {
    "id": 2,
    "title": "Cây đổ chắn đường",
    "description": "Cây xanh bị đổ sau cơn bão, chắn lối đi lại",
    "status": "pending",
    "createdAt": "2025-10-04T09:00:00Z",
    "updatedAt": "2025-11-03T10:00:00Z",
    "category": "Cây xanh",
    "address": "Đường XYZ, Quận 5",
    "priority": "Cao"
  }
]
```

---

### 4.3 Get Incident Statistics

**Frontend File:** `app/pageUser/HomePage.tsx`

**Current Display:** Total, Resolved, Pending counts

#### Required API Endpoint:

**GET** `/incidents/statistics`

**Authentication:** Required

**Query Parameters:**
```
?userId=123 (optional, defaults to current user)
&dateFrom=2025-11-01 (optional)
&dateTo=2025-11-30 (optional)
```

**Success Response (200 OK):**
```json
{
  "userId": 123,
  "total": 15,
  "pending": 5,
  "received": 4,
  "resolved": 6,
  "todayTotal": 2,
  "thisWeekTotal": 8,
  "thisMonthTotal": 15,
  "byCategory": {
    "Hư hỏng đường sá": 6,
    "Mất điện": 3,
    "Cấp nước": 2,
    "Vệ sinh môi trường": 2,
    "Cây xanh": 1,
    "Khác": 1
  }
}
```

---

### 4.4 Get Incident Detail

**Frontend File:** `app/incident/[id].tsx` (Currently placeholder)

#### Required API Endpoint:

**GET** `/incidents/{id}`

**Authentication:** Required

**Success Response (200 OK):**
```json
{
  "id": 123,
  "title": "Hố sâu đường Nguyễn Văn Linh",
  "description": "Có hố sâu khoảng 30cm...",
  "category": "Hư hỏng đường sá",
  "status": "received",
  "priority": "Cao",
  "address": "123 Nguyễn Văn Linh, Quận 7",
  "latitude": 10.729500,
  "longitude": 106.719700,
  "userId": 456,
  "userName": "Nguyễn Văn A",
  "userAvatar": "https://...",
  "assignedToStaffId": 789,
  "assignedStaffName": "Trần Văn B",
  "photoUrls": ["https://...", "https://..."],
  "progress": 50,
  "createdAt": "2025-11-30T10:30:00Z",
  "updatedAt": "2025-11-30T14:00:00Z",
  "resolvedAt": null,
  "history": [
    {
      "action": "created",
      "timestamp": "2025-11-30T10:30:00Z",
      "performedBy": "Nguyễn Văn A",
      "description": "Sự cố được báo cáo"
    },
    {
      "action": "assigned",
      "timestamp": "2025-11-30T11:00:00Z",
      "performedBy": "Admin",
      "description": "Phân công cho Trần Văn B"
    }
  ]
}
```

---

### 4.5 Get Incidents on Map

**Frontend File:** `app/pageUser/map.tsx`

**Current Mock Data:** 3 incidents with lat/lon coordinates

#### Required API Endpoint:

**GET** `/incidents/map`

**Authentication:** Required

**Query Parameters:**
```
?latitude=10.7765 (optional, user's current location)
&longitude=106.7009 (optional, user's current location)
&radius=50 (optional, radius in km, default 50)
&status=pending|received|resolved (optional, multiple allowed)
```

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Cây ngã giữa đường",
    "status": "pending",
    "latitude": 10.7765,
    "longitude": 106.7009,
    "createdAt": "2025-10-25T08:30:00Z",
    "category": "Cây xanh",
    "priority": "Cao"
  },
  {
    "id": 2,
    "title": "Ngập nước tại Nguyễn Huệ",
    "status": "resolved",
    "latitude": 10.7723,
    "longitude": 106.7034,
    "createdAt": "2025-10-25T09:15:00Z",
    "category": "Vệ sinh môi trường",
    "priority": "Trung bình"
  }
]
```

#### Business Logic:
- Use Haversine formula to filter incidents within radius
- If no lat/lon provided, return all incidents
- Default radius: 50km
- Order by distance (closest first) if lat/lon provided

---

### 4.6 Upload Incident Photos

#### Required API Endpoint:

**POST** `/incidents/{id}/photos`

**Authentication:** Required

**Request:** `multipart/form-data`
- Files: image files (jpg, png, max 10MB each)
- Max 5 photos per incident

**Success Response (200 OK):**
```json
{
  "photoUrls": [
    "https://storage.example.com/incidents/123/photo1.jpg",
    "https://storage.example.com/incidents/123/photo2.jpg"
  ],
  "message": "Đã tải lên 2 ảnh thành công"
}
```

---

### 4.7 Update Incident (User)

**Frontend:** Users can edit their own pending incidents

#### Required API Endpoint:

**PUT** `/incidents/{id}`

**Authentication:** Required (Owner or Admin only)

**Request Body:**
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "category": "string (optional)",
  "address": "string (optional)",
  "latitude": "number (optional)",
  "longitude": "number (optional)"
}
```

**Success Response (200 OK):**
```json
{
  "id": 123,
  "title": "Updated title",
  "updatedAt": "2025-11-30T16:00:00Z"
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": "Không thể chỉnh sửa sự cố đã được xử lý",
  "code": "CANNOT_EDIT_PROCESSED_INCIDENT"
}
```

#### Business Logic:
- Only allow updates if status is "pending"
- Only incident owner or admin can update
- Cannot update status, priority, or assignment via this endpoint

---

### 4.8 Delete Incident

#### Required API Endpoint:

**DELETE** `/incidents/{id}`

**Authentication:** Required (Owner or Admin only)

**Success Response (204 No Content)**

**Error Response (403 Forbidden):**
```json
{
  "error": "Không thể xóa sự cố đã được phân công",
  "code": "CANNOT_DELETE_ASSIGNED_INCIDENT"
}
```

#### Business Logic:
- Users can only delete their own pending incidents
- Admin can delete any incident
- Cannot delete if status is not "pending"

---

## 5. ADMIN DASHBOARD & MANAGEMENT

### 5.1 Admin Dashboard Statistics

**Frontend File:** `app/pageAdmin/HomeAdmin.tsx`

**Current Mock Data:**
```json
{
  "totalIncidents": 156,
  "pendingIncidents": 12,
  "inProgressIncidents": 8,
  "completedIncidents": 136,
  "incidentsByDay": {...},
  "incidentsByCategory": {...},
  "recentIncidents": [...]
}
```

#### Required API Endpoint:

**GET** `/admin/dashboard`

**Authentication:** Required (Admin only)

**Query Parameters:**
```
?period=tuần|tháng|năm (optional, default: tuần)
```

**Success Response (200 OK):**
```json
{
  "statistics": {
    "totalIncidents": 156,
    "pendingIncidents": 12,
    "inProgressIncidents": 8,
    "completedIncidents": 136
  },
  "incidentsByDay": {
    "T2": 22,
    "T3": 18,
    "T4": 25,
    "T5": 20,
    "T6": 15,
    "T7": 10,
    "CN": 8
  },
  "incidentsByCategory": {
    "Rác": 30,
    "Hạ tầng": 40,
    "Ngập": 20,
    "Giao thông": 25,
    "Chiếu sáng": 15,
    "Khác": 26
  },
  "statusDistribution": {
    "completed": 136,
    "inProgress": 8,
    "pending": 12
  },
  "recentIncidents": [
    {
      "id": 1,
      "title": "Đèn đường hỏng",
      "category": "Chiếu sáng",
      "status": "Đang xử lý",
      "date": "2025-10-28T08:00:00Z"
    }
  ],
  "staffPerformance": {
    "totalActiveStaff": 15,
    "totalAssignedIncidents": 20,
    "averageResolutionTime": "2.5 days"
  }
}
```

---

### 5.2 Admin - Get All Incidents

**Frontend File:** `app/pageAdmin/staff/Incidents.tsx`

#### Required API Endpoint:

**GET** `/admin/incidents`

**Authentication:** Required (Admin only)

**Query Parameters:**
```
?status=Chờ xử lý|Đang xử lý|Hoàn thành (optional, multiple allowed)
&category=string (optional)
&priority=Cao|Trung bình|Thấp (optional)
&assignedToStaffId=123 (optional)
&dateFrom=2025-11-01 (optional)
&dateTo=2025-11-30 (optional)
&page=1 (optional, default 1)
&pageSize=20 (optional, default 20)
```

**Success Response (200 OK):**
```json
{
  "incidents": [
    {
      "id": 1,
      "title": "Cây ngã đường (Q1)",
      "status": "Chờ xử lý",
      "category": "Hạ tầng",
      "date": "2025-10-29T00:00:00Z",
      "latitude": 10.772,
      "longitude": 106.696,
      "assignedTo": "Chưa phân công",
      "assignedToStaffId": null,
      "priority": "Cao",
      "userId": 456,
      "userName": "Nguyễn Văn A",
      "address": "Đường ABC, Quận 1",
      "progress": 0
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "totalItems": 156,
    "totalPages": 8
  }
}
```

---

### 5.3 Admin - Assign Incident to Staff

**Frontend File:** `app/pageAdmin/staff/Incidents.tsx`

**Frontend Logic:** Calculates nearest staff using Haversine formula

#### Required API Endpoint:

**POST** `/admin/incidents/{id}/assign`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "assignedToStaffId": 789
}
```

**Success Response (200 OK):**
```json
{
  "id": 123,
  "assignedToStaffId": 789,
  "assignedStaffName": "Nguyễn Văn A",
  "status": "Đang xử lý",
  "updatedAt": "2025-11-30T11:00:00Z",
  "message": "Đã phân công sự cố cho Nguyễn Văn A"
}
```

#### Business Logic:
- Verify staff exists and is active
- Automatically change status to "Đang xử lý" (received)
- Update `updatedAt` timestamp
- Send notification to assigned staff
- Record in incident history

---

### 5.4 Admin - Find Nearest Staff

**Frontend File:** `app/pageAdmin/staff/Incidents.tsx`

**Frontend Logic:** Uses Haversine formula to calculate distance

#### Required API Endpoint:

**POST** `/admin/incidents/{id}/find-nearest-staff`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "latitude": 10.7295,
  "longitude": 106.7197
}
```

**Success Response (200 OK):**
```json
{
  "staffId": 789,
  "staffName": "Nguyễn Văn A",
  "staffRole": "Giám sát",
  "distance": 2.5,
  "latitude": 10.7400,
  "longitude": 106.7300,
  "currentAssignedIncidents": 3,
  "isActive": true
}
```

#### Business Logic:
- Calculate distance using Haversine formula
- Only consider staff with `status = "Đang hoạt động"`
- Prioritize staff with fewer assigned incidents
- Return closest available staff
- Include distance in kilometers (2 decimal places)

**Haversine Formula:**
```
a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)
c = 2 * atan2(√a, √(1−a))
distance = R * c (where R = 6371 km)
```

---

### 5.5 Admin - Update Incident Status

**Frontend File:** `app/pageAdmin/staff/Incidents.tsx`

#### Required API Endpoint:

**PATCH** `/admin/incidents/{id}/status`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "status": "Chờ xử lý | Đang xử lý | Hoàn thành"
}
```

**Success Response (200 OK):**
```json
{
  "id": 123,
  "status": "Hoàn thành",
  "updatedAt": "2025-11-30T15:00:00Z",
  "resolvedAt": "2025-11-30T15:00:00Z",
  "progress": 100,
  "message": "Đã đánh dấu sự cố hoàn thành"
}
```

#### Business Logic:
- Update `updatedAt` timestamp
- If status = "Hoàn thành", set `resolvedAt` timestamp and `progress = 100`
- Validate status transition (cannot skip statuses)
- Send notification to incident reporter
- Record in incident history

---

## 6. STAFF MANAGEMENT SYSTEM

### 6.1 Get All Staff Members

**Frontend File:** `app/pageAdmin/staff/Staff.tsx`

**Current Mock Data:**
```json
[
  { "id": 101, "name": "Nguyễn Văn A", "role": "Giám sát", "status": "Đang hoạt động", "lat": 10.760, "lon": 106.690 },
  { "id": 102, "name": "Trần Thị B", "role": "Kỹ thuật", "status": "Nghỉ phép", "lat": 10.745, "lon": 106.665 },
  { "id": 103, "name": "Lê Văn C", "role": "Hành chính", "status": "Đang hoạt động", "lat": 10.785, "lon": 106.715 }
]
```

#### Required API Endpoint:

**GET** `/admin/staff`

**Authentication:** Required (Admin only)

**Query Parameters:**
```
?status=Đang hoạt động|Nghỉ phép|Tạm ngưng (optional)
&role=Giám sát|Kỹ thuật|Hành chính (optional)
```

**Success Response (200 OK):**
```json
[
  {
    "id": 101,
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "role": "Giám sát",
    "status": "Đang hoạt động",
    "latitude": 10.760,
    "longitude": 106.690,
    "phoneNumber": "0901234567",
    "assignedIncidentsCount": 5,
    "createdAt": "2025-01-15T08:00:00Z",
    "avatar": "https://..."
  }
]
```

---

### 6.2 Create Staff Member

**Frontend File:** `app/pageAdmin/staff/Staff.tsx`

#### Required API Endpoint:

**POST** `/admin/staff`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "string (required, 2-100 characters)",
  "email": "string (required, unique)",
  "password": "string (required, min 6 characters)",
  "role": "Giám sát | Kỹ thuật | Hành chính (required)",
  "phoneNumber": "string (optional)",
  "latitude": "number (optional)",
  "longitude": "number (optional)",
  "status": "Đang hoạt động (default)"
}
```

**Success Response (201 Created):**
```json
{
  "id": 104,
  "name": "Phạm Văn D",
  "email": "phamvand@example.com",
  "role": "Kỹ thuật",
  "status": "Đang hoạt động",
  "createdAt": "2025-11-30T10:00:00Z",
  "message": "Đã thêm nhân viên thành công"
}
```

#### Database Requirements:

**Staff Role Values:**
- "Giám sát" (Supervisor)
- "Kỹ thuật" (Technical)
- "Hành chính" (Administrative)

**Staff Status Values:**
- "Đang hoạt động" (Active)
- "Nghỉ phép" (On Leave)
- "Tạm ngưng" (Suspended)

---

### 6.3 Update Staff Member

**Frontend File:** `app/pageAdmin/staff/Staff.tsx`

#### Required API Endpoint:

**PUT** `/admin/staff/{id}`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "string (optional)",
  "email": "string (optional, must be unique)",
  "role": "string (optional)",
  "status": "string (optional)",
  "phoneNumber": "string (optional)",
  "latitude": "number (optional)",
  "longitude": "number (optional)"
}
```

**Success Response (200 OK):**
```json
{
  "id": 101,
  "name": "Nguyễn Văn A",
  "role": "Giám sát",
  "status": "Đang hoạt động",
  "updatedAt": "2025-11-30T10:00:00Z",
  "message": "Đã cập nhật thông tin nhân viên"
}
```

---

### 6.4 Delete Staff Member

**Frontend File:** `app/pageAdmin/staff/Staff.tsx`

#### Required API Endpoint:

**DELETE** `/admin/staff/{id}`

**Authentication:** Required (Admin only)

**Success Response (204 No Content)**

**Error Response (409 Conflict):**
```json
{
  "error": "Không thể xóa nhân viên đang có sự cố được phân công",
  "code": "STAFF_HAS_ASSIGNED_INCIDENTS",
  "assignedIncidentsCount": 5
}
```

#### Business Logic:
- Check if staff has assigned incidents
- If yes, prevent deletion or reassign incidents first
- Optionally soft delete (set status to inactive) instead of hard delete

---

### 6.5 Get Staff's Assigned Incidents

**Frontend File:** `app/pageStaffAction/AssignedIncidents.tsx`

**Current Mock Data:**
```json
[
  { "id": 1, "title": "Ngập nước đường Nguyễn Trãi", "status": "Chờ xử lý" },
  { "id": 2, "title": "Đèn giao thông hỏng", "status": "Đang xử lý" },
  { "id": 3, "title": "Rác thải tồn đọng", "status": "Hoàn thành" }
]
```

#### Required API Endpoint:

**GET** `/staff/assigned-incidents`

**Authentication:** Required (Staff only)

**Query Parameters:**
```
?status=Chờ xử lý|Đang xử lý|Hoàn thành (optional)
```

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Ngập nước đường Nguyễn Trãi",
    "status": "Chờ xử lý",
    "category": "Vệ sinh môi trường",
    "address": "Đường Nguyễn Trãi, Quận 5",
    "priority": "Cao",
    "progress": 0,
    "assignedAt": "2025-11-30T08:00:00Z",
    "createdAt": "2025-11-29T15:00:00Z"
  }
]
```

#### Business Logic:
- Extract staff ID from JWT token
- Filter incidents where `assignedToStaffId = currentStaffId`
- Order by priority (Cao → Trung bình → Thấp), then by createdAt

---

### 6.6 Update Incident Progress (Staff)

**Frontend File:** `app/pageStaffAction/UpdateProgress.tsx`

**Frontend State:** Progress percentage (0-100)

#### Required API Endpoint:

**PATCH** `/staff/incidents/{id}/progress`

**Authentication:** Required (Staff only, must be assigned to this incident)

**Request Body:**
```json
{
  "progress": 75
}
```

**Success Response (200 OK):**
```json
{
  "id": 123,
  "progress": 75,
  "updatedAt": "2025-11-30T14:00:00Z",
  "message": "Đã cập nhật tiến độ"
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": "Bạn không được phân công cho sự cố này",
  "code": "NOT_ASSIGNED_TO_INCIDENT"
}
```

#### Business Logic:
- Verify current user is assigned to this incident
- Progress must be 0-100
- Update `updatedAt` timestamp
- If progress = 100, optionally auto-update status to "Hoàn thành"
- Record in incident history

---

### 6.7 Staff Dashboard

**Frontend File:** `app/pageStaffAction/StaffHome.tsx`

#### Required API Endpoint:

**GET** `/staff/dashboard`

**Authentication:** Required (Staff only)

**Success Response (200 OK):**
```json
{
  "staffName": "Nguyễn Văn A",
  "todayAssignedIncidents": 3,
  "totalAssignedIncidents": 12,
  "completedIncidents": 8,
  "inProgressIncidents": 3,
  "pendingIncidents": 1,
  "recentIncidents": [
    {
      "id": 1,
      "title": "Đèn đường hỏng",
      "address": "Phường 5, Quận 3",
      "status": "Đang xử lý",
      "progress": 50
    }
  ]
}
```

---

## 7. SUPPORT & FEEDBACK SYSTEM

### 7.1 Contact Information

**Frontend File:** `app/SettingsUser/Contact.tsx`

**Current Static Data:**
```json
{
  "supportEmail": "hotro@ungdung.vn",
  "hotline": "1900 1234",
  "businessHours": "Thứ 2 - Thứ 6, 8:00 - 17:00"
}
```

#### Required API Endpoint:

**GET** `/support/contact-info`

**Authentication:** Not required (public)

**Success Response (200 OK):**
```json
{
  "supportEmail": "hotro@ungdung.vn",
  "hotline": "1900 1234",
  "businessHours": "Thứ 2 - Thứ 6, 8:00 - 17:00",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "facebookPage": "https://facebook.com/...",
  "websiteUrl": "https://..."
}
```

---

### 7.2 Submit Feedback

**Frontend Files:**
- `app/SettingsUser/Feedback.tsx` (User feedback)
- `app/pageAdmin/staff/Support.tsx` (Admin/Staff feedback)

#### Required API Endpoint:

**POST** `/support/feedback`

**Authentication:** Required

**Request Body:**
```json
{
  "subject": "string (optional, max 200 characters)",
  "content": "string (required, max 2000 characters)",
  "feedbackType": "Bug | Feature Request | General | Complaint (optional)"
}
```

**Success Response (201 Created):**
```json
{
  "id": 456,
  "subject": "Lỗi không tải được bản đồ",
  "content": "Khi mở trang bản đồ, ứng dụng bị treo...",
  "userId": 123,
  "userName": "Nguyễn Văn A",
  "status": "Mới",
  "createdAt": "2025-11-30T10:00:00Z",
  "message": "Cảm ơn phản hồi của bạn! Chúng tôi sẽ xem xét và phản hồi sớm nhất."
}
```

#### Database Requirements:

**Feedback Table:**
- id (PRIMARY KEY)
- userId (FOREIGN KEY to Users.id)
- subject (NVARCHAR, 200)
- content (NTEXT, required)
- feedbackType (NVARCHAR)
- status (NVARCHAR) - "Mới", "Đang xử lý", "Đã giải quyết", "Đóng"
- adminResponse (NTEXT, nullable)
- createdAt (DATETIME)
- updatedAt (DATETIME)

---

### 7.3 Get User's Feedback History

#### Required API Endpoint:

**GET** `/support/my-feedback`

**Authentication:** Required

**Success Response (200 OK):**
```json
[
  {
    "id": 456,
    "subject": "Lỗi không tải được bản đồ",
    "content": "Khi mở trang bản đồ...",
    "status": "Đang xử lý",
    "createdAt": "2025-11-30T10:00:00Z",
    "adminResponse": null
  }
]
```

---

### 7.4 Admin - View All Feedback

#### Required API Endpoint:

**GET** `/admin/feedback`

**Authentication:** Required (Admin only)

**Query Parameters:**
```
?status=Mới|Đang xử lý|Đã giải quyết|Đóng (optional)
&feedbackType=Bug|Feature Request|General|Complaint (optional)
```

**Success Response (200 OK):**
```json
[
  {
    "id": 456,
    "subject": "Lỗi không tải được bản đồ",
    "content": "Khi mở trang bản đồ...",
    "userId": 123,
    "userName": "Nguyễn Văn A",
    "userEmail": "user@example.com",
    "status": "Mới",
    "feedbackType": "Bug",
    "createdAt": "2025-11-30T10:00:00Z",
    "adminResponse": null
  }
]
```

---

### 7.5 Admin - Respond to Feedback

#### Required API Endpoint:

**PATCH** `/admin/feedback/{id}/respond`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "adminResponse": "string (required)",
  "status": "Đang xử lý | Đã giải quyết | Đóng (optional)"
}
```

**Success Response (200 OK):**
```json
{
  "id": 456,
  "adminResponse": "Cảm ơn báo lỗi. Chúng tôi đã khắc phục và sẽ cập nhật trong phiên bản tiếp theo.",
  "status": "Đã giải quyết",
  "updatedAt": "2025-11-30T15:00:00Z"
}
```

#### Business Logic:
- Send notification/email to user when admin responds
- Update status automatically
- Record response timestamp

---

## 8. LOCATION SERVICES

### 8.1 Save User Location Preferences

**Frontend File:** `app/SettingsUser/LocationSelectScreen.tsx`

**Current Storage:** AsyncStorage (local only)

**State:**
```json
{
  "startPoint": "Bến xe Miền Đông",
  "destination": "Chợ Bến Thành"
}
```

#### Required API Endpoint:

**PUT** `/users/location-preferences`

**Authentication:** Required

**Request Body:**
```json
{
  "startPoint": "string (optional)",
  "destination": "string (optional)",
  "defaultLatitude": "number (optional)",
  "defaultLongitude": "number (optional)"
}
```

**Success Response (200 OK):**
```json
{
  "startPoint": "Bến xe Miền Đông",
  "destination": "Chợ Bến Thành",
  "updatedAt": "2025-11-30T10:00:00Z",
  "message": "Đã lưu vị trí thành công"
}
```

#### Database Requirements:

**UserLocationPreferences Table:**
- id (PRIMARY KEY)
- userId (FOREIGN KEY to Users.id, UNIQUE)
- startPoint (NVARCHAR)
- destination (NVARCHAR)
- defaultLatitude (DECIMAL)
- defaultLongitude (DECIMAL)
- createdAt (DATETIME)
- updatedAt (DATETIME)

---

### 8.2 Get User Location Preferences

#### Required API Endpoint:

**GET** `/users/location-preferences`

**Authentication:** Required

**Success Response (200 OK):**
```json
{
  "userId": 123,
  "startPoint": "Bến xe Miền Đông",
  "destination": "Chợ Bến Thành",
  "defaultLatitude": 10.7765,
  "defaultLongitude": 106.7009
}
```

---

### 8.3 Update Staff Location (Real-time)

**Required for:** Finding nearest staff

#### Required API Endpoint:

**PUT** `/staff/location`

**Authentication:** Required (Staff only)

**Request Body:**
```json
{
  "latitude": 10.7765,
  "longitude": 106.7009
}
```

**Success Response (200 OK):**
```json
{
  "staffId": 101,
  "latitude": 10.7765,
  "longitude": 106.7009,
  "updatedAt": "2025-11-30T10:00:00Z"
}
```

#### Business Logic:
- Update staff's current location in real-time
- Used for calculating nearest staff for incident assignment
- Update timestamp for last location update

---

## 9. COMPLETE DATABASE SCHEMA

### 9.1 Users Table

```sql
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    Password NVARCHAR(255) NOT NULL, -- Hashed
    Role NVARCHAR(50) NOT NULL DEFAULT 'User', -- 'User', 'Admin', 'Staff'
    Gender NVARCHAR(10) NULL, -- 'Nam', 'Nữ', 'Khác'
    DateOfBirth DATE NULL,
    PhoneNumber NVARCHAR(20) NULL,
    Address NVARCHAR(500) NULL,
    Avatar NVARCHAR(500) NULL,

    -- Staff-specific fields
    StaffRole NVARCHAR(50) NULL, -- 'Giám sát', 'Kỹ thuật', 'Hành chính'
    StaffStatus NVARCHAR(50) NULL DEFAULT 'Đang hoạt động', -- 'Đang hoạt động', 'Nghỉ phép', 'Tạm ngưng'
    Latitude DECIMAL(10,8) NULL,
    Longitude DECIMAL(11,8) NULL,
    LastLocationUpdate DATETIME NULL,

    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,

    INDEX IX_Users_Email (Email),
    INDEX IX_Users_Role (Role),
    INDEX IX_Users_StaffStatus (StaffStatus)
);
```

---

### 9.2 Incidents Table

```sql
CREATE TABLE Incidents (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(200) NOT NULL,
    Description NTEXT NOT NULL,
    Category NVARCHAR(100) NOT NULL, -- 'Hư hỏng đường sá', 'Mất điện', etc.
    Status NVARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'received', 'resolved'
    Priority NVARCHAR(50) NULL DEFAULT 'Trung bình', -- 'Cao', 'Trung bình', 'Thấp'
    Address NVARCHAR(500) NOT NULL,
    Latitude DECIMAL(10,8) NULL,
    Longitude DECIMAL(11,8) NULL,

    UserId INT NOT NULL,
    AssignedToStaffId INT NULL,

    PhotoUrls NTEXT NULL, -- JSON array
    Progress INT NOT NULL DEFAULT 0, -- 0-100

    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    ResolvedAt DATETIME NULL,
    AssignedAt DATETIME NULL,

    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (AssignedToStaffId) REFERENCES Users(Id) ON DELETE SET NULL,

    INDEX IX_Incidents_UserId (UserId),
    INDEX IX_Incidents_AssignedToStaffId (AssignedToStaffId),
    INDEX IX_Incidents_Status (Status),
    INDEX IX_Incidents_CreatedAt (CreatedAt DESC),
    INDEX IX_Incidents_Category (Category),
    INDEX IX_Incidents_Priority (Priority)
);
```

**Category Values:**
- "Hư hỏng đường sá"
- "Mất điện"
- "Cấp nước"
- "Vệ sinh môi trường"
- "Cây xanh"
- "Khác"

**Status Values (Vietnamese Mapping):**
- "pending" = "Chờ xử lý"
- "received" = "Đang xử lý"
- "resolved" = "Hoàn thành"

---

### 9.3 IncidentHistory Table

```sql
CREATE TABLE IncidentHistory (
    Id INT PRIMARY KEY IDENTITY(1,1),
    IncidentId INT NOT NULL,
    Action NVARCHAR(100) NOT NULL, -- 'created', 'assigned', 'status_changed', 'progress_updated', 'resolved'
    PerformedBy INT NOT NULL, -- User/Staff/Admin ID
    PerformedByName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    OldValue NVARCHAR(200) NULL,
    NewValue NVARCHAR(200) NULL,
    Timestamp DATETIME NOT NULL DEFAULT GETDATE(),

    FOREIGN KEY (IncidentId) REFERENCES Incidents(Id) ON DELETE CASCADE,
    FOREIGN KEY (PerformedBy) REFERENCES Users(Id),

    INDEX IX_IncidentHistory_IncidentId (IncidentId),
    INDEX IX_IncidentHistory_Timestamp (Timestamp DESC)
);
```

---

### 9.4 UserPreferences Table

```sql
CREATE TABLE UserPreferences (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL UNIQUE,
    NotificationsEnabled BIT NOT NULL DEFAULT 1,
    DarkModeEnabled BIT NOT NULL DEFAULT 0,
    LocationEnabled BIT NOT NULL DEFAULT 1,
    Language NVARCHAR(10) NOT NULL DEFAULT 'vi', -- 'vi', 'en'
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,

    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    INDEX IX_UserPreferences_UserId (UserId)
);
```

---

### 9.5 UserLocationPreferences Table

```sql
CREATE TABLE UserLocationPreferences (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL UNIQUE,
    StartPoint NVARCHAR(500) NULL,
    Destination NVARCHAR(500) NULL,
    DefaultLatitude DECIMAL(10,8) NULL,
    DefaultLongitude DECIMAL(11,8) NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,

    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    INDEX IX_UserLocationPreferences_UserId (UserId)
);
```

---

### 9.6 Feedback Table

```sql
CREATE TABLE Feedback (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    Subject NVARCHAR(200) NULL,
    Content NTEXT NOT NULL,
    FeedbackType NVARCHAR(50) NULL, -- 'Bug', 'Feature Request', 'General', 'Complaint'
    Status NVARCHAR(50) NOT NULL DEFAULT 'Mới', -- 'Mới', 'Đang xử lý', 'Đã giải quyết', 'Đóng'
    AdminResponse NTEXT NULL,
    RespondedBy INT NULL, -- Admin user ID
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    RespondedAt DATETIME NULL,

    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (RespondedBy) REFERENCES Users(Id),

    INDEX IX_Feedback_UserId (UserId),
    INDEX IX_Feedback_Status (Status),
    INDEX IX_Feedback_CreatedAt (CreatedAt DESC)
);
```

---

### 9.7 Notifications Table (Optional Enhancement)

```sql
CREATE TABLE Notifications (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Message NTEXT NOT NULL,
    Type NVARCHAR(50) NOT NULL, -- 'incident_created', 'incident_assigned', 'status_updated', 'feedback_response'
    RelatedEntityType NVARCHAR(50) NULL, -- 'incident', 'feedback'
    RelatedEntityId INT NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    ReadAt DATETIME NULL,

    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,

    INDEX IX_Notifications_UserId (UserId),
    INDEX IX_Notifications_IsRead (IsRead),
    INDEX IX_Notifications_CreatedAt (CreatedAt DESC)
);
```

---

## 10. API ENDPOINTS SUMMARY

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | User login | No |
| POST | `/auth/register` | User registration | No |
| POST | `/auth/refresh-token` | Refresh JWT token | Yes |
| POST | `/auth/logout` | Logout (invalidate token) | Yes |

---

### User Profile Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/users/profile` | Get current user profile | Yes | All |
| PUT | `/users/profile` | Update profile | Yes | All |
| POST | `/users/change-password` | Change password | Yes | All |
| POST | `/users/avatar` | Upload avatar | Yes | All |
| GET | `/users/preferences` | Get user preferences | Yes | All |
| PUT | `/users/preferences` | Update preferences | Yes | All |
| GET | `/users/location-preferences` | Get location preferences | Yes | All |
| PUT | `/users/location-preferences` | Update location preferences | Yes | All |

---

### Incident Endpoints (User)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/incidents` | Create new incident | Yes | User, Staff |
| GET | `/incidents/my-incidents` | Get user's incidents | Yes | User, Staff |
| GET | `/incidents/{id}` | Get incident details | Yes | All |
| PUT | `/incidents/{id}` | Update incident | Yes | Owner/Admin |
| DELETE | `/incidents/{id}` | Delete incident | Yes | Owner/Admin |
| GET | `/incidents/statistics` | Get incident statistics | Yes | User |
| GET | `/incidents/map` | Get incidents for map view | Yes | All |
| POST | `/incidents/{id}/photos` | Upload photos | Yes | Owner/Admin |

---

### Admin Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/admin/dashboard` | Get dashboard statistics | Yes | Admin |
| GET | `/admin/incidents` | Get all incidents | Yes | Admin |
| POST | `/admin/incidents/{id}/assign` | Assign incident to staff | Yes | Admin |
| POST | `/admin/incidents/{id}/find-nearest-staff` | Find nearest staff | Yes | Admin |
| PATCH | `/admin/incidents/{id}/status` | Update incident status | Yes | Admin |
| GET | `/admin/staff` | Get all staff members | Yes | Admin |
| POST | `/admin/staff` | Create staff member | Yes | Admin |
| PUT | `/admin/staff/{id}` | Update staff member | Yes | Admin |
| DELETE | `/admin/staff/{id}` | Delete staff member | Yes | Admin |
| GET | `/admin/feedback` | Get all feedback | Yes | Admin |
| PATCH | `/admin/feedback/{id}/respond` | Respond to feedback | Yes | Admin |

---

### Staff Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/staff/dashboard` | Get staff dashboard | Yes | Staff |
| GET | `/staff/assigned-incidents` | Get assigned incidents | Yes | Staff |
| PATCH | `/staff/incidents/{id}/progress` | Update incident progress | Yes | Staff |
| PUT | `/staff/location` | Update current location | Yes | Staff |

---

### Support Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/support/contact-info` | Get contact information | No | All |
| POST | `/support/feedback` | Submit feedback | Yes | All |
| GET | `/support/my-feedback` | Get user's feedback history | Yes | All |

---

## 11. ERROR HANDLING & VALIDATION

### Standard Error Response Format

```json
{
  "error": "User-friendly error message in Vietnamese",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional context or field-specific errors"
  },
  "timestamp": "2025-11-30T10:00:00Z"
}
```

---

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation errors, malformed request |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Business logic violation, duplicate |
| 500 | Internal Server Error | Server error |

---

### Common Error Codes

```
AUTH_001: INVALID_CREDENTIALS - Email hoặc mật khẩu không đúng
AUTH_002: EMAIL_EXISTS - Email đã được sử dụng
AUTH_003: TOKEN_EXPIRED - Token đã hết hạn
AUTH_004: INVALID_TOKEN - Token không hợp lệ

USER_001: USER_NOT_FOUND - Không tìm thấy người dùng
USER_002: INVALID_OLD_PASSWORD - Mật khẩu cũ không đúng
USER_003: WEAK_PASSWORD - Mật khẩu quá yếu

INCIDENT_001: INCIDENT_NOT_FOUND - Không tìm thấy sự cố
INCIDENT_002: CANNOT_EDIT_PROCESSED - Không thể chỉnh sửa sự cố đã xử lý
INCIDENT_003: CANNOT_DELETE_ASSIGNED - Không thể xóa sự cố đã phân công
INCIDENT_004: INVALID_STATUS_TRANSITION - Chuyển trạng thái không hợp lệ

STAFF_001: STAFF_NOT_FOUND - Không tìm thấy nhân viên
STAFF_002: STAFF_HAS_ASSIGNED_INCIDENTS - Nhân viên đang có sự cố được phân công
STAFF_003: NOT_ASSIGNED_TO_INCIDENT - Bạn không được phân công cho sự cố này

PERMISSION_001: UNAUTHORIZED_ACTION - Bạn không có quyền thực hiện hành động này
PERMISSION_002: ADMIN_ONLY - Chỉ quản trị viên mới có quyền
PERMISSION_003: OWNER_ONLY - Chỉ người tạo mới có quyền

VALIDATION_001: REQUIRED_FIELD - Trường bắt buộc không được để trống
VALIDATION_002: INVALID_FORMAT - Định dạng không hợp lệ
VALIDATION_003: OUT_OF_RANGE - Giá trị nằm ngoài phạm vi cho phép
```

---

### Field Validation Rules

#### Users:
- **Name:** 2-100 characters, required
- **Email:** Valid email format, unique, required
- **Password:** 6-100 characters, required
- **Phone:** 10-11 digits, starts with 0, optional
- **Date of Birth:** Valid date, age >= 13 years, optional
- **Gender:** "Nam" | "Nữ" | "Khác", optional

#### Incidents:
- **Title:** 5-200 characters, required
- **Description:** 20-2000 characters, required
- **Category:** Must match enum values, required
- **Address:** 10-500 characters, required
- **Latitude:** -90 to 90, optional
- **Longitude:** -180 to 180, optional
- **Priority:** "Cao" | "Trung bình" | "Thấp", optional
- **Progress:** 0-100, integer, required

#### Feedback:
- **Subject:** 5-200 characters, optional
- **Content:** 10-2000 characters, required
- **FeedbackType:** "Bug" | "Feature Request" | "General" | "Complaint", optional

---

## 12. SECURITY & AUTHORIZATION

### 12.1 Authentication

**JWT Token Requirements:**
- Algorithm: HS256 or RS256
- Expiration: 24 hours
- Include in request header: `Authorization: Bearer {token}`
- Payload should include:
  ```json
  {
    "userId": 123,
    "email": "user@example.com",
    "role": "User | Admin | Staff",
    "iat": 1638360000,
    "exp": 1638446400
  }
  ```

---

### 12.2 Authorization Matrix

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| **Own Profile** | - | User, Staff, Admin | User, Staff, Admin | - |
| **Own Incidents** | User, Staff | User, Staff, Admin | Owner, Admin | Owner (if pending), Admin |
| **All Incidents** | - | Admin, Staff | Admin | Admin |
| **Staff Members** | Admin | Admin | Admin | Admin |
| **Feedback** | User, Staff, Admin | Owner, Admin | Admin (respond only) | - |
| **Dashboard Stats** | - | Admin (full), Staff (own), User (own) | - | - |

---

### 12.3 Password Security

**Requirements:**
- Hash using BCrypt (cost factor: 10-12)
- Never store plain text passwords
- Never return passwords in API responses
- Validate password strength:
  - Minimum 6 characters
  - Recommended: Mix of letters, numbers, special chars

---

### 12.4 CORS Configuration

**Allowed Origins:**
```
http://localhost:8081
http://10.0.2.2:8081
exp://192.168.x.x:8081
```

**Allowed Methods:**
```
GET, POST, PUT, PATCH, DELETE, OPTIONS
```

**Allowed Headers:**
```
Authorization, Content-Type, Accept
```

---

### 12.5 Rate Limiting (Recommended)

| Endpoint Type | Rate Limit |
|--------------|------------|
| Login | 5 requests / 15 minutes per IP |
| Register | 3 requests / hour per IP |
| File Upload | 10 requests / hour per user |
| Other API calls | 100 requests / minute per user |

---

## 13. FILE UPLOAD SPECIFICATIONS

### 13.1 Avatar Upload

- **Endpoint:** `POST /users/avatar`
- **Format:** jpg, png
- **Max Size:** 5MB
- **Dimensions:** Resize to 150x150px (thumbnail)
- **Storage:** Cloud or wwwroot/uploads/avatars/{userId}/
- **Naming:** `{userId}_{timestamp}.jpg`

---

### 13.2 Incident Photos Upload

- **Endpoint:** `POST /incidents/{id}/photos`
- **Format:** jpg, png
- **Max Size:** 10MB per file
- **Max Files:** 5 per incident
- **Storage:** Cloud or wwwroot/uploads/incidents/{incidentId}/
- **Naming:** `{incidentId}_{timestamp}_{index}.jpg`

---

## 14. PAGINATION STANDARD

**Query Parameters:**
```
?page=1           // Page number (default: 1)
&pageSize=20      // Items per page (default: 20, max: 100)
```

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "totalItems": 156,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## 15. TESTING DATA

### Seed Data for Testing

**Users:**
```sql
INSERT INTO Users (Name, Email, Password, Role) VALUES
('Admin User', 'admin@gmail.com', '[HASHED_PASSWORD]', 'Admin'),
('Võ Văn Hòa', 'vanhoadepzai@gmail.com', '[HASHED_PASSWORD]', 'User'),
('Test User', 'v', '[HASHED_PASSWORD]', 'User'),
('Nhân Viên', 'nhanvien', '[HASHED_PASSWORD]', 'Staff');
```

**Staff Members:**
```sql
INSERT INTO Users (Name, Email, Password, Role, StaffRole, StaffStatus, Latitude, Longitude) VALUES
('Nguyễn Văn A', 'nguyenvana@example.com', '[HASHED_PASSWORD]', 'Staff', 'Giám sát', 'Đang hoạt động', 10.760, 106.690),
('Trần Thị B', 'tranthib@example.com', '[HASHED_PASSWORD]', 'Staff', 'Kỹ thuật', 'Đang hoạt động', 10.745, 106.665),
('Lê Văn C', 'levanc@example.com', '[HASHED_PASSWORD]', 'Staff', 'Hành chính', 'Nghỉ phép', 10.785, 106.715);
```

**Sample Incidents:**
```sql
-- Use the incident data from frontend mock data
```

---

## 16. FRONTEND-BACKEND INTEGRATION CHECKLIST

### Replace Mock Data in Frontend Files:

- [ ] `app/Accounts/Login.tsx` - Replace AccountTest array with API call
- [ ] `app/pageUser/HomePage.tsx` - Replace mockData with `/incidents/my-incidents`
- [ ] `app/pageUser/map.tsx` - Replace mockData with `/incidents/map`
- [ ] `app/SettingsUser/Profile.tsx` - Replace static data with `/users/profile`
- [ ] `app/pageAdmin/HomeAdmin.tsx` - Replace static stats with `/admin/dashboard`
- [ ] `app/pageAdmin/staff/Incidents.tsx` - Replace mockIncidentsData with `/admin/incidents`
- [ ] `app/pageAdmin/staff/Staff.tsx` - Replace initialStaff with `/admin/staff`
- [ ] `app/pageStaffAction/AssignedIncidents.tsx` - Replace incidents array with `/staff/assigned-incidents`
- [ ] `app/pageStaffAction/StaffHome.tsx` - Replace static data with `/staff/dashboard`
- [ ] `app/SettingsUser/Contact.tsx` - Replace hardcoded info with `/support/contact-info`

---

## 17. ENVIRONMENT CONFIGURATION

### Required Environment Variables

```env
# Database
DATABASE_CONNECTION_STRING=Server=localhost;Database=TuTiDB;User Id=sa;Password=***;

# JWT
JWT_SECRET=your-super-secret-key-min-32-characters
JWT_EXPIRATION_HOURS=24

# File Storage
STORAGE_TYPE=local|azure|aws
STORAGE_PATH=wwwroot/uploads
AZURE_STORAGE_CONNECTION_STRING=***
AWS_S3_BUCKET=***

# API
API_BASE_URL=http://10.0.2.2:5218/api
CORS_ALLOWED_ORIGINS=http://localhost:8081,http://10.0.2.2:8081

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=***
SMTP_PASSWORD=***
SEND_EMAIL_NOTIFICATIONS=true

# App Settings
DEFAULT_LANGUAGE=vi
SUPPORT_EMAIL=hotro@ungdung.vn
SUPPORT_HOTLINE=1900 1234
```

---

## 18. PERFORMANCE OPTIMIZATION

### Database Indexes (Already included in schema)

**Critical Indexes:**
- Users: Email, Role, StaffStatus
- Incidents: UserId, AssignedToStaffId, Status, CreatedAt, Category, Priority
- Feedback: UserId, Status, CreatedAt

### Caching Strategy (Recommended)

**Cache Duration:**
- User profile: 10 minutes
- Incident statistics: 5 minutes
- Contact info: 1 hour
- Enum values (categories, statuses): 24 hours

**Cache Keys:**
```
user:profile:{userId}
user:stats:{userId}
admin:dashboard:{period}
staff:assigned:{staffId}
support:contact-info
```

---

## 19. NOTIFICATION SYSTEM (OPTIONAL ENHANCEMENT)

### When to Send Notifications

| Event | Recipient | Notification Type |
|-------|-----------|-------------------|
| Incident created | Admin | Push + Email |
| Incident assigned | Assigned staff | Push + Email |
| Status updated | Incident reporter | Push |
| Progress updated (50%, 100%) | Incident reporter | Push |
| Incident resolved | Incident reporter | Push + Email |
| Feedback response | Feedback submitter | Push + Email |

### Notification Payload Format

```json
{
  "title": "Sự cố đã được xử lý",
  "message": "Sự cố 'Hố sâu đường' đã được đánh dấu hoàn thành",
  "type": "status_updated",
  "relatedEntityType": "incident",
  "relatedEntityId": 123,
  "actionUrl": "/incident/123"
}
```

---

## 20. API VERSIONING (FUTURE-PROOFING)

**URL Structure:**
```
/api/v1/incidents
/api/v1/users/profile
```

**Version in Header (Alternative):**
```
API-Version: 1.0
```

---

## SUMMARY

This documentation provides **complete specifications** for all features in the TuTi frontend application. Use this document to:

1. ✅ Generate ASP.NET Core Web API controllers and models
2. ✅ Create Entity Framework Core migrations and database schema
3. ✅ Implement all business logic and validation rules
4. ✅ Set up JWT authentication and role-based authorization
5. ✅ Configure file upload and storage
6. ✅ Implement error handling and logging
7. ✅ Replace all mock data in frontend with real API calls

**Total Features Documented:**
- 8 Authentication & User Profile endpoints
- 12 Incident Management endpoints
- 10 Admin Management endpoints
- 4 Staff Action endpoints
- 5 Support & Feedback endpoints
- 7 Database tables with complete schemas
- Complete validation rules and business logic
- Security and authorization requirements
- File upload specifications
- Error handling standards

All endpoints are production-ready and aligned with the existing React Native frontend implementation.