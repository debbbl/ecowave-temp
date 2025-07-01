# EcoWave Hub - Database Migration Guide (MVC Pattern)

## Overview

This guide explains how to migrate from Supabase to MS SQL Server using the new MVC abstraction layer. **No frontend code changes are required** - only configuration changes.

## Architecture

The application now uses a **Model-View-Controller (MVC)** pattern with:

- **Model**: Data interfaces and types (`src/lib/dataService.ts`)
- **View**: React components (unchanged)
- **Controller**: Data service implementations (Supabase or MS SQL)

## Migration Steps

### Step 1: Environment Configuration

Simply change the data service type in your `.env` file:

```env
# Change from Supabase to MS SQL
VITE_DATA_SERVICE_TYPE=mssql

# Add MS SQL API configuration
VITE_API_BASE_URL=https://your-api.azurewebsites.net

# Remove or comment out Supabase configuration
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
```

### Step 2: Backend API Setup

Create a .NET Core Web API with the following endpoints:

#### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

#### User Management Endpoints
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `POST /api/users/{id}/points` - Add points to user

#### Event Management Endpoints
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event

#### Reward Management Endpoints
- `GET /api/rewards` - Get all rewards
- `POST /api/rewards` - Create reward
- `PUT /api/rewards/{id}` - Update reward
- `DELETE /api/rewards/{id}` - Delete reward
- `GET /api/rewards/{id}/redemptions` - Get reward redemptions

#### Feedback Management Endpoints
- `GET /api/feedback` - Get all feedback
- `DELETE /api/feedback/{id}` - Delete feedback
- `POST /api/feedback/{id}/read` - Mark feedback as read

#### Dashboard Endpoints
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/engagement` - Get monthly engagement data

#### Admin History Endpoints
- `GET /api/admin/history` - Get admin activity log
- `POST /api/admin/history` - Log admin action

#### File Upload Endpoints
- `POST /api/upload` - Upload image file
- `DELETE /api/images/{id}` - Delete image

### Step 3: Database Schema

Convert the existing PostgreSQL schema to SQL Server:

```sql
-- Users table
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

-- Events table
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

-- Rewards table
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

-- Feedback table
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

-- AdminActivityLog table
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
```

### Step 4: Data Migration

1. Export data from Supabase
2. Transform data format if needed
3. Import data into SQL Server
4. Verify data integrity

## Benefits of This Approach

### ✅ **Zero Frontend Changes**
- No React component modifications needed
- No hook changes required
- No UI updates necessary

### ✅ **Clean Architecture**
- Clear separation of concerns
- Easy to test and maintain
- Follows industry best practices

### ✅ **Flexible Data Sources**
- Can switch between databases easily
- Can add new data sources in the future
- Environment-based configuration

### ✅ **Type Safety**
- Consistent TypeScript interfaces
- Compile-time error checking
- Better developer experience

## Configuration Options

### Current Supabase Setup
```env
VITE_DATA_SERVICE_TYPE=supabase
VITE_SUPABASE_URL=https://cyaxqdwhbgjjubecxbnv.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
```

### Future MS SQL Setup
```env
VITE_DATA_SERVICE_TYPE=mssql
VITE_API_BASE_URL=https://your-api.azurewebsites.net
```

## Testing the Migration

1. **Development**: Test with both configurations
2. **Staging**: Deploy with MS SQL configuration
3. **Production**: Switch configuration when ready

## Rollback Strategy

If issues occur, simply change the environment variable back:

```env
# Rollback to Supabase
VITE_DATA_SERVICE_TYPE=supabase
```

## File Structure

```
src/
├── lib/
│   ├── dataService.ts          # 🆕 MVC Controller & Interfaces
│   ├── supabase.ts            # 📝 Still used by Supabase implementation
│   └── imageUpload.ts         # 📝 Updated to use data service
├── hooks/
│   ├── useAuth.ts             # 📝 Updated to use data service
│   ├── useUsers.ts            # 📝 Updated to use data service
│   ├── useEvents.ts           # 📝 Updated to use data service
│   ├── useRewards.ts          # 📝 Updated to use data service
│   ├── useFeedback.ts         # 📝 Updated to use data service
│   ├── useDashboard.ts        # 📝 Updated to use data service
│   └── useAdminHistory.ts     # 📝 Updated to use data service
└── components/                # ✅ No changes needed
```

## Summary

This MVC abstraction layer provides:

1. **Database Independence**: Switch between Supabase and MS SQL without code changes
2. **Clean Architecture**: Proper separation of data access and UI logic
3. **Type Safety**: Consistent interfaces across all data operations
4. **Easy Migration**: Simple environment variable change
5. **Future Flexibility**: Easy to add new data sources

The frontend code remains completely unchanged, making this a safe and reversible migration strategy.