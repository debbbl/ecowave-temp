# EcoWave Hub - Migration from Supabase to Microsoft SQL Server

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Database Schema Migration](#database-schema-migration)
4. [Application Code Changes](#application-code-changes)
5. [Configuration Updates](#configuration-updates)
6. [Authentication Changes](#authentication-changes)
7. [File Storage Migration](#file-storage-migration)
8. [Deployment Guide](#deployment-guide)
9. [Testing Strategy](#testing-strategy)
10. [Rollback Plan](#rollback-plan)

---

## Overview

This document provides a comprehensive guide for migrating the EcoWave Hub application from Supabase (PostgreSQL) to Microsoft SQL Server. The migration involves database schema conversion, application code updates, authentication system changes, and file storage migration.

### Migration Scope
- **Database**: PostgreSQL → SQL Server
- **Authentication**: Supabase Auth → Custom/Azure AD/Identity Server
- **File Storage**: Supabase Storage → Azure Blob Storage/Local Storage
- **Real-time Features**: Supabase Realtime → SignalR
- **API Layer**: Supabase Client → Custom API/Entity Framework

### Estimated Timeline
- **Planning & Setup**: 1-2 weeks
- **Database Migration**: 1 week
- **Application Code Changes**: 2-3 weeks
- **Testing & Validation**: 1-2 weeks
- **Deployment**: 1 week
- **Total**: 6-9 weeks

---

## Prerequisites

### Software Requirements
- Microsoft SQL Server 2019 or later
- SQL Server Management Studio (SSMS)
- Visual Studio 2022 or VS Code
- Node.js 18+ (for frontend)
- .NET 6+ (for backend API)

### Azure Services (if using cloud)
- Azure SQL Database
- Azure Blob Storage
- Azure App Service
- Azure Active Directory (for authentication)

### Development Tools
- Entity Framework Core 7+
- SQL Server Data Tools (SSDT)
- Azure Data Studio (optional)

---

## Database Schema Migration

### 1. Schema Conversion

#### Current Supabase Schema (PostgreSQL)
```sql
-- Users table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  sso_id TEXT UNIQUE,
  username TEXT,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user',
  redeemable_points INTEGER DEFAULT 0,
  profile_picture TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  event_id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  points INTEGER DEFAULT 100,
  created_by INTEGER REFERENCES users(user_id),
  registration_id TEXT,
  thumbnail_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rewards table
CREATE TABLE rewards (
  reward_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Participants table
CREATE TABLE event_participants (
  participant_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  event_id INTEGER REFERENCES events(event_id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'registered'
);

-- Reward Redemptions table
CREATE TABLE reward_redemptions (
  redemption_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  reward_id INTEGER REFERENCES rewards(reward_id),
  points_deducted INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'completed'
);

-- Feedback table
CREATE TABLE feedback (
  feedback_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  event_id INTEGER REFERENCES events(event_id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Activity Log table
CREATE TABLE admin_activity_log (
  log_id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES users(user_id),
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Converted SQL Server Schema
```sql
-- Users table
CREATE TABLE [dbo].[Users] (
    [UserId] INT IDENTITY(1,1) PRIMARY KEY,
    [SsoId] NVARCHAR(255) UNIQUE,
    [Username] NVARCHAR(100),
    [Email] NVARCHAR(255) UNIQUE NOT NULL,
    [FirstName] NVARCHAR(100),
    [LastName] NVARCHAR(100),
    [Role] NVARCHAR(50) DEFAULT 'user',
    [RedeemablePoints] INT DEFAULT 0,
    [ProfilePicture] NVARCHAR(500),
    [CreatedAt] DATETIME2 DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 DEFAULT GETUTCDATE()
);

-- Events table
CREATE TABLE [dbo].[Events] (
    [EventId] INT IDENTITY(1,1) PRIMARY KEY,
    [Title] NVARCHAR(255) NOT NULL,
    [Description] NVARCHAR(MAX),
    [StartDate] DATETIME2 NOT NULL,
    [EndDate] DATETIME2 NOT NULL,
    [Location] NVARCHAR(255),
    [Points] INT DEFAULT 100,
    [CreatedBy] INT FOREIGN KEY REFERENCES [Users]([UserId]),
    [RegistrationId] NVARCHAR(100),
    [ThumbnailImage] NVARCHAR(500),
    [CreatedAt] DATETIME2 DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 DEFAULT GETUTCDATE()
);

-- Rewards table
CREATE TABLE [dbo].[Rewards] (
    [RewardId] INT IDENTITY(1,1) PRIMARY KEY,
    [Name] NVARCHAR(255) NOT NULL,
    [Description] NVARCHAR(MAX),
    [PointsRequired] INT NOT NULL,
    [Stock] INT DEFAULT 0,
    [ImageUrl] NVARCHAR(500),
    [CreatedAt] DATETIME2 DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 DEFAULT GETUTCDATE()
);

-- Event Participants table
CREATE TABLE [dbo].[EventParticipants] (
    [ParticipantId] INT IDENTITY(1,1) PRIMARY KEY,
    [UserId] INT FOREIGN KEY REFERENCES [Users]([UserId]),
    [EventId] INT FOREIGN KEY REFERENCES [Events]([EventId]),
    [JoinedAt] DATETIME2 DEFAULT GETUTCDATE(),
    [Status] NVARCHAR(50) DEFAULT 'registered'
);

-- Reward Redemptions table
CREATE TABLE [dbo].[RewardRedemptions] (
    [RedemptionId] INT IDENTITY(1,1) PRIMARY KEY,
    [UserId] INT FOREIGN KEY REFERENCES [Users]([UserId]),
    [RewardId] INT FOREIGN KEY REFERENCES [Rewards]([RewardId]),
    [PointsDeducted] INT NOT NULL,
    [RedeemedAt] DATETIME2 DEFAULT GETUTCDATE(),
    [Status] NVARCHAR(50) DEFAULT 'completed'
);

-- Feedback table
CREATE TABLE [dbo].[Feedback] (
    [FeedbackId] INT IDENTITY(1,1) PRIMARY KEY,
    [UserId] INT FOREIGN KEY REFERENCES [Users]([UserId]),
    [EventId] INT FOREIGN KEY REFERENCES [Events]([EventId]),
    [Rating] INT CHECK ([Rating] >= 1 AND [Rating] <= 5),
    [Comment] NVARCHAR(MAX),
    [SubmittedAt] DATETIME2 DEFAULT GETUTCDATE()
);

-- Admin Activity Log table
CREATE TABLE [dbo].[AdminActivityLog] (
    [LogId] INT IDENTITY(1,1) PRIMARY KEY,
    [AdminId] INT FOREIGN KEY REFERENCES [Users]([UserId]),
    [ActionType] NVARCHAR(50) NOT NULL,
    [EntityType] NVARCHAR(50) NOT NULL,
    [EntityId] INT NOT NULL,
    [Details] NVARCHAR(MAX),
    [CreatedAt] DATETIME2 DEFAULT GETUTCDATE()
);

-- Create indexes for performance
CREATE INDEX IX_Users_Email ON [Users]([Email]);
CREATE INDEX IX_Users_Role ON [Users]([Role]);
CREATE INDEX IX_Events_StartDate ON [Events]([StartDate]);
CREATE INDEX IX_Events_CreatedBy ON [Events]([CreatedBy]);
CREATE INDEX IX_EventParticipants_UserId ON [EventParticipants]([UserId]);
CREATE INDEX IX_EventParticipants_EventId ON [EventParticipants]([EventId]);
CREATE INDEX IX_RewardRedemptions_UserId ON [RewardRedemptions]([UserId]);
CREATE INDEX IX_Feedback_EventId ON [Feedback]([EventId]);
CREATE INDEX IX_AdminActivityLog_AdminId ON [AdminActivityLog]([AdminId]);
CREATE INDEX IX_AdminActivityLog_CreatedAt ON [AdminActivityLog]([CreatedAt]);

-- Create triggers for UpdatedAt columns
CREATE TRIGGER TR_Users_UpdatedAt ON [Users]
AFTER UPDATE AS
BEGIN
    UPDATE [Users] 
    SET [UpdatedAt] = GETUTCDATE() 
    WHERE [UserId] IN (SELECT [UserId] FROM inserted);
END;

CREATE TRIGGER TR_Events_UpdatedAt ON [Events]
AFTER UPDATE AS
BEGIN
    UPDATE [Events] 
    SET [UpdatedAt] = GETUTCDATE() 
    WHERE [EventId] IN (SELECT [EventId] FROM inserted);
END;

CREATE TRIGGER TR_Rewards_UpdatedAt ON [Rewards]
AFTER UPDATE AS
BEGIN
    UPDATE [Rewards] 
    SET [UpdatedAt] = GETUTCDATE() 
    WHERE [RewardId] IN (SELECT [RewardId] FROM inserted);
END;
```

### 2. Data Migration Script

```sql
-- Data migration script (run after schema creation)
-- Note: This assumes you have exported data from Supabase

-- Disable identity insert for data migration
SET IDENTITY_INSERT [Users] ON;

-- Insert users data
INSERT INTO [Users] ([UserId], [SsoId], [Username], [Email], [FirstName], [LastName], [Role], [RedeemablePoints], [ProfilePicture], [CreatedAt], [UpdatedAt])
SELECT 
    user_id,
    sso_id,
    username,
    email,
    first_name,
    last_name,
    role,
    redeemable_points,
    profile_picture,
    created_at,
    updated_at
FROM [ImportedUsers]; -- Temporary table with exported data

SET IDENTITY_INSERT [Users] OFF;

-- Similar process for other tables...
-- (Repeat for Events, Rewards, EventParticipants, RewardRedemptions, Feedback, AdminActivityLog)
```

---

## Application Code Changes

### 1. Backend API Development (.NET Core)

#### Create New .NET Core Web API Project

```bash
dotnet new webapi -n EcoWaveHub.API
cd EcoWaveHub.API
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
dotnet add package Swashbuckle.AspNetCore
```

#### Entity Models

```csharp
// Models/User.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoWaveHub.API.Models
{
    [Table("Users")]
    public class User
    {
        [Key]
        public int UserId { get; set; }
        
        [StringLength(255)]
        public string? SsoId { get; set; }
        
        [StringLength(100)]
        public string? Username { get; set; }
        
        [Required]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;
        
        [StringLength(100)]
        public string? FirstName { get; set; }
        
        [StringLength(100)]
        public string? LastName { get; set; }
        
        [StringLength(50)]
        public string Role { get; set; } = "user";
        
        public int RedeemablePoints { get; set; } = 0;
        
        [StringLength(500)]
        public string? ProfilePicture { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual ICollection<Event> CreatedEvents { get; set; } = new List<Event>();
        public virtual ICollection<EventParticipant> EventParticipations { get; set; } = new List<EventParticipant>();
        public virtual ICollection<RewardRedemption> RewardRedemptions { get; set; } = new List<RewardRedemption>();
        public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
        public virtual ICollection<AdminActivityLog> AdminActivities { get; set; } = new List<AdminActivityLog>();
    }
}

// Models/Event.cs
[Table("Events")]
public class Event
{
    [Key]
    public int EventId { get; set; }
    
    [Required]
    [StringLength(255)]
    public string Title { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    [Required]
    public DateTime StartDate { get; set; }
    
    [Required]
    public DateTime EndDate { get; set; }
    
    [StringLength(255)]
    public string? Location { get; set; }
    
    public int Points { get; set; } = 100;
    
    public int? CreatedBy { get; set; }
    
    [StringLength(100)]
    public string? RegistrationId { get; set; }
    
    [StringLength(500)]
    public string? ThumbnailImage { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    [ForeignKey("CreatedBy")]
    public virtual User? Creator { get; set; }
    public virtual ICollection<EventParticipant> Participants { get; set; } = new List<EventParticipant>();
    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
}

// Similar models for Reward, EventParticipant, RewardRedemption, Feedback, AdminActivityLog
```

#### DbContext

```csharp
// Data/EcoWaveDbContext.cs
using Microsoft.EntityFrameworkCore;
using EcoWaveHub.API.Models;

namespace EcoWaveHub.API.Data
{
    public class EcoWaveDbContext : DbContext
    {
        public EcoWaveDbContext(DbContextOptions<EcoWaveDbContext> options) : base(options)
        {
        }
        
        public DbSet<User> Users { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<Reward> Rewards { get; set; }
        public DbSet<EventParticipant> EventParticipants { get; set; }
        public DbSet<RewardRedemption> RewardRedemptions { get; set; }
        public DbSet<Feedback> Feedbacks { get; set; }
        public DbSet<AdminActivityLog> AdminActivityLogs { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Configure relationships
            modelBuilder.Entity<Event>()
                .HasOne(e => e.Creator)
                .WithMany(u => u.CreatedEvents)
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.SetNull);
                
            modelBuilder.Entity<EventParticipant>()
                .HasOne(ep => ep.User)
                .WithMany(u => u.EventParticipations)
                .HasForeignKey(ep => ep.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<EventParticipant>()
                .HasOne(ep => ep.Event)
                .WithMany(e => e.Participants)
                .HasForeignKey(ep => ep.EventId)
                .OnDelete(DeleteBehavior.Cascade);
                
            // Configure indexes
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
                
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Role);
                
            modelBuilder.Entity<Event>()
                .HasIndex(e => e.StartDate);
                
            // Configure check constraints
            modelBuilder.Entity<Feedback>()
                .HasCheckConstraint("CK_Feedback_Rating", "[Rating] >= 1 AND [Rating] <= 5");
        }
    }
}
```

#### Controllers

```csharp
// Controllers/EventsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcoWaveHub.API.Data;
using EcoWaveHub.API.Models;
using EcoWaveHub.API.DTOs;
using AutoMapper;

namespace EcoWaveHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly EcoWaveDbContext _context;
        private readonly IMapper _mapper;
        
        public EventsController(EcoWaveDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventDto>>> GetEvents()
        {
            var events = await _context.Events
                .Include(e => e.Creator)
                .Include(e => e.Participants)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();
                
            var eventDtos = _mapper.Map<List<EventDto>>(events);
            return Ok(eventDtos);
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<EventDto>> GetEvent(int id)
        {
            var eventEntity = await _context.Events
                .Include(e => e.Creator)
                .Include(e => e.Participants)
                .ThenInclude(p => p.User)
                .FirstOrDefaultAsync(e => e.EventId == id);
                
            if (eventEntity == null)
            {
                return NotFound();
            }
            
            var eventDto = _mapper.Map<EventDto>(eventEntity);
            return Ok(eventDto);
        }
        
        [HttpPost]
        public async Task<ActionResult<EventDto>> CreateEvent(CreateEventDto createEventDto)
        {
            var eventEntity = _mapper.Map<Event>(createEventDto);
            eventEntity.CreatedAt = DateTime.UtcNow;
            eventEntity.UpdatedAt = DateTime.UtcNow;
            
            _context.Events.Add(eventEntity);
            await _context.SaveChangesAsync();
            
            var eventDto = _mapper.Map<EventDto>(eventEntity);
            return CreatedAtAction(nameof(GetEvent), new { id = eventEntity.EventId }, eventDto);
        }
        
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEvent(int id, UpdateEventDto updateEventDto)
        {
            var eventEntity = await _context.Events.FindAsync(id);
            if (eventEntity == null)
            {
                return NotFound();
            }
            
            _mapper.Map(updateEventDto, eventEntity);
            eventEntity.UpdatedAt = DateTime.UtcNow;
            
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EventExists(id))
                {
                    return NotFound();
                }
                throw;
            }
            
            return NoContent();
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var eventEntity = await _context.Events.FindAsync(id);
            if (eventEntity == null)
            {
                return NotFound();
            }
            
            _context.Events.Remove(eventEntity);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        private bool EventExists(int id)
        {
            return _context.Events.Any(e => e.EventId == id);
        }
    }
}
```

#### DTOs

```csharp
// DTOs/EventDto.cs
namespace EcoWaveHub.API.DTOs
{
    public class EventDto
    {
        public int EventId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Location { get; set; }
        public int Points { get; set; }
        public string? ThumbnailImage { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string? CreatorName { get; set; }
        public int ParticipantCount { get; set; }
        public string Status { get; set; } = string.Empty;
    }
    
    public class CreateEventDto
    {
        [Required]
        [StringLength(255)]
        public string Title { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        [StringLength(255)]
        public string? Location { get; set; }
        
        public int Points { get; set; } = 100;
        
        public int? CreatedBy { get; set; }
        
        [StringLength(500)]
        public string? ThumbnailImage { get; set; }
    }
    
    public class UpdateEventDto
    {
        [StringLength(255)]
        public string? Title { get; set; }
        
        public string? Description { get; set; }
        
        public DateTime? StartDate { get; set; }
        
        public DateTime? EndDate { get; set; }
        
        [StringLength(255)]
        public string? Location { get; set; }
        
        public int? Points { get; set; }
        
        [StringLength(500)]
        public string? ThumbnailImage { get; set; }
    }
}
```

#### AutoMapper Profile

```csharp
// Mappings/MappingProfile.cs
using AutoMapper;
using EcoWaveHub.API.Models;
using EcoWaveHub.API.DTOs;

namespace EcoWaveHub.API.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Event, EventDto>()
                .ForMember(dest => dest.CreatorName, opt => opt.MapFrom(src => 
                    src.Creator != null ? $"{src.Creator.FirstName} {src.Creator.LastName}".Trim() : null))
                .ForMember(dest => dest.ParticipantCount, opt => opt.MapFrom(src => src.Participants.Count))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => 
                    DateTime.UtcNow < src.StartDate ? "upcoming" :
                    DateTime.UtcNow > src.EndDate ? "completed" : "ongoing"));
                    
            CreateMap<CreateEventDto, Event>();
            CreateMap<UpdateEventDto, Event>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
                
            // Similar mappings for other entities
        }
    }
}
```

#### Startup Configuration

```csharp
// Program.cs
using Microsoft.EntityFrameworkCore;
using EcoWaveHub.API.Data;
using EcoWaveHub.API.Mappings;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddDbContext<EcoWaveDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAutoMapper(typeof(MappingProfile));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173", "https://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

app.Run();
```

### 2. Frontend Changes

#### New API Service Layer

```typescript
// src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7001/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  // Events API
  async getEvents(): Promise<Event[]> {
    return this.request<Event[]>('/events');
  }

  async getEvent(id: string): Promise<Event> {
    return this.request<Event>(`/events/${id}`);
  }

  async createEvent(event: CreateEventData): Promise<Event> {
    return this.request<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async updateEvent(id: string, event: UpdateEventData): Promise<void> {
    return this.request<void>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  }

  async deleteEvent(id: string): Promise<void> {
    return this.request<void>(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Users API
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async createUser(user: CreateUserData): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUser(id: string, user: UpdateUserData): Promise<void> {
    return this.request<void>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  // Rewards API
  async getRewards(): Promise<Reward[]> {
    return this.request<Reward[]>('/rewards');
  }

  async createReward(reward: CreateRewardData): Promise<Reward> {
    return this.request<Reward>('/rewards', {
      method: 'POST',
      body: JSON.stringify(reward),
    });
  }

  // Feedback API
  async getFeedback(): Promise<Feedback[]> {
    return this.request<Feedback[]>('/feedback');
  }

  // Admin History API
  async getAdminHistory(): Promise<AdminHistory[]> {
    return this.request<AdminHistory[]>('/admin-history');
  }
}

export const apiService = new ApiService();
```

#### Updated Hooks

```typescript
// src/hooks/useEvents.ts
import { useState, useEffect } from 'react';
import { apiService } from '../lib/api';
import { Event } from '../types';

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
      setEvents(prevEvents => [newEvent, ...prevEvents]);
      return { data: newEvent, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      return { data: null, error: errorMessage };
    }
  };

  const updateEvent = async (id: string, eventData: UpdateEventData) => {
    try {
      await apiService.updateEvent(id, eventData);
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === id ? { ...event, ...eventData } : event
        )
      );
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      return { error: errorMessage };
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await apiService.deleteEvent(id);
      setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      return { error: errorMessage };
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents
  };
}
```

#### Type Definitions

```typescript
// src/types/index.ts
export interface Event {
  eventId: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  points: number;
  thumbnailImage?: string;
  createdAt: string;
  updatedAt: string;
  creatorName?: string;
  participantCount: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  // Computed fields for compatibility
  id: string;
  date: string;
  image_url?: string;
  max_participants?: number;
}

export interface User {
  userId: number;
  ssoId?: string;
  username?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  redeemablePoints: number;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
  // Computed fields for compatibility
  id: string;
  full_name: string;
  points: number;
  avatar_url?: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  points?: number;
  createdBy?: number;
  thumbnailImage?: string;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  points?: number;
  thumbnailImage?: string;
}
```

---

## Configuration Updates

### 1. Environment Variables

#### .env file
```env
# API Configuration
VITE_API_BASE_URL=https://localhost:7001/api

# Authentication (if using custom auth)
VITE_AUTH_ENDPOINT=https://localhost:7001/auth
VITE_JWT_SECRET=your-jwt-secret-key

# File Storage (if using Azure Blob Storage)
VITE_STORAGE_ACCOUNT=your-storage-account
VITE_STORAGE_CONTAINER=images
VITE_STORAGE_BASE_URL=https://yourstorageaccount.blob.core.windows.net

# Database (for backend)
CONNECTION_STRING=Server=localhost;Database=EcoWaveHub;Trusted_Connection=true;TrustServerCertificate=true;
```

#### appsettings.json (Backend)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=EcoWaveHub;Trusted_Connection=true;TrustServerCertificate=true;"
  },
  "JwtSettings": {
    "SecretKey": "your-super-secret-key-that-is-at-least-32-characters-long",
    "Issuer": "EcoWaveHub",
    "Audience": "EcoWaveHub-Users",
    "ExpirationInMinutes": 60
  },
  "AzureStorage": {
    "ConnectionString": "DefaultEndpointsProtocol=https;AccountName=yourstorageaccount;AccountKey=yourkey;EndpointSuffix=core.windows.net",
    "ContainerName": "images"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

### 2. Package.json Updates

```json
{
  "name": "ecowave-hub",
  "version": "2.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@radix-ui/react-avatar": "^1.1.1",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "class-variance-authority": "^0.7.0",
    "clsx": "2.1.1",
    "lucide-react": "^0.453.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.1",
    "tailwind-merge": "2.5.4",
    "axios": "^1.6.0",
    "react-query": "^3.39.0"
  },
  "devDependencies": {
    "@types/react": "18.2.0",
    "@types/react-dom": "18.2.0",
    "@vitejs/plugin-react": "4.3.4",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "3.4.16",
    "typescript": "^5.0.0",
    "vite": "6.0.4"
  }
}
```

---

## Authentication Changes

### 1. Custom JWT Authentication (Backend)

```csharp
// Services/AuthService.cs
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EcoWaveHub.API.Models;
using EcoWaveHub.API.DTOs;

namespace EcoWaveHub.API.Services
{
    public interface IAuthService
    {
        Task<AuthResult> LoginAsync(LoginDto loginDto);
        Task<AuthResult> RegisterAsync(RegisterDto registerDto);
        string GenerateJwtToken(User user);
    }

    public class AuthService : IAuthService
    {
        private readonly EcoWaveDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(EcoWaveDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResult> LoginAsync(LoginDto loginDto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null || !VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                return new AuthResult { Success = false, Message = "Invalid credentials" };
            }

            var token = GenerateJwtToken(user);
            return new AuthResult 
            { 
                Success = true, 
                Token = token, 
                User = user 
            };
        }

        public async Task<AuthResult> RegisterAsync(RegisterDto registerDto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                return new AuthResult { Success = false, Message = "Email already exists" };
            }

            var user = new User
            {
                Email = registerDto.Email,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Role = registerDto.Role ?? "user",
                PasswordHash = HashPassword(registerDto.Password),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);
            return new AuthResult 
            { 
                Success = true, 
                Token = token, 
                User = user 
            };
        }

        public string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            var key = Encoding.ASCII.GetBytes(secretKey);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("full_name", $"{user.FirstName} {user.LastName}".Trim())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(int.Parse(jwtSettings["ExpirationInMinutes"])),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        private bool VerifyPassword(string password, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
    }
}
```

### 2. Frontend Authentication Service

```typescript
// src/lib/auth.ts
interface AuthUser {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  full_name: string;
}

interface AuthResult {
  success: boolean;
  token?: string;
  user?: AuthUser;
  message?: string;
}

class AuthService {
  private readonly API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7001/api';
  private readonly TOKEN_KEY = 'ecowave_token';
  private readonly USER_KEY = 'ecowave_user';

  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem(this.TOKEN_KEY, result.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(result.user));
      }

      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred',
      };
    }
  }

  async register(email: string, password: string, firstName: string, lastName: string, role: string = 'admin'): Promise<AuthResult> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName, role }),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem(this.TOKEN_KEY, result.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(result.user));
      }

      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred',
      };
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): AuthUser | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export const authService = new AuthService();
```

---

## File Storage Migration

### 1. Azure Blob Storage Service

```csharp
// Services/BlobStorageService.cs
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace EcoWaveHub.API.Services
{
    public interface IBlobStorageService
    {
        Task<string> UploadFileAsync(IFormFile file, string containerName = "images");
        Task<bool> DeleteFileAsync(string fileName, string containerName = "images");
        string GetFileUrl(string fileName, string containerName = "images");
    }

    public class BlobStorageService : IBlobStorageService
    {
        private readonly BlobServiceClient _blobServiceClient;
        private readonly IConfiguration _configuration;

        public BlobStorageService(IConfiguration configuration)
        {
            _configuration = configuration;
            var connectionString = _configuration.GetConnectionString("AzureStorage");
            _blobServiceClient = new BlobServiceClient(connectionString);
        }

        public async Task<string> UploadFileAsync(IFormFile file, string containerName = "images")
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

            var fileName = $"{Guid.NewGuid()}-{file.FileName}";
            var blobClient = containerClient.GetBlobClient(fileName);

            using var stream = file.OpenReadStream();
            await blobClient.UploadAsync(stream, new BlobHttpHeaders 
            { 
                ContentType = file.ContentType 
            });

            return blobClient.Uri.ToString();
        }

        public async Task<bool> DeleteFileAsync(string fileName, string containerName = "images")
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            var blobClient = containerClient.GetBlobClient(fileName);

            var response = await blobClient.DeleteIfExistsAsync();
            return response.Value;
        }

        public string GetFileUrl(string fileName, string containerName = "images")
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            var blobClient = containerClient.GetBlobClient(fileName);
            return blobClient.Uri.ToString();
        }
    }
}
```

### 2. File Upload Controller

```csharp
// Controllers/FilesController.cs
[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    private readonly IBlobStorageService _blobStorageService;

    public FilesController(IBlobStorageService blobStorageService)
    {
        _blobStorageService = blobStorageService;
    }

    [HttpPost("upload")]
    public async Task<ActionResult<FileUploadResult>> UploadFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file provided");
        }

        // Validate file type
        var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType))
        {
            return BadRequest("Invalid file type");
        }

        // Validate file size (10MB max)
        if (file.Length > 10 * 1024 * 1024)
        {
            return BadRequest("File too large");
        }

        try
        {
            var fileUrl = await _blobStorageService.UploadFileAsync(file);
            return Ok(new FileUploadResult 
            { 
                Success = true, 
                FileUrl = fileUrl 
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new FileUploadResult 
            { 
                Success = false, 
                Error = ex.Message 
            });
        }
    }
}

