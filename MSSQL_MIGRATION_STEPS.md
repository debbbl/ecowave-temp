# EcoWave Hub - Supabase to MS SQL Server Migration Steps

## Overview
This document outlines the essential steps and files to change when migrating from Supabase to Microsoft SQL Server.

## Migration Steps

### Step 1: Database Setup
1. **Create MS SQL Database**
   - Set up Azure SQL Database or SQL Server instance
   - Configure connection strings and security

2. **Schema Migration**
   - Convert PostgreSQL schema to T-SQL
   - Create tables, indexes, and constraints
   - Set up stored procedures if needed

### Step 2: Backend API Creation
1. **Create .NET Core Web API Project**
   - Set up new ASP.NET Core Web API
   - Configure Entity Framework Core
   - Implement authentication with JWT

2. **Database Models & Context**
   - Create Entity models
   - Set up DbContext
   - Configure relationships

### Step 3: Frontend Changes
1. **Update API Service Layer**
   - Replace Supabase client calls
   - Implement new HTTP client service
   - Update authentication flow

2. **Environment Configuration**
   - Update environment variables
   - Configure new API endpoints

### Step 4: File Storage Migration
1. **Azure Blob Storage Setup**
   - Create storage account
   - Configure containers
   - Update upload/download logic

### Step 5: Deployment & Testing
1. **Deploy Backend API**
   - Deploy to Azure App Service
   - Configure database connections
   - Set up CI/CD pipeline

2. **Deploy Frontend**
   - Update build configuration
   - Deploy to Azure Static Web Apps
   - Configure routing

---

## Files to be Changed/Created

### 🆕 New Backend Files (Create .NET Core API)

