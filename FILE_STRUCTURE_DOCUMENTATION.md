# EcoWave Hub - New File Structure Documentation (MVC Pattern)

## Overview

This document outlines the new file structure that implements the **Model-View-Controller (MVC)** pattern, enabling seamless database migration without frontend code changes.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      VIEW       │    │   CONTROLLER    │    │      MODEL      │
│                 │    │                 │    │                 │
│ React Components│◄──►│  Data Service   │◄──►│   Database      │
│   (Frontend)    │    │   Abstraction   │    │ (Supabase/MSSQL)│
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Benefits
- ✅ **Zero Frontend Changes** during database migration
- ✅ **Type Safety** with consistent interfaces
- ✅ **Easy Testing** with mockable data services
- ✅ **Future Flexibility** for adding new data sources

---

## 📁 Complete File Structure

```
ecowave-hub/
├── 📁 public/                          # Static assets
│   ├── 🖼️ roche-logo.png              # Company logo
│   └── 🖼️ [other-images]              # Event/reward images
│
├── 📁 src/
│   ├── 📁 components/                  # 🎨 VIEW LAYER (React Components)
│   │   ├── 📁 Auth/                   # Authentication components
│   │   │   ├── 📄 AuthProvider.tsx    # ✅ No changes needed
│   │   │   └── 📄 LoginForm.tsx       # ✅ No changes needed
│   │   ├── 📁 Layout/                 # Layout components
│   │   │   └── 📄 Layout.tsx          # ✅ No changes needed
│   │   └── 📁 ui/                     # Base UI components (shadcn/ui)
│   │       ├── 📄 button.tsx          # ✅ No changes needed
│   │       ├── 📄 card.tsx            # ✅ No changes needed
│   │       ├── 📄 dialog.tsx          # ✅ No changes needed
│   │       ├── 📄 input.tsx           # ✅ No changes needed
│   │       ├── 📄 image-upload.tsx    # ✅ No changes needed
│   │       └── 📄 [other-ui-components] # ✅ No changes needed
│   │
│   ├── 📁 hooks/                      # 🔗 VIEW-CONTROLLER BRIDGE
│   │   ├── 📄 useAuth.ts              # 📝 Updated to use dataService
│   │   ├── 📄 useDashboard.ts         # 📝 Updated to use dataService
│   │   ├── 📄 useEvents.ts            # 📝 Updated to use dataService
│   │   ├── 📄 useUsers.ts             # 📝 Updated to use dataService
│   │   ├── 📄 useRewards.ts           # 📝 Updated to use dataService
│   │   ├── 📄 useFeedback.ts          # 📝 Updated to use dataService
│   │   ├── 📄 useAdminHistory.ts      # 📝 Updated to use dataService
│   │   └── 📄 useDataService.ts       # 🆕 Hook to access data service
│   │
│   ├── 📁 lib/                        # 🎛️ CONTROLLER LAYER
│   │   ├── 📄 dataService.ts          # 🆕 MVC Controller & Interfaces
│   │   ├── 📄 supabase.ts             # 📝 Supabase implementation (legacy)
│   │   ├── 📄 adminLogger.ts          # 📝 Updated to use dataService
│   │   ├── 📄 imageUpload.ts          # 📝 Updated to use dataService
│   │   └── 📄 utils.ts                # ✅ No changes needed
│   │
│   ├── 📁 screens/                    # 🎨 VIEW LAYER (Main Pages)
│   │   ├── 📁 DashboardMainPage/      # Dashboard overview
│   │   │   ├── 📄 DashboardMainPage.tsx # ✅ No changes needed
│   │   │   └── 📄 index.ts            # ✅ No changes needed
│   │   ├── 📁 Events/                 # Event management
│   │   │   └── 📄 Events.tsx          # ✅ No changes needed
│   │   ├── 📁 Users/                  # User management
│   │   │   └── 📄 Users.tsx           # 📝 Minor type import change
│   │   ├── 📁 Rewards/                # Rewards management
│   │   │   └── 📄 Rewards.tsx         # 📝 Minor type import change
│   │   ├── 📁 Feedback/               # Feedback management
│   │   │   └── 📄 Feedback.tsx        # ✅ No changes needed
│   │   ├── 📁 AdminHistory/           # Admin activity logs
│   │   │   └── 📄 AdminHistory.tsx    # ✅ No changes needed
│   │   └── 📁 AdminProfile/           # Admin profile management
│   │       ├── 📄 AdminProfile.tsx    # ✅ No changes needed
│   │       └── 📄 index.ts            # ✅ No changes needed
│   │
│   └── 📄 index.tsx                   # ✅ Application entry point (no changes)
│
├── 📁 supabase/                       # 🗄️ DATABASE LAYER (Supabase)
│   └── 📁 migrations/                 # Database migration files
│       ├── 📄 [migration-files].sql   # ✅ No changes needed
│       └── 📄 ...                     # ✅ No changes needed
│
├── 📄 .env                            # 🔧 Environment configuration
├── 📄 .env.example                    # 📝 Updated with MVC config options
├── 📄 package.json                    # ✅ No changes needed
├── 📄 tailwind.config.js              # ✅ No changes needed
├── 📄 vite.config.ts                  # ✅ No changes needed
├── 📄 tsconfig.json                   # ✅ No changes needed
│
└── 📁 Documentation/                  # 📚 Project documentation
    ├── 📄 FILE_STRUCTURE_DOCUMENTATION.md    # 🆕 This file
    ├── 📄 DATABASE_MIGRATION_GUIDE.md        # 🆕 MVC migration guide
    ├── 📄 MSSQL_COMPLETE_MIGRATION_GUIDE.md  # 🆕 Complete migration guide
    ├── 📄 TEST_CASES_DOCUMENTATION.md        # ✅ Existing test cases
    └── 📄 LOCAL_SETUP.md                     # ✅ Local setup guide
```