public class FileUploadResult
{
    public bool Success { get; set; }
    public string? FileUrl { get; set; }
    public string? Error { get; set; }
}
```

### 3. Frontend File Upload Service

```typescript
// src/lib/fileUpload.ts
interface FileUploadResult {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

class FileUploadService {
  private readonly API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7001/api';

  async uploadFile(file: File): Promise<FileUploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.API_BASE_URL}/files/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          ...authService.getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }
}

export const fileUploadService = new FileUploadService();
```

---

## Deployment Guide

### 1. Database Deployment

#### SQL Server Setup
```sql
-- Create database
CREATE DATABASE EcoWaveHub;
GO

USE EcoWaveHub;
GO

-- Run schema creation scripts
-- (Execute the SQL Server schema scripts from earlier)

-- Create database user for application
CREATE LOGIN EcoWaveApp WITH PASSWORD = 'YourSecurePassword123!';
CREATE USER EcoWaveApp FOR LOGIN EcoWaveApp;
ALTER ROLE db_datareader ADD MEMBER EcoWaveApp;
ALTER ROLE db_datawriter ADD MEMBER EcoWaveApp;
ALTER ROLE db_ddladmin ADD MEMBER EcoWaveApp;
```

#### Connection String
```
Server=your-sql-server.database.windows.net;Database=EcoWaveHub;User Id=EcoWaveApp;Password=YourSecurePassword123!;Encrypt=True;TrustServerCertificate=False;
```

### 2. Backend Deployment (Azure App Service)

#### Dockerfile
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY ["EcoWaveHub.API/EcoWaveHub.API.csproj", "EcoWaveHub.API/"]
RUN dotnet restore "EcoWaveHub.API/EcoWaveHub.API.csproj"
COPY . .
WORKDIR "/src/EcoWaveHub.API"
RUN dotnet build "EcoWaveHub.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "EcoWaveHub.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "EcoWaveHub.API.dll"]
```