#### **Program.cs**
```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddDbContext<EcoWaveDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        // JWT configuration
    });

var app = builder.Build();

// Configure pipeline
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

#### **Models/User.cs**
```csharp
public class User
{
    public int UserId { get; set; }
    public string SsoId { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Role { get; set; }
    public int RedeemablePoints { get; set; }
    public string ProfilePicture { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

#### **Data/EcoWaveDbContext.cs**
```csharp
public class EcoWaveDbContext : DbContext
{
    public EcoWaveDbContext(DbContextOptions<EcoWaveDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Event> Events { get; set; }
    public DbSet<Reward> Rewards { get; set; }
    public DbSet<Feedback> Feedback { get; set; }
    public DbSet<AdminActivityLog> AdminActivityLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure relationships and constraints
    }
}
```

#### **Controllers/UsersController.cs**
```csharp
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly EcoWaveDbContext _context;

    public UsersController(EcoWaveDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        return await _context.Users.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<User>> CreateUser(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, user);
    }
}
```

### 📝 Frontend Files to Modify

#### **src/lib/api.ts** (New File)
```typescript
// Replace src/lib/supabase.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  setAuthToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Users API
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/api/users');
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    return this.request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  // Events API
  async getEvents(): Promise<Event[]> {
    return this.request<Event[]>('/api/events');
  }

  async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
    return this.request<Event>('/api/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  // Rewards API
  async getRewards(): Promise<Reward[]> {
    return this.request<Reward[]>('/api/rewards');
  }

  // Feedback API
  async getFeedback(): Promise<Feedback[]> {
    return this.request<Feedback[]>('/api/feedback');
  }

  // Admin History API
  async getAdminHistory(): Promise<AdminHistory[]> {
    return this.request<AdminHistory[]>('/api/admin-history');
  }
}

export const apiService = new ApiService();
```

#### **src/hooks/useAuth.ts** (Modify)
```typescript
// Replace Supabase auth with JWT auth
import { useState, useEffect } from 'react';
import { apiService } from '../lib/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const { token, user } = await response.json();
      localStorage.setItem('authToken', token);
      apiService.setAuthToken(token);
      setUser(user);
      
      return { data: { user }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('authToken');
    apiService.setAuthToken('');
    setUser(null);
    return { error: null };
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      apiService.setAuthToken(token);
      // Verify token and get user info
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const user = await apiService.getCurrentUser();
      setUser(user);
    } catch (error) {
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, signIn, signOut };
}
```

#### **src/hooks/useUsers.ts** (Modify)
```typescript
// Replace Supabase calls with API calls
import { useState, useEffect } from 'react';
import { apiService } from '../lib/api';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: CreateUserData) => {
    try {
      const newUser = await apiService.createUser(userData);
      setUsers(prev => [newUser, ...prev]);
      return { data: newUser, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updateUser = async (id: string, userData: UpdateUserData) => {
    try {
      const updatedUser = await apiService.updateUser(id, userData);
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
      return { data: updatedUser, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, createUser, updateUser, refetch: fetchUsers };
}
```

#### **src/hooks/useEvents.ts** (Modify)
```typescript
// Similar pattern - replace Supabase calls with API calls
import { useState, useEffect } from 'react';
import { apiService } from '../lib/api';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await apiService.getEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: CreateEventData) => {
    try {
      const newEvent = await apiService.createEvent(eventData);
      setEvents(prev => [newEvent, ...prev]);
      return { data: newEvent, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  // Similar pattern for update, delete operations

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, error, createEvent, refetch: fetchEvents };
}
```

#### **src/hooks/useRewards.ts** (Modify)
```typescript
// Replace Supabase calls with API calls - same pattern as above
```

#### **src/hooks/useFeedback.ts** (Modify)
```typescript
// Replace Supabase calls with API calls - same pattern as above
```

#### **src/hooks/useAdminHistory.ts** (Modify)
```typescript
// Replace Supabase calls with API calls - same pattern as above
```

#### **src/lib/imageUpload.ts** (Modify)
```typescript
// Replace Supabase Storage with Azure Blob Storage
export class ImageUploadService {
  private sasUrl: string;

  constructor() {
    this.sasUrl = import.meta.env.VITE_AZURE_STORAGE_SAS_URL;
  }

  async uploadImage(file: File): Promise<ImageUploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) throw new Error('Upload failed');

      const { imageUrl, imageId } = await response.json();
      return { success: true, imageUrl, imageId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
```

### 🔧 Configuration Files to Modify

#### **.env** (Modify)
```env
# Replace Supabase configuration with API configuration
VITE_API_BASE_URL=https://your-api.azurewebsites.net
VITE_AZURE_STORAGE_SAS_URL=https://yourstorage.blob.core.windows.net
```

#### **package.json** (Modify)
```json
{
  "dependencies": {
    // Remove Supabase dependency
    // "@supabase/supabase-js": "^2.39.0",
    
    // Keep existing dependencies
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    // ... other dependencies
  }
}
```

### 🗑️ Files to Remove

1. **src/lib/supabase.ts** - Remove entirely
2. **supabase/** directory - Remove all migration files
3. **.env** - Remove Supabase-related environment variables

---

## Database Schema Migration

### SQL Server Schema Creation Script
```sql
-- Create Users table
CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    SsoId NVARCHAR(255) UNIQUE,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    FirstName NVARCHAR(100),
    LastName NVARCHAR(100),
    Username NVARCHAR(100),
    Role NVARCHAR(50) NOT NULL DEFAULT 'user',
    RedeemablePoints INT DEFAULT 0,
    ProfilePicture NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Create Events table
CREATE TABLE Events (
    EventId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(255) NOT NULL,
    Description NTEXT,
    StartDate DATETIME2 NOT NULL,
    EndDate DATETIME2 NOT NULL,
    Location NVARCHAR(255),
    Points INT DEFAULT 100,
    CreatedBy INT,
    ThumbnailImage NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserId)
);

-- Create Rewards table
CREATE TABLE Rewards (
    RewardId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Description NTEXT,
    PointsRequired INT NOT NULL,
    Stock INT NOT NULL DEFAULT 0,
    ImageUrl NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Create Feedback table
CREATE TABLE Feedback (
    FeedbackId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    EventId INT,
    Rating INT CHECK (Rating >= 1 AND Rating <= 5),
    Comment NTEXT,
    SubmittedAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (EventId) REFERENCES Events(EventId)
);

-- Create AdminActivityLog table
CREATE TABLE AdminActivityLog (
    LogId INT IDENTITY(1,1) PRIMARY KEY,
    AdminId INT NOT NULL,
    ActionType NVARCHAR(50) NOT NULL,
    EntityType NVARCHAR(50) NOT NULL,
    EntityId INT NOT NULL,
    Details NTEXT,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (AdminId) REFERENCES Users(UserId)
);

-- Create indexes for performance
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Events_StartDate ON Events(StartDate);
CREATE INDEX IX_Events_EndDate ON Events(EndDate);
CREATE INDEX IX_Feedback_EventId ON Feedback(EventId);
CREATE INDEX IX_AdminActivityLog_AdminId ON AdminActivityLog(AdminId);
CREATE INDEX IX_AdminActivityLog_CreatedAt ON AdminActivityLog(CreatedAt);
```

---

## Migration Checklist

### Pre-Migration
- [ ] Backup existing Supabase data
- [ ] Set up Azure SQL Database
- [ ] Create .NET Core Web API project
- [ ] Set up Azure Blob Storage

### Database Migration
- [ ] Export data from Supabase
- [ ] Create SQL Server schema
- [ ] Import data to SQL Server
- [ ] Verify data integrity

### Backend Development
- [ ] Create Entity models
- [ ] Set up DbContext
- [ ] Implement API controllers
- [ ] Add authentication middleware
- [ ] Create file upload service

### Frontend Migration
- [ ] Remove Supabase dependencies
- [ ] Create API service layer
- [ ] Update all hooks to use new API
- [ ] Update authentication flow
- [ ] Update image upload logic
- [ ] Update environment variables

### Testing
- [ ] Test all CRUD operations
- [ ] Test authentication flow
- [ ] Test file uploads
- [ ] Test data consistency
- [ ] Performance testing

### Deployment
- [ ] Deploy API to Azure App Service
- [ ] Deploy frontend to Azure Static Web Apps
- [ ] Configure domain and SSL
- [ ] Set up monitoring and logging

---

## Estimated Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Setup** | 1 week | Database setup, API project creation |
| **Backend Development** | 2-3 weeks | API controllers, authentication, file handling |
| **Frontend Migration** | 2-3 weeks | Update all hooks and services |
| **Testing** | 1-2 weeks | Comprehensive testing |
| **Deployment** | 1 week | Production deployment and configuration |

**Total Estimated Time: 7-10 weeks**

---

## Key Benefits After Migration

✅ **Better Integration** - Seamless integration with Microsoft ecosystem  
✅ **Enhanced Security** - Enterprise-grade security features  
✅ **Improved Performance** - Optimized for high-traffic scenarios  
✅ **Cost Control** - Better cost predictability and optimization  
✅ **Scalability** - Auto-scaling capabilities with Azure  

---

## Support and Maintenance

After migration, you'll need to:
- Monitor API performance and database queries
- Implement proper logging and error handling
- Set up automated backups
- Configure monitoring and alerts
- Plan for regular security updates

This migration will provide a more robust, enterprise-ready foundation for your EcoWave Hub application.