---

## 🔧 Key Files Explained

### 🆕 New Core Files

#### `src/lib/dataService.ts` - **MVC Controller**
```typescript
// The heart of the MVC pattern - abstracts all data operations
export interface IDataService {
  // Authentication
  signIn(email: string, password: string): Promise<AuthResult>;
  signUp(email: string, password: string, fullName: string, role?: string): Promise<AuthResult>;
  signOut(): Promise<AuthResult>;
  getCurrentUser(): Promise<User | null>;
  
  // Users CRUD
  getUsers(): Promise<User[]>;
  createUser(userData: Partial<User>): Promise<{ data: User | null; error: string | null }>;
  updateUser(id: string, userData: Partial<User>): Promise<{ data: User | null; error: string | null }>;
  
  // Events CRUD
  getEvents(): Promise<Event[]>;
  createEvent(eventData: Partial<Event>): Promise<{ data: Event | null; error: string | null }>;
  
  // ... and all other data operations
}

// Factory pattern for switching between data sources
export class DataServiceFactory {
  public static getInstance(): IDataService {
    const serviceType = import.meta.env.VITE_DATA_SERVICE_TYPE || 'supabase';
    
    switch (serviceType) {
      case 'mssql':
        return new MSSQLDataService();
      case 'supabase':
      default:
        return new SupabaseDataService();
    }
  }
}
```

#### `src/hooks/useDataService.ts` - **Data Service Hook**
```typescript
// Simple hook to access the data service
import { dataService } from '../lib/dataService';

export function useDataService() {
  return dataService;
}
```

### 📝 Updated Files

#### `src/hooks/useAuth.ts` - **Authentication Hook**
```typescript
// Before: Direct Supabase calls
import { supabase } from '../lib/supabase';

// After: Uses data service abstraction
import { dataService } from '../lib/dataService';

export function useAuth() {
  // All authentication logic now goes through dataService
  const signIn = async (email: string, password: string) => {
    return await dataService.signIn(email, password);
  };
  
  // ... other auth methods
}
```