#### Azure App Service Configuration
```bash
# Create resource group
az group create --name EcoWaveHub-RG --location "East US"

# Create App Service plan
az appservice plan create --name EcoWaveHub-Plan --resource-group EcoWaveHub-RG --sku B1 --is-linux

# Create web app
az webapp create --resource-group EcoWaveHub-RG --plan EcoWaveHub-Plan --name EcoWaveHub-API --runtime "DOTNETCORE|7.0"

# Configure app settings
az webapp config appsettings set --resource-group EcoWaveHub-RG --name EcoWaveHub-API --settings \
  ConnectionStrings__DefaultConnection="Server=your-sql-server.database.windows.net;Database=EcoWaveHub;User Id=EcoWaveApp;Password=YourSecurePassword123!;Encrypt=True;" \
  JwtSettings__SecretKey="your-super-secret-key-that-is-at-least-32-characters-long" \
  JwtSettings__Issuer="EcoWaveHub" \
  JwtSettings__Audience="EcoWaveHub-Users" \
  JwtSettings__ExpirationInMinutes="60"
```

### 3. Frontend Deployment

#### Build Configuration
```bash
# Install dependencies
npm install

# Build for production
npm run build

# The build output will be in the 'dist' folder
```

#### Azure Static Web Apps
```yaml
# .github/workflows/azure-static-web-apps.yml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: "dist"
        env:
          VITE_API_BASE_URL: "https://ecowave-api.azurewebsites.net/api"
```

