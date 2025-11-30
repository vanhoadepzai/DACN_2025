# Incident Reporting & Management System - Feature Documentation

## Overview
This document provides comprehensive technical specifications for the Incident Reporting & Management System. This documentation is intended for backend API development and database schema creation.

---

## Table of Contents
1. [Database Schema Requirements](#database-schema-requirements)
2. [API Endpoints Specifications](#api-endpoints-specifications)
3. [Frontend Screens & Data Flow](#frontend-screens--data-flow)
4. [Business Logic & Validation Rules](#business-logic--validation-rules)
5. [Status Workflow](#status-workflow)
6. [Data Structures Reference](#data-structures-reference)

---

## Database Schema Requirements

### 1. Incidents Table

**Table Name:** `Incidents`

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `Id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique incident identifier |
| `Title` | NVARCHAR(200) | NOT NULL | Brief incident title/summary |
| `Description` | NTEXT | NOT NULL | Detailed incident description |
| `Category` | NVARCHAR(100) | NOT NULL | Incident category/type |
| `Status` | NVARCHAR(50) | NOT NULL, DEFAULT 'pending' | Current incident status |
| `Priority` | NVARCHAR(50) | NULL, DEFAULT 'Trung bình' | Incident priority level |
| `Address` | NVARCHAR(500) | NOT NULL | Specific location address |
| `Latitude` | DECIMAL(10,8) | NULL | GPS latitude coordinate |
| `Longitude` | DECIMAL(11,8) | NULL | GPS longitude coordinate |
| `UserId` | INT | FOREIGN KEY, NOT NULL | User who reported the incident |
| `AssignedToStaffId` | INT | FOREIGN KEY, NULL | Staff member assigned to handle |
| `PhotoUrls` | NTEXT | NULL | JSON array of photo/video URLs |
| `Progress` | INT | DEFAULT 0 | Completion percentage (0-100) |
| `CreatedAt` | DATETIME | NOT NULL, DEFAULT GETDATE() | Incident creation timestamp |
| `UpdatedAt` | DATETIME | NULL | Last update timestamp |
| `ResolvedAt` | DATETIME | NULL | Resolution timestamp |

**Indexes:**
- `IX_Incidents_UserId` on `UserId`
- `IX_Incidents_AssignedToStaffId` on `AssignedToStaffId`
- `IX_Incidents_Status` on `Status`
- `IX_Incidents_CreatedAt` on `CreatedAt` DESC

**Foreign Keys:**
- `UserId` references `Users(Id)` ON DELETE CASCADE
- `AssignedToStaffId` references `Users(Id)` ON DELETE SET NULL

### 2. Category Enum Values

The `Category` field should accept the following values:
- `"Hư hỏng đường sá"` (Road damage)
- `"Mất điện"` (Power outage)
- `"Cấp nước"` (Water supply issues)
- `"Vệ sinh môi trường"` (Environmental sanitation)
- `"Cây xanh"` (Green vegetation/Trees)
- `"Khác"` (Other)

### 3. Status Enum Values

The `Status` field should accept the following values:
- `"pending"` - Newly reported, awaiting review (Vietnamese: "Chờ xử lý")
- `"received"` - Acknowledged and assigned (Vietnamese: "Đang xử lý")
- `"resolved"` - Completed and resolved (Vietnamese: "Hoàn thành")

### 4. Priority Enum Values

The `Priority` field should accept the following values:
- `"Cao"` (High)
- `"Trung bình"` (Medium)
- `"Thấp"` (Low)

---

## API Endpoints Specifications

### Base URL
```
http://10.0.2.2:5218/api
```

### 1. Create New Incident

**Endpoint:** `POST /incidents`

**Authentication:** Required (JWT Token)

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "title": "string (required, max 200 chars)",
  "description": "string (required)",
  "category": "string (required, must be one of enum values)",
  "address": "string (required, max 500 chars)",
  "latitude": "number (optional, decimal)",
  "longitude": "number (optional, decimal)",
  "photoUrls": ["string array (optional)"]
}
```

**Response (201 Created):**
```json
{
  "id": 123,
  "title": "Hố sâu đường Nguyễn Văn Linh",
  "description": "Có hố sâu khoảng 30cm...",
  "category": "Hư hỏng đường sá",
  "status": "pending",
  "priority": "Trung bình",
  "address": "123 Nguyễn Văn Linh, Q.7",
  "latitude": 10.7295,
  "longitude": 106.7197,
  "userId": 456,
  "assignedToStaffId": null,
  "photoUrls": [],
  "progress": 0,
  "createdAt": "2025-11-30T10:30:00Z",
  "updatedAt": null,
  "resolvedAt": null
}
```

**Business Logic:**
- Automatically set `status` to `"pending"`
- Set `priority` to `"Trung bình"` by default
- Extract `userId` from authenticated user token
- Set `createdAt` to current timestamp
- Set `progress` to 0
- Calculate nearest available staff member (optional, can be done later)

### 2. Get All Incidents (with Filtering)

**Endpoint:** `GET /api/incidents`

**Authentication:** Required

**Query Parameters:**
```
?status=pending|received|resolved (optional)
&userId=123 (optional, filter by reporter)
&assignedToStaffId=456 (optional, filter by assigned staff)
&category=string (optional)
&fromDate=2025-11-01 (optional, ISO date)
&toDate=2025-11-30 (optional, ISO date)
&latitude=10.7295 (optional, for nearby incidents)
&longitude=106.7197 (optional, for nearby incidents)
&radius=5 (optional, radius in km, requires lat/lon)
```

**Response (200 OK):**
```json
[
  {
    "id": 123,
    "title": "string",
    "description": "string",
    "category": "string",
    "status": "string",
    "priority": "string",
    "address": "string",
    "latitude": 10.7295,
    "longitude": 106.7197,
    "userId": 456,
    "assignedToStaffId": 789,
    "photoUrls": ["url1", "url2"],
    "progress": 50,
    "createdAt": "2025-11-30T10:30:00Z",
    "updatedAt": "2025-11-30T12:00:00Z",
    "resolvedAt": null
  }
]
```

**Business Logic:**
- If `latitude` and `longitude` provided with `radius`, calculate incidents within radius using Haversine formula
- Order by `createdAt` DESC by default
- Support pagination (optional: add `?page=1&pageSize=20`)

### 3. Get Incident by ID

**Endpoint:** `GET /incidents/{id}`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "id": 123,
  "title": "string",
  "description": "string",
  "category": "string",
  "status": "string",
  "priority": "string",
  "address": "string",
  "latitude": 10.7295,
  "longitude": 106.7197,
  "userId": 456,
  "assignedToStaffId": 789,
  "photoUrls": ["url1", "url2"],
  "progress": 50,
  "createdAt": "2025-11-30T10:30:00Z",
  "updatedAt": "2025-11-30T12:00:00Z",
  "resolvedAt": null
}
```

**Response (404 Not Found):**
```json
{
  "error": "Incident not found"
}
```

### 4. Update Incident Status

**Endpoint:** `PATCH /incidents/{id}/status`

**Authentication:** Required (Admin or assigned Staff only)

**Request Body:**
```json
{
  "status": "pending|received|resolved"
}
```

**Response (200 OK):**
```json
{
  "id": 123,
  "status": "resolved",
  "updatedAt": "2025-11-30T15:00:00Z",
  "resolvedAt": "2025-11-30T15:00:00Z"
}
```

**Business Logic:**
- Update `updatedAt` to current timestamp
- If status changed to `"resolved"`, set `resolvedAt` to current timestamp and `progress` to 100
- Only admin or assigned staff can update status
- Send notification to incident reporter

### 5. Assign Incident to Staff

**Endpoint:** `PATCH /incidents/{id}/assign`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "assignedToStaffId": 789
}
```

**Response (200 OK):**
```json
{
  "id": 123,
  "assignedToStaffId": 789,
  "status": "received",
  "updatedAt": "2025-11-30T11:00:00Z"
}
```

**Business Logic:**
- Automatically change status to `"received"` when assigned
- Update `updatedAt` timestamp
- Verify `assignedToStaffId` is a valid staff user
- Send notification to assigned staff member

### 6. Update Incident Progress

**Endpoint:** `PATCH /incidents/{id}/progress`

**Authentication:** Required (Assigned Staff only)

**Request Body:**
```json
{
  "progress": 75
}
```

**Response (200 OK):**
```json
{
  "id": 123,
  "progress": 75,
  "updatedAt": "2025-11-30T14:00:00Z"
}
```

**Business Logic:**
- Only assigned staff can update progress
- Progress must be between 0-100
- Update `updatedAt` timestamp
- If progress reaches 100, consider auto-updating status to `"resolved"`

### 7. Get User's Incidents

**Endpoint:** `GET /incidents/my-incidents`

**Authentication:** Required

**Query Parameters:**
```
?status=pending|received|resolved (optional)
```

**Response (200 OK):**
```json
[
  {
    "id": 123,
    "title": "string",
    "description": "string",
    "category": "string",
    "status": "string",
    "priority": "string",
    "address": "string",
    "latitude": 10.7295,
    "longitude": 106.7197,
    "assignedToStaffId": 789,
    "progress": 50,
    "createdAt": "2025-11-30T10:30:00Z",
    "updatedAt": "2025-11-30T12:00:00Z"
  }
]
```

**Business Logic:**
- Filter incidents by `userId` from authenticated token
- Order by `createdAt` DESC

### 8. Get Staff's Assigned Incidents

**Endpoint:** `GET /incidents/assigned-to-me`

**Authentication:** Required (Staff only)

**Response (200 OK):**
```json
[
  {
    "id": 123,
    "title": "string",
    "description": "string",
    "status": "string",
    "progress": 50,
    "createdAt": "2025-11-30T10:30:00Z"
  }
]
```

**Business Logic:**
- Filter incidents where `assignedToStaffId` matches authenticated user's ID
- Order by `createdAt` DESC

### 9. Get Incident Statistics

**Endpoint:** `GET /incidents/statistics`

**Authentication:** Required

**Query Parameters:**
```
?userId=123 (optional, for specific user stats)
&date=2025-11-30 (optional, for specific date)
```

**Response (200 OK):**
```json
{
  "total": 150,
  "pending": 45,
  "received": 60,
  "resolved": 45,
  "todayTotal": 12,
  "todayPending": 5,
  "todayReceived": 4,
  "todayResolved": 3,
  "byCategory": {
    "Hư hỏng đường sá": 50,
    "Mất điện": 30,
    "Cấp nước": 25,
    "Vệ sinh môi trường": 20,
    "Cây xanh": 15,
    "Khác": 10
  }
}
```

### 10. Find Nearest Available Staff

**Endpoint:** `POST /incidents/{id}/find-nearest-staff`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "latitude": 10.7295,
  "longitude": 106.7197
}
```

**Response (200 OK):**
```json
{
  "staffId": 789,
  "staffName": "Nguyễn Văn A",
  "distance": 2.5,
  "latitude": 10.7400,
  "longitude": 106.7300
}
```

**Business Logic:**
- Use Haversine formula to calculate distance
- Only consider staff members with `isActive = true`
- Prioritize staff with fewer assigned incidents
- Return closest available staff member

### 11. Update Incident (Full Update)

**Endpoint:** `PUT /incidents/{id}`

**Authentication:** Required (Owner or Admin only)

**Request Body:**
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "category": "string (optional)",
  "address": "string (optional)",
  "latitude": "number (optional)",
  "longitude": "number (optional)",
  "priority": "string (optional, admin only)",
  "photoUrls": ["string array (optional)"]
}
```

**Response (200 OK):**
```json
{
  "id": 123,
  "title": "Updated title",
  "description": "Updated description",
  // ... full incident object
  "updatedAt": "2025-11-30T16:00:00Z"
}
```

**Business Logic:**
- Only incident owner can update title, description, address, photos
- Only admin can update priority
- Update `updatedAt` timestamp
- Cannot update status or assignment via this endpoint

### 12. Delete Incident

**Endpoint:** `DELETE /incidents/{id}`

**Authentication:** Required (Owner or Admin only)

**Response (204 No Content)**

**Business Logic:**
- Only allow deletion if status is `"pending"` (not yet assigned)
- Admin can delete any incident
- User can only delete their own pending incidents

---

## Frontend Screens & Data Flow

### User Screens

#### 1. HomePage (`app/pageUser/HomePage.tsx`)

**Purpose:** Display user's submitted incidents with statistics

**Data Required:**
- GET `/incidents/my-incidents` - All user's incidents
- GET `/incidents/statistics?userId={currentUserId}` - User statistics

**Display Fields:**
- Total incidents count
- Resolved incidents count
- Pending incidents count
- List of incidents showing:
  - Title
  - Description
  - Status (with color-coded badge)
  - Created date
  - Updated date

**Features:**
- Pull-to-refresh to reload data
- Search functionality (filter locally or add API search parameter)
- Click incident to navigate to detail view

#### 2. Create Incident Modal (`app/pageUser/modal.tsx`)

**Purpose:** Form to create new incident reports

**API Call:**
- POST `/incidents` with form data

**Input Fields:**
- Category (required): Select from dropdown
  - Hư hỏng đường sá
  - Mất điện
  - Cấp nước
  - Vệ sinh môi trường
  - Cây xanh
  - Khác
- Title (required): Text input, max 200 chars
- Description (required): Multi-line text area
- Address (required): Text input, max 500 chars
- Photos/Videos (optional): File upload (multiple)
- GPS coordinates: Auto-captured from device location (latitude, longitude)

**Validation Rules:**
- All required fields must be filled
- Category must be from predefined list
- Title max length: 200 characters
- Address max length: 500 characters

**Success Behavior:**
- Show success message
- Clear form
- Navigate back to HomePage
- Refresh incident list

#### 3. Map View (`app/pageUser/map.tsx`)

**Purpose:** Display incidents on interactive map with location markers

**Data Required:**
- GET `/api/incidents?latitude={userLat}&longitude={userLon}&radius=50` - Nearby incidents
- GET `/incidents/statistics?date={today}` - Today's statistics

**Display Fields:**
- Map markers for each incident:
  - Position: latitude, longitude
  - Color based on status (Green=resolved, Orange=pending, Blue=received)
  - Title shown on marker click
- Statistics panel:
  - Today's total incidents
  - Pending count
  - Received count
  - Resolved count

**Features:**
- Filter incidents by status
- Click marker to view incident details
- Animate map to selected incident location
- Show user's current location

#### 4. Incident Detail View (`app/incident/[id].tsx`)

**Purpose:** Display full details of a specific incident

**Data Required:**
- GET `/incidents/{id}` - Full incident details

**Display Fields:**
- Title
- Description
- Category
- Status
- Priority
- Address
- Created date
- Updated date
- Resolved date (if resolved)
- Assigned staff name (if assigned)
- Progress percentage
- Photos/Videos
- Location on mini-map

### Admin Screens

#### 5. Admin Dashboard (`app/pageAdmin/HomeAdmin.tsx`)

**Purpose:** Overview of all incidents with management capabilities

**Data Required:**
- GET `/incidents/statistics` - Overall statistics
- GET `/incidents?limit=10` - Recent incidents

**Display Fields:**
- Statistics overview
- Recent incidents list showing:
  - Title
  - Category
  - Status
  - Date

#### 6. Incident Management (`app/pageAdmin/staff/Incidents.tsx`)

**Purpose:** Complete incident management interface for admins

**Data Required:**
- GET `/incidents` - All incidents
- GET `/users?role=staff` - Available staff members

**Display Fields:**
- Complete incident list with:
  - ID
  - Title
  - Category
  - Status
  - Priority
  - Date
  - Assigned staff
  - Location (lat, lon)

**Features:**
- View incident details in modal
- Update status to "Hoàn thành" (resolved)
- Assign to nearest available staff:
  - POST `/incidents/{id}/find-nearest-staff` with incident location
  - PATCH `/incidents/{id}/assign` with selected staffId
- Calculate distance to nearest staff using Haversine formula
- Filter incidents by status, category, priority
- Sort by date, priority, status

**Actions:**
- Mark as Completed: PATCH `/incidents/{id}/status` with status="resolved"
- Assign Staff: PATCH `/incidents/{id}/assign` with staffId
- View Details: GET `/incidents/{id}`

### Staff Screens

#### 7. Assigned Incidents (`app/pageStaffAction/AssignedIncidents.tsx`)

**Purpose:** Show incidents assigned to current staff member

**Data Required:**
- GET `/incidents/assigned-to-me` - Staff's assigned incidents

**Display Fields:**
- List of assigned incidents:
  - ID
  - Title
  - Status
  - Progress

**Features:**
- Click to navigate to progress update screen

#### 8. Update Progress (`app/pageStaffAction/UpdateProgress.tsx`)

**Purpose:** Allow staff to update incident progress

**Data Required:**
- GET `/incidents/{id}` - Current incident details

**API Call:**
- PATCH `/incidents/{id}/progress` with progress value

**Input:**
- Progress slider (0-100%)
- +10% / -10% adjustment buttons

**Business Logic:**
- Progress must be 0-100
- Save updates to backend
- Show success message
- Navigate back to assigned incidents list

---

## Business Logic & Validation Rules

### 1. Incident Creation
- User must be authenticated
- All required fields must be provided
- Category must match predefined enum values
- Status automatically set to `"pending"`
- Priority defaults to `"Trung bình"`
- Progress defaults to 0
- CreatedAt set to current timestamp
- GPS coordinates optional but recommended

### 2. Status Transitions

**Valid Status Flow:**
```
pending → received → resolved
```

**Rules:**
- `pending` → `received`: When incident is assigned to staff
- `received` → `resolved`: When incident is completed
- Cannot skip statuses (e.g., pending cannot directly go to resolved)
- Cannot revert status (e.g., resolved cannot go back to pending)
- Only admin or assigned staff can change status

### 3. Staff Assignment
- Only admin can assign incidents to staff
- When assigned, status automatically changes to `"received"`
- Staff must be active (`isActive = true`)
- Prefer nearest available staff based on GPS coordinates
- Consider staff workload (number of current assigned incidents)

### 4. Progress Updates
- Only assigned staff can update progress
- Progress range: 0-100
- When progress reaches 100, consider auto-resolving incident
- Each progress update triggers `updatedAt` timestamp update

### 5. Authorization Rules

**User Permissions:**
- Create incidents (own reports only)
- View own incidents
- Update own incidents (title, description, address only)
- Delete own pending incidents (before assignment)
- View incident details

**Staff Permissions:**
- All user permissions
- View assigned incidents
- Update progress on assigned incidents
- Update status on assigned incidents

**Admin Permissions:**
- All permissions
- View all incidents
- Assign incidents to staff
- Update any incident field
- Delete any incident
- Manage priorities

### 6. Validation Rules

**Title:**
- Required
- Min length: 5 characters
- Max length: 200 characters
- No special characters except Vietnamese

**Description:**
- Required
- Min length: 20 characters
- Max length: 2000 characters

**Address:**
- Required
- Max length: 500 characters

**Category:**
- Required
- Must be one of: "Hư hỏng đường sá", "Mất điện", "Cấp nước", "Vệ sinh môi trường", "Cây xanh", "Khác"

**GPS Coordinates:**
- Optional
- Latitude: -90 to 90
- Longitude: -180 to 180

**Priority:**
- Optional (defaults to "Trung bình")
- Must be one of: "Cao", "Trung bình", "Thấp"

**Progress:**
- Integer 0-100
- Only updatable by assigned staff

### 7. Haversine Distance Calculation

For finding nearest staff or nearby incidents, use Haversine formula:

```
a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)
c = 2 * atan2(√a, √(1−a))
distance = R * c
```

Where:
- R = Earth's radius (6371 km)
- lat1, lon1 = Incident coordinates
- lat2, lon2 = Staff coordinates
- Result in kilometers

---

## Status Workflow

### Lifecycle Diagram

```
[User Reports Incident]
        ↓
    [PENDING] ───────────────────┐
        ↓                         │
   [Admin Reviews]               │ (User can delete)
        ↓                         │
   [Admin Assigns Staff]         │
        ↓                         │
    [RECEIVED] ←──────────────────┘
        ↓
   [Staff Works on It]
        ↓
   [Staff Updates Progress: 0% → 100%]
        ↓
   [Staff/Admin Marks as Resolved]
        ↓
    [RESOLVED]
```

### Status Descriptions

**PENDING (Chờ xử lý)**
- Newly created incident
- Awaiting admin review
- No staff assigned yet
- Color: Orange
- User can still edit or delete

**RECEIVED (Đang xử lý)**
- Incident acknowledged by admin
- Staff member assigned
- Work in progress
- Color: Blue
- Progress tracked (0-99%)

**RESOLVED (Hoàn thành)**
- Incident completed
- Issue fixed
- Progress = 100%
- Color: Green
- `resolvedAt` timestamp recorded
- Cannot be edited further

---

## Data Structures Reference

### Complete Incident Object

```json
{
  "id": 123,
  "title": "Hố sâu đường Nguyễn Văn Linh",
  "description": "Có hố sâu khoảng 30cm trên đường Nguyễn Văn Linh, đoạn gần ngã tư Trần Xuân Soạn. Rất nguy hiểm cho xe máy khi đi qua, đặc biệt vào ban đêm.",
  "category": "Hư hỏng đường sá",
  "status": "received",
  "priority": "Cao",
  "address": "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
  "latitude": 10.729500,
  "longitude": 106.719700,
  "userId": 456,
  "assignedToStaffId": 789,
  "photoUrls": [
    "https://storage.example.com/incidents/123/photo1.jpg",
    "https://storage.example.com/incidents/123/photo2.jpg"
  ],
  "progress": 50,
  "createdAt": "2025-11-30T10:30:00Z",
  "updatedAt": "2025-11-30T14:00:00Z",
  "resolvedAt": null
}
```

### Incident Creation Request

```json
{
  "title": "Hố sâu đường Nguyễn Văn Linh",
  "description": "Có hố sâu khoảng 30cm...",
  "category": "Hư hỏng đường sá",
  "address": "123 Nguyễn Văn Linh, Quận 7",
  "latitude": 10.729500,
  "longitude": 106.719700,
  "photoUrls": []
}
```

### Statistics Response

```json
{
  "total": 150,
  "pending": 45,
  "received": 60,
  "resolved": 45,
  "todayTotal": 12,
  "todayPending": 5,
  "todayReceived": 4,
  "todayResolved": 3,
  "byCategory": {
    "Hư hỏng đường sá": 50,
    "Mất điện": 30,
    "Cấp nước": 25,
    "Vệ sinh môi trường": 20,
    "Cây xanh": 15,
    "Khác": 10
  },
  "byPriority": {
    "Cao": 30,
    "Trung bình": 80,
    "Thấp": 40
  }
}
```

---

## Additional Requirements

### 1. File Upload for Photos/Videos

**Endpoint:** `POST /incidents/{id}/upload-media`

**Request:**
- Content-Type: multipart/form-data
- Files: photo[] or video[]

**Response:**
```json
{
  "urls": [
    "https://storage.example.com/incidents/123/photo1.jpg",
    "https://storage.example.com/incidents/123/photo2.jpg"
  ]
}
```

**Storage:**
- Store files in cloud storage (Azure Blob, AWS S3, or local wwwroot)
- Generate unique filenames
- Validate file types (jpg, png, mp4, mov)
- Max file size: 10MB per file
- Max files per incident: 5

### 2. Notifications (Optional Enhancement)

**When to Send:**
- User creates incident → Notify admin
- Incident assigned → Notify assigned staff
- Status updated → Notify incident reporter
- Progress updated → Notify incident reporter
- Incident resolved → Notify incident reporter

**Methods:**
- Push notifications (if mobile)
- Email notifications
- In-app notifications

### 3. Search & Filtering

**Search Fields:**
- Title (LIKE search)
- Description (LIKE search)
- Address (LIKE search)
- Category (exact match)

**Advanced Filters:**
- Date range (createdAt between X and Y)
- Status (multiple select)
- Priority (multiple select)
- Category (multiple select)
- Assigned staff
- Reporter user

### 4. Pagination

**Query Parameters:**
```
?page=1&pageSize=20
```

**Response Headers:**
```
X-Total-Count: 150
X-Page: 1
X-Page-Size: 20
X-Total-Pages: 8
```

### 5. Audit Trail (Optional)

Create `IncidentHistory` table to track all changes:

| Column | Type | Description |
|--------|------|-------------|
| Id | INT | Primary key |
| IncidentId | INT | Foreign key to Incidents |
| ChangedBy | INT | User who made the change |
| ChangeType | NVARCHAR | Type of change (StatusUpdate, Assignment, ProgressUpdate, etc.) |
| OldValue | NVARCHAR | Previous value |
| NewValue | NVARCHAR | New value |
| ChangedAt | DATETIME | When the change occurred |

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional context"
  }
}
```

### Common HTTP Status Codes

- **200 OK** - Successful GET, PUT, PATCH
- **201 Created** - Successful POST
- **204 No Content** - Successful DELETE
- **400 Bad Request** - Validation errors
- **401 Unauthorized** - Missing or invalid token
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **409 Conflict** - Business logic violation
- **500 Internal Server Error** - Server error

### Error Codes

- `INCIDENT_NOT_FOUND` - Incident ID doesn't exist
- `INVALID_STATUS_TRANSITION` - Attempted invalid status change
- `UNAUTHORIZED_ACTION` - User lacks permission
- `VALIDATION_ERROR` - Input validation failed
- `STAFF_NOT_AVAILABLE` - No staff available for assignment
- `DUPLICATE_INCIDENT` - Similar incident already exists (optional check)

---

## Database Relationships

### Entity Relationship Diagram

```
Users (Id, Name, Email, Role, IsActive, Latitude, Longitude)
  |
  |--- 1:N ---> Incidents (UserId)
  |
  |--- 1:N ---> Incidents (AssignedToStaffId)

Incidents (Id, Title, Description, Category, Status, Priority, ...)
```

### Required User Table Fields

If not already in your User model, add:

```sql
Users Table:
- Id (PRIMARY KEY)
- Name (NVARCHAR)
- Email (NVARCHAR)
- Role (NVARCHAR) - 'User', 'Staff', 'Admin'
- IsActive (BIT) - For staff availability
- Latitude (DECIMAL) - Current/assigned location
- Longitude (DECIMAL) - Current/assigned location
- CreatedAt (DATETIME)
```

---

## Testing Checklist

### API Testing

- [ ] Create incident with valid data
- [ ] Create incident with missing required fields
- [ ] Create incident with invalid category
- [ ] Get all incidents (empty, with data)
- [ ] Get incident by ID (exists, not exists)
- [ ] Get user's incidents
- [ ] Get staff's assigned incidents
- [ ] Update incident status (valid, invalid transitions)
- [ ] Assign incident to staff
- [ ] Update progress (0, 50, 100)
- [ ] Find nearest staff
- [ ] Get statistics (overall, by user, by date)
- [ ] Filter incidents by status, category, date range
- [ ] Search incidents by keyword
- [ ] Upload photos/videos
- [ ] Delete incident (owner, non-owner, admin)
- [ ] Authorization checks (user, staff, admin roles)

### Database Testing

- [ ] Insert incident with all fields
- [ ] Insert incident with minimal fields
- [ ] Foreign key constraints work (invalid userId, staffId)
- [ ] Default values applied correctly
- [ ] Indexes created and working
- [ ] Cascade delete works for user deletion
- [ ] Timestamps auto-populate correctly

---

## Configuration

### Required Environment Variables

```
DATABASE_CONNECTION_STRING=Server=...;Database=...;
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
FILE_STORAGE_PATH=/uploads/incidents
MAX_FILE_SIZE_MB=10
API_BASE_URL=http://10.0.2.2:5218/api
```

### CORS Configuration

Allow frontend origins:
```
http://localhost:8081
http://10.0.2.2:8081
```

---

## Performance Considerations

1. **Indexing:**
   - Index on `Status`, `UserId`, `AssignedToStaffId`, `CreatedAt`
   - Composite index on (Status, CreatedAt)

2. **Caching:**
   - Cache statistics for 5 minutes
   - Cache category/status enums

3. **Pagination:**
   - Default page size: 20
   - Max page size: 100

4. **File Storage:**
   - Use CDN for media files
   - Compress images before storage
   - Generate thumbnails for photos

5. **Geolocation Queries:**
   - Use spatial indexes for lat/lon queries
   - Limit radius searches to reasonable distances (e.g., 50km max)

---

## Summary

This documentation provides complete specifications for:

1. **Database Schema** - Incidents table with all required fields, indexes, and relationships
2. **API Endpoints** - 12 comprehensive endpoints for CRUD operations, status management, assignment, and statistics
3. **Business Logic** - Validation rules, status workflows, authorization, and Haversine calculations
4. **Frontend Integration** - Detailed requirements for each screen and their data needs
5. **Error Handling** - Standard error formats and HTTP status codes
6. **Additional Features** - File uploads, notifications, search, pagination, audit trail

Use this documentation to:
- Generate ASP.NET Core Web API controllers and models
- Create Entity Framework migrations
- Set up database schema in SQL Server
- Implement authentication and authorization
- Build comprehensive incident management system

All endpoints, fields, and workflows are production-ready and aligned with the existing React Native frontend.