#### `src/hooks/useUsers.ts` - **User Management Hook**
```typescript
// Before: Direct Supabase calls
import { supabase, Profile } from '../lib/supabase';

// After: Uses data service abstraction
import { dataService, User } from '../lib/dataService';

export function useUsers() {
  const fetchUsers = async () => {
    const data = await dataService.getUsers(); // Works with any database!
    setUsers(data);
  };
  
  // ... other user operations
}
```

#### `.env.example` - **Environment Configuration**
```env
# Data Service Configuration - THE ONLY CHANGE NEEDED FOR MIGRATION!
VITE_DATA_SERVICE_TYPE=supabase
# Options: 'supabase' or 'mssql'

# MS SQL API Configuration (when using MS SQL)
VITE_API_BASE_URL=https://your-api.azurewebsites.net

# Supabase Configuration (when using Supabase)
VITE_SUPABASE_URL=https://cyaxqdwhbgjjubecxbnv.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 🔄 Migration Process

### Current State (Supabase)
```env
VITE_DATA_SERVICE_TYPE=supabase
VITE_SUPABASE_URL=https://cyaxqdwhbgjjubecxbnv.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
```

### Future State (MS SQL Server)
```env
VITE_DATA_SERVICE_TYPE=mssql
VITE_API_BASE_URL=https://your-api.azurewebsites.net
```

### Migration Steps
1. **Setup MS SQL Server** and create .NET Core API
2. **Change environment variable** from `supabase` to `mssql`
3. **Deploy and test** - no code changes needed!

---

## 🎯 Data Flow Architecture

### Before (Direct Database Calls)
```
React Component → useUsers Hook → Supabase Client → PostgreSQL Database
```

### After (MVC Pattern)
```
React Component → useUsers Hook → DataService Interface → Implementation → Database
                                      ↓
                              ┌─────────────────┐
                              │ SupabaseService │ → PostgreSQL
                              │ MSSQLService    │ → SQL Server  
                              │ MockService     │ → Test Data
                              └─────────────────┘
```

---

## 🧪 Testing Strategy

### Unit Testing
```typescript
// Easy to mock data service for testing
const mockDataService = {
  getUsers: jest.fn().mockResolvedValue([mockUser1, mockUser2]),
  createUser: jest.fn().mockResolvedValue({ data: mockUser, error: null })
};

DataServiceFactory.setInstance(mockDataService);
```

### Integration Testing
```typescript
// Test with different data sources
describe('User Management', () => {
  beforeEach(() => {
    // Switch to test data service
    process.env.VITE_DATA_SERVICE_TYPE = 'mock';
  });
  
  it('should create user successfully', async () => {
    // Test works regardless of database backend
  });
});
```

---

## 🔒 Type Safety

### Consistent Interfaces
```typescript
// All data services implement the same interface
interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  points: number;
  created_at: string;
  updated_at: string;
}

// Whether using Supabase or MS SQL, the interface is identical
const user: User = await dataService.getUser(id);
```

### Compile-Time Checking
```typescript
// TypeScript ensures all implementations match the interface
class SupabaseDataService implements IDataService {
  async getUsers(): Promise<User[]> {
    // Must return User[] or TypeScript error
  }
}

class MSSQLDataService implements IDataService {
  async getUsers(): Promise<User[]> {
    // Must return User[] or TypeScript error
  }
}
```

---

## 🚀 Performance Benefits

### Lazy Loading
```typescript
// Data service implementations are loaded only when needed
const serviceType = import.meta.env.VITE_DATA_SERVICE_TYPE;

switch (serviceType) {
  case 'mssql':
    // Only loads MS SQL dependencies when needed
    return new MSSQLDataService();
  case 'supabase':
    // Only loads Supabase dependencies when needed
    return new SupabaseDataService();
}
```

### Caching Strategy
```typescript
// Easy to add caching at the data service level
class CachedDataService implements IDataService {
  private cache = new Map();
  