---

## Testing Strategy

### 1. Database Migration Testing

```sql
-- Test data integrity after migration
SELECT 
    'Users' as TableName,
    COUNT(*) as RecordCount,
    MIN(CreatedAt) as EarliestRecord,
    MAX(CreatedAt) as LatestRecord
FROM Users
UNION ALL
SELECT 
    'Events',
    COUNT(*),
    MIN(CreatedAt),
    MAX(CreatedAt)
FROM Events
UNION ALL
SELECT 
    'Rewards',
    COUNT(*),
    MIN(CreatedAt),
    MAX(CreatedAt)
FROM Rewards;

-- Verify foreign key relationships
SELECT 
    e.EventId,
    e.Title,
    u.Email as CreatorEmail,
    COUNT(ep.ParticipantId) as ParticipantCount
FROM Events e
LEFT JOIN Users u ON e.CreatedBy = u.UserId
LEFT JOIN EventParticipants ep ON e.EventId = ep.EventId
GROUP BY e.EventId, e.Title, u.Email;
```

### 2. API Testing

```typescript
// tests/api.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { apiService } from '../src/lib/api';

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Setup test data
  });

  describe('Events API', () => {
    it('should fetch all events', async () => {
      const events = await apiService.getEvents();
      expect(Array.isArray(events)).toBe(true);
    });

    it('should create a new event', async () => {
      const eventData = {
        title: 'Test Event',
        description: 'Test Description',
        startDate: '2024-12-01T09:00:00Z',
        endDate: '2024-12-01T17:00:00Z',
        location: 'Test Location',
        points: 100
      };

      const event = await apiService.createEvent(eventData);
      expect(event.title).toBe(eventData.title);
      expect(event.eventId).toBeDefined();
    });
  });

  describe('Users API', () => {
    it('should fetch all users', async () => {
      const users = await apiService.getUsers();
      expect(Array.isArray(users)).toBe(true);
    });
  });
});
```

### 3. End-to-End Testing

```typescript
// tests/e2e/admin-workflow.test.ts
import { test, expect } from '@playwright/test';

test.describe('Admin Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login as admin
    await page.fill('[data-testid="email"]', 'admin@ecowave.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('should create, edit, and delete an event', async ({ page }) => {
    // Navigate to events
    await page.click('[data-testid="events-nav"]');
    await page.waitForURL('/events');

    // Create event
    await page.click('[data-testid="create-event-button"]');
    await page.fill('[data-testid="event-title"]', 'Test Event');
    await page.fill('[data-testid="event-description"]', 'Test Description');
    await page.fill('[data-testid="event-start-date"]', '2024-12-01T09:00');
    await page.fill('[data-testid="event-end-date"]', '2024-12-01T17:00');
    await page.fill('[data-testid="event-location"]', 'Test Location');
    await page.click('[data-testid="save-event-button"]');

    // Verify event was created
    await expect(page.locator('text=Test Event')).toBeVisible();

    // Edit event
    await page.click('[data-testid="edit-event-button"]');
    await page.fill('[data-testid="event-title"]', 'Updated Test Event');
    await page.click('[data-testid="save-event-button"]');

    // Verify event was updated
    await expect(page.locator('text=Updated Test Event')).toBeVisible();

    // Delete event
    await page.click('[data-testid="delete-event-button"]');
    await page.click('[data-testid="confirm-delete-button"]');

    // Verify event was deleted
    await expect(page.locator('text=Updated Test Event')).not.toBeVisible();
  });
});
```