  async getUsers(): Promise<User[]> {
    if (this.cache.has('users')) {
      return this.cache.get('users');
    }
    
    const users = await this.baseService.getUsers();
    this.cache.set('users', users);
    return users;
  }
}
```

---

## 🛠️ Development Workflow

### Local Development
```bash
# Work with Supabase locally
echo "VITE_DATA_SERVICE_TYPE=supabase" > .env.local

# Or work with MS SQL locally
echo "VITE_DATA_SERVICE_TYPE=mssql" > .env.local
echo "VITE_API_BASE_URL=http://localhost:5000" >> .env.local
```

### Staging Environment
```bash
# Test with production-like MS SQL setup
VITE_DATA_SERVICE_TYPE=mssql
VITE_API_BASE_URL=https://staging-api.azurewebsites.net
```

### Production Deployment
```bash
# Switch to MS SQL in production
VITE_DATA_SERVICE_TYPE=mssql
VITE_API_BASE_URL=https://prod-api.azurewebsites.net
```

---

## 🔧 Configuration Management

### Environment-Based Configuration
```typescript
// Different configurations for different environments
const config = {
  development: {
    dataServiceType: 'supabase',
    apiUrl: 'http://localhost:3000'
  },
  staging: {
    dataServiceType: 'mssql',
    apiUrl: 'https://staging-api.azurewebsites.net'
  },
  production: {
    dataServiceType: 'mssql',
    apiUrl: 'https://prod-api.azurewebsites.net'
  }
};
```

### Feature Flags
```typescript
// Gradual rollout using feature flags
const useNewDataService = import.meta.env.VITE_USE_NEW_DATA_SERVICE === 'true';

export const dataService = useNewDataService 
  ? new MSSQLDataService()
  : new SupabaseDataService();
```

---

## 📊 Monitoring and Logging

### Data Service Metrics
```typescript
class MonitoredDataService implements IDataService {
  async getUsers(): Promise<User[]> {
    const startTime = Date.now();
    
    try {
      const result = await this.baseService.getUsers();
      this.logMetric('getUsers', Date.now() - startTime, 'success');
      return result;
    } catch (error) {
      this.logMetric('getUsers', Date.now() - startTime, 'error');
      throw error;
    }
  }
}
```

### Error Tracking
```typescript
// Consistent error handling across all data sources
class ErrorTrackingDataService implements IDataService {
  async createUser(userData: Partial<User>): Promise<{ data: User | null; error: string | null }> {
    try {
      return await this.baseService.createUser(userData);
    } catch (error) {
      // Send to error tracking service (Sentry, etc.)
      this.errorTracker.captureException(error);
      return { data: null, error: error.message };
    }
  }
}
```

---

## 🎉 Summary

### What Changed
- ✅ **Added MVC abstraction layer** (`src/lib/dataService.ts`)
- ✅ **Updated hooks** to use data service instead of direct database calls
- ✅ **Added configuration options** for switching between databases
- ✅ **Minor type import changes** in some components

### What Stayed the Same
- ✅ **All React components** remain unchanged
- ✅ **All UI components** remain unchanged
- ✅ **All styling and layouts** remain unchanged
- ✅ **All business logic** remains unchanged
- ✅ **All user interfaces** remain unchanged

### Migration Benefits
- 🚀 **Zero downtime migration** - switch with environment variable
- 🔒 **Type safety** - consistent interfaces across all databases
- 🧪 **Easy testing** - mockable data services
- 🔄 **Reversible** - can switch back instantly if needed
- 📈 **Future-proof** - easy to add new data sources

### Developer Experience
- 💻 **Same development workflow** - no new tools or processes
- 🐛 **Same debugging experience** - familiar error patterns
- 📝 **Same code patterns** - hooks and components work identically
- 🔧 **Same build process** - no changes to Vite configuration

This MVC architecture provides a clean, maintainable, and flexible foundation for the EcoWave Hub application, enabling seamless database migrations without disrupting the user experience or development workflow.