---

## Rollback Plan

### 1. Database Rollback

```sql
-- Create backup before migration
BACKUP DATABASE EcoWaveHub 
TO DISK = 'C:\Backups\EcoWaveHub_PreMigration.bak'
WITH FORMAT, INIT;

-- Rollback script (if needed)
USE master;
GO

-- Drop current database
DROP DATABASE EcoWaveHub;
GO

-- Restore from backup
RESTORE DATABASE EcoWaveHub 
FROM DISK = 'C:\Backups\EcoWaveHub_PreMigration.bak'
WITH REPLACE;
GO
```

### 2. Application Rollback

#### Git Rollback
```bash
# Create backup branch
git checkout -b backup-before-mssql-migration

# If rollback needed
git checkout main
git revert <migration-commit-hash>
git push origin main
```

#### Environment Rollback
```bash
# Restore original environment variables
cp .env.supabase .env

# Reinstall Supabase dependencies
npm install @supabase/supabase-js

# Redeploy previous version
npm run build
# Deploy to hosting platform
```

### 3. DNS and Traffic Rollback

```bash
# If using Azure Traffic Manager or similar
az network traffic-manager endpoint update \
  --resource-group EcoWaveHub-RG \
  --profile-name EcoWaveHub-TM \
  --name primary-endpoint \
  --target supabase-app-url.com \
  --type externalEndpoints
```

---

## Migration Checklist

### Pre-Migration
- [ ] Backup current Supabase database
- [ ] Export all data from Supabase
- [ ] Set up SQL Server instance
- [ ] Create development environment
- [ ] Test schema conversion
- [ ] Prepare rollback plan

### Migration Phase 1: Database
- [ ] Create SQL Server database
- [ ] Run schema creation scripts
- [ ] Import data from Supabase
- [ ] Verify data integrity
- [ ] Test database performance
- [ ] Create database users and permissions

### Migration Phase 2: Backend
- [ ] Create .NET Core API project
- [ ] Implement Entity Framework models
- [ ] Create API controllers
- [ ] Implement authentication
- [ ] Set up file storage service
- [ ] Deploy to staging environment
- [ ] Run API tests

### Migration Phase 3: Frontend
- [ ] Update API service layer
- [ ] Modify authentication hooks
- [ ] Update type definitions
- [ ] Test all functionality
- [ ] Update environment configuration
- [ ] Deploy to staging environment

### Migration Phase 4: Testing
- [ ] Run unit tests
- [ ] Run integration tests
- [ ] Run end-to-end tests
- [ ] Performance testing
- [ ] Security testing
- [ ] User acceptance testing

### Migration Phase 5: Production
- [ ] Set up production SQL Server
- [ ] Deploy backend to production
- [ ] Deploy frontend to production
- [ ] Update DNS records
- [ ] Monitor application health
- [ ] Verify all functionality

### Post-Migration
- [ ] Monitor performance metrics
- [ ] Check error logs
- [ ] Verify data consistency
- [ ] Update documentation
- [ ] Train team on new architecture
- [ ] Plan Supabase decommissioning

---

## Estimated Costs

### Azure Services (Monthly)
- **Azure SQL Database (S2)**: ~$75/month
- **Azure App Service (B1)**: ~$55/month
- **Azure Blob Storage**: ~$5/month
- **Azure Static Web Apps**: Free tier available
- **Total**: ~$135/month

### Development Time
- **Database Migration**: 40 hours
- **Backend Development**: 80 hours
- **Frontend Updates**: 60 hours
- **Testing**: 40 hours
- **Deployment**: 20 hours
- **Total**: 240 hours

### Licensing
- **SQL Server**: Included with Azure SQL Database
- **Visual Studio**: Community edition (free) or Professional (~$45/month)
- **Azure DevOps**: Free for up to 5 users

---

## Conclusion

This migration guide provides a comprehensive roadmap for transitioning from Supabase to Microsoft SQL Server. The migration involves significant changes to both backend and frontend architecture, but the modular approach outlined here ensures a smooth transition with minimal downtime.

Key benefits of this migration:
- **Better integration** with Microsoft ecosystem
- **Enhanced security** with Azure Active Directory
- **Improved performance** with optimized SQL Server queries
- **Greater control** over data and infrastructure
- **Enterprise-grade** scalability and reliability

The estimated timeline of 6-9 weeks allows for thorough testing and validation at each phase, ensuring a successful migration with minimal risk to the production system.