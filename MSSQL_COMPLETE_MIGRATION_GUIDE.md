# EcoWave Hub - Complete Migration Guide to Microsoft SQL Server

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture Benefits](#architecture-benefits)
4. [Environment Configuration](#environment-configuration)
5. [Backend API Development](#backend-api-development)
6. [Database Setup](#database-setup)
7. [Data Migration](#data-migration)
8. [File Storage Migration](#file-storage-migration)
9. [Testing & Validation](#testing--validation)
10. [Deployment](#deployment)
11. [Rollback Strategy](#rollback-strategy)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This guide provides step-by-step instructions for migrating the EcoWave Hub application from Supabase to Microsoft SQL Server Management Studio (SSMS). 

### Key Benefits
- **✅ Zero Frontend Changes Required** - Thanks to the MVC architecture already implemented
- **✅ Environment-Based Configuration** - Switch databases via environment variables
- **✅ Type-Safe Data Access** - Consistent interfaces across all operations
- **✅ Easy Rollback** - Simple configuration change to revert

---

## 🔧 Prerequisites

### Required Software
- **SQL Server Management Studio (SSMS)** - Latest version
- **SQL Server 2019+** (Local instance, Azure SQL Database, or SQL Server on VM)
- **Visual Studio 2022** or **Visual Studio Code** with C# extension
- **.NET 8.0 SDK** or later
- **Azure CLI** (if using Azure services)

### Required Azure Services (Recommended)
- **Azure SQL Database** - For database hosting
- **Azure App Service** - For API hosting
- **Azure Blob Storage** - For file uploads
- **Azure Key Vault** - For secure credential storage

### Current Project Requirements
- Node.js 18+ (for frontend)
- The project already has MVC abstraction layer implemented

---

## 🏗️ Architecture Benefits

The application uses a **Model-View-Controller (MVC)** pattern:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      VIEW       │    │   CONTROLLER    │    │      MODEL      │
│                 │    │                 │    │                 │
│ React Components│◄──►│  Data Service   │◄──►│ Database/API    │
│   (Frontend)    │    │  Abstraction    │    │   (Backend)     │
│                 │    │                 │    │                 │
│ ✅ No Changes   │    │ 📝 Config Only │    │ 🆕 New Backend │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Current Implementation
- **Model**: TypeScript interfaces in `src/lib/dataService.ts`
- **View**: React components (unchanged)
- **Controller**: Data service factory that switches between Supabase and MS SQL

---

## 🌐 Environment Configuration

### Step 1: Update Environment Variables

The application automatically switches data sources based on environment configuration.

#### Current `.env` file (Supabase):
```env
# Data Service Configuration
VITE_DATA_SERVICE_TYPE=supabase

# Supabase Configuration
VITE_SUPABASE_URL=https://cyaxqdwhbgjjubecxbnv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Configuration (for direct access if needed)
DB_HOST=db.cyaxqdwhbgjjubecxbnv.supabase.co
DB_USER=postgres
DB_PASS=?5kmh22K.jX7M4C
DB_NAME=postgres
DB_PORT=5432
DB_SSL=true
```

#### Updated `.env` file (MS SQL):
```env
# Data Service Configuration
VITE_DATA_SERVICE_TYPE=mssql

# MS SQL API Configuration
VITE_API_BASE_URL=https://ecowave-api.azurewebsites.net

# Database Configuration (for direct database access if needed)
DB_HOST=ecowave-sql-server.database.windows.net
DB_USER=ecowave_admin
DB_PASS=YourSecurePassword123!
DB_NAME=EcoWaveHub
DB_PORT=1433
DB_SSL=true

# Remove or comment out Supabase configuration
# VITE_SUPABASE_URL=https://cyaxqdwhbgjjubecxbnv.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 2: Update `.env.example`

Update the example file to reflect the new configuration options:

```env
# Data Service Configuration
VITE_DATA_SERVICE_TYPE=mssql
# Options: 'supabase' or 'mssql'

# MS SQL API Configuration (when using MS SQL)
VITE_API_BASE_URL=https://your-api.azurewebsites.net

# Supabase Configuration (when using Supabase - for reference)
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Database Configuration (for direct database access if needed)
DB_HOST=your-sql-server.database.windows.net
DB_USER=your_username
DB_PASS=your_password
DB_NAME=EcoWaveHub
DB_PORT=1433
DB_SSL=true
```

---

## 🔨 Backend API Development

### Step 3: Create .NET Core Web API Project

#### 3.1 Initialize the Project

```bash
# Create new Web API project
dotnet new webapi -n EcoWaveHub.API
cd EcoWaveHub.API

# Add required packages
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add package Azure.Storage.Blobs
dotnet add package Swashbuckle.AspNetCore
```

#### 3.2 Create the Project Structure

```
EcoWaveHub.API/
├── Controllers/
│   ├── AuthController.cs
│   ├── UsersController.cs
│   ├── EventsController.cs
│   ├── RewardsController.cs
│   ├── FeedbackController.cs
│   ├── DashboardController.cs
│   ├── AdminController.cs
│   └── UploadController.cs
├── Models/
│   ├── User.cs
│   ├── Event.cs
│   ├── Reward.cs
│   ├── Feedback.cs
│   ├── AdminActivityLog.cs
│   └── DTOs/
├── Data/
│   └── EcoWaveDbContext.cs
├── Services/
│   ├── IAuthService.cs
│   ├── AuthService.cs
│   ├── IFileUploadService.cs
│   └── FileUploadService.cs
└── Program.cs
```

#### 3.3 Database Models

**Models/User.cs**
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoWaveHub.API.Models
{
    [Table("Users")]
    public class User
    {
        [Key]
        public int UserId { get; set; }
        
        public string? SsoId { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Username { get; set; }
        
        [Required]
        public string Role { get; set; } = "user";
        
        public int RedeemablePoints { get; set; } = 0;
        public string? ProfilePicture { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual ICollection<Event> CreatedEvents { get; set; } = new List<Event>();
        public virtual ICollection<Feedback> Feedback { get; set; } = new List<Feedback>();
        public virtual ICollection<AdminActivityLog> AdminActions { get; set; } = new List<AdminActivityLog>();
    }
}
```

**Models/Event.cs**
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoWaveHub.API.Models
{
    [Table("Events")]
    public class Event
    {
        [Key]
        public int EventId { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        public string? Location { get; set; }
        public int Points { get; set; } = 100;
        public int? CreatedBy { get; set; }
        public string? ThumbnailImage { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        [ForeignKey("CreatedBy")]
        public virtual User? Creator { get; set; }
        
        public virtual ICollection<Feedback> Feedback { get; set; } = new List<Feedback>();
    }
}
```

**Models/Reward.cs**
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoWaveHub.API.Models
{
    [Table("Rewards")]
    public class Reward
    {
        [Key]
        public int RewardId { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Required]
        public int PointsRequired { get; set; }
        
        [Required]
        public int Stock { get; set; }
        
        public string? ImageUrl { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual ICollection<RewardRedemption> Redemptions { get; set; } = new List<RewardRedemption>();
    }
}
```

**Models/Feedback.cs**
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoWaveHub.API.Models
{
    [Table("Feedback")]
    public class Feedback
    {
        [Key]
        public int FeedbackId { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        public int? EventId { get; set; }
        
        [Range(1, 5)]
        public int? Rating { get; set; }
        
        public string? Comment { get; set; }
        
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
        
        [ForeignKey("EventId")]
        public virtual Event? Event { get; set; }
    }
}
```

**Models/AdminActivityLog.cs**
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoWaveHub.API.Models
{
    [Table("AdminActivityLog")]
    public class AdminActivityLog
    {
        [Key]
        public int LogId { get; set; }
        
        [Required]
        public int AdminId { get; set; }
        
        [Required]
        public string ActionType { get; set; } = string.Empty;
        
        [Required]
        public string EntityType { get; set; } = string.Empty;
        
        [Required]
        public int EntityId { get; set; }
        
        public string? Details { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        [ForeignKey("AdminId")]
        public virtual User Admin { get; set; } = null!;
    }
}
```

#### 3.4 Database Context

**Data/EcoWaveDbContext.cs**
```csharp
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
        public DbSet<Feedback> Feedback { get; set; }
        public DbSet<AdminActivityLog> AdminActivityLogs { get; set; }
        public DbSet<RewardRedemption> RewardRedemptions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.UserId);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.SsoId).IsUnique();
                entity.Property(e => e.Role).HasDefaultValue("user");
                entity.Property(e => e.RedeemablePoints).HasDefaultValue(0);
            });

            // Configure Event entity
            modelBuilder.Entity<Event>(entity =>
            {
                entity.HasKey(e => e.EventId);
                entity.Property(e => e.Points).HasDefaultValue(100);
                
                entity.HasOne(e => e.Creator)
                    .WithMany(u => u.CreatedEvents)
                    .HasForeignKey(e => e.CreatedBy)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Configure Reward entity
            modelBuilder.Entity<Reward>(entity =>
            {
                entity.HasKey(e => e.RewardId);
                entity.Property(e => e.Stock).HasDefaultValue(0);
            });

            // Configure Feedback entity
            modelBuilder.Entity<Feedback>(entity =>
            {
                entity.HasKey(e => e.FeedbackId);
                
                entity.HasOne(f => f.User)
                    .WithMany(u => u.Feedback)
                    .HasForeignKey(f => f.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(f => f.Event)
                    .WithMany(e => e.Feedback)
                    .HasForeignKey(f => f.EventId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Configure AdminActivityLog entity
            modelBuilder.Entity<AdminActivityLog>(entity =>
            {
                entity.HasKey(e => e.LogId);
                
                entity.HasOne(a => a.Admin)
                    .WithMany(u => u.AdminActions)
                    .HasForeignKey(a => a.AdminId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
```

#### 3.5 Program.cs Configuration

**Program.cs**
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using EcoWaveHub.API.Data;
using EcoWaveHub.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Entity Framework
builder.Services.AddDbContext<EcoWaveDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://your-frontend-domain.com")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? ""))
        };
    });

// Add custom services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IFileUploadService, FileUploadService>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<EcoWaveDbContext>();
    context.Database.EnsureCreated();
}

app.Run();
```

#### 3.6 API Controllers

**Controllers/AuthController.cs**
```csharp
using Microsoft.AspNetCore.Mvc;
using EcoWaveHub.API.Services;
using EcoWaveHub.API.Models.DTOs;

namespace EcoWaveHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                var result = await _authService.LoginAsync(loginDto.Email, loginDto.Password);
                
                if (result.Success)
                {
                    return Ok(new { token = result.Token, user = result.User });
                }
                
                return Unauthorized(new { message = result.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                var result = await _authService.RegisterAsync(
                    registerDto.Email, 
                    registerDto.Password, 
                    registerDto.FullName, 
                    registerDto.Role ?? "user");
                
                if (result.Success)
                {
                    return Ok(new { token = result.Token, user = result.User });
                }
                
                return BadRequest(new { message = result.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _authService.GetUserByIdAsync(int.Parse(userId));
                if (user == null)
                {
                    return NotFound();
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
}
```

**Controllers/UsersController.cs**
```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using EcoWaveHub.API.Data;
using EcoWaveHub.API.Models;
using EcoWaveHub.API.Models.DTOs;

namespace EcoWaveHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly EcoWaveDbContext _context;

        public UsersController(EcoWaveDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var users = await _context.Users
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new UserDto
                {
                    Id = u.UserId.ToString(),
                    Email = u.Email,
                    FullName = $"{u.FirstName} {u.LastName}".Trim(),
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Role = u.Role,
                    Points = u.RedeemablePoints,
                    AvatarUrl = u.ProfilePicture,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPost]
        public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto createUserDto)
        {
            var user = new User
            {
                Email = createUserDto.Email,
                FirstName = createUserDto.FirstName,
                LastName = createUserDto.LastName,
                Username = createUserDto.Email.Split('@')[0],
                Role = createUserDto.Role,
                RedeemablePoints = 0,
                SsoId = $"manual-{DateTime.UtcNow.Ticks}-{Guid.NewGuid().ToString("N")[..8]}"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var userDto = new UserDto
            {
                Id = user.UserId.ToString(),
                Email = user.Email,
                FullName = $"{user.FirstName} {user.LastName}".Trim(),
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role,
                Points = user.RedeemablePoints,
                AvatarUrl = user.ProfilePicture,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };

            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, userDto);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            var userDto = new UserDto
            {
                Id = user.UserId.ToString(),
                Email = user.Email,
                FullName = $"{user.FirstName} {user.LastName}".Trim(),
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role,
                Points = user.RedeemablePoints,
                AvatarUrl = user.ProfilePicture,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };

            return Ok(userDto);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<UserDto>> UpdateUser(int id, [FromBody] UpdateUserDto updateUserDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Update user properties
            if (!string.IsNullOrEmpty(updateUserDto.Email))
                user.Email = updateUserDto.Email;
            
            if (!string.IsNullOrEmpty(updateUserDto.Role))
                user.Role = updateUserDto.Role;
            
            if (updateUserDto.Points.HasValue)
                user.RedeemablePoints = updateUserDto.Points.Value;
            
            if (!string.IsNullOrEmpty(updateUserDto.AvatarUrl))
                user.ProfilePicture = updateUserDto.AvatarUrl;
            
            if (!string.IsNullOrEmpty(updateUserDto.FullName))
            {
                var nameParts = updateUserDto.FullName.Split(' ', 2);
                user.FirstName = nameParts[0];
                user.LastName = nameParts.Length > 1 ? nameParts[1] : "";
            }

            user.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            var userDto = new UserDto
            {
                Id = user.UserId.ToString(),
                Email = user.Email,
                FullName = $"{user.FirstName} {user.LastName}".Trim(),
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role,
                Points = user.RedeemablePoints,
                AvatarUrl = user.ProfilePicture,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };

            return Ok(userDto);
        }

        [HttpPost("{id}/points")]
        public async Task<ActionResult<UserDto>> AddPoints(int id, [FromBody] AddPointsDto addPointsDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            user.RedeemablePoints += addPointsDto.Points;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var userDto = new UserDto
            {
                Id = user.UserId.ToString(),
                Email = user.Email,
                FullName = $"{user.FirstName} {user.LastName}".Trim(),
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role,
                Points = user.RedeemablePoints,
                AvatarUrl = user.ProfilePicture,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };

            return Ok(userDto);
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.UserId == id);
        }
    }
}
```

---

## 🗄️ Database Setup

### Step 4: Create SQL Server Database

#### 4.1 Azure SQL Database Setup (Recommended)

```bash
# Login to Azure
az login

# Create resource group
az group create --name EcoWaveHub-RG --location "East US"

# Create SQL Server
az sql server create \
    --name ecowave-sql-server \
    --resource-group EcoWaveHub-RG \
    --location "East US" \
    --admin-user ecowave_admin \
    --admin-password "YourSecurePassword123!"

# Create SQL Database
az sql db create \
    --resource-group EcoWaveHub-RG \
    --server ecowave-sql-server \
    --name EcoWaveHub \
    --service-objective Basic

# Configure firewall rule
az sql server firewall-rule create \
    --resource-group EcoWaveHub-RG \
    --server ecowave-sql-server \
    --name AllowAzureServices \
    --start-ip-address 0.0.0.0 \
    --end-ip-address 0.0.0.0
```

#### 4.2 Database Schema Creation

Connect to your SQL Server using SSMS and run the following script:

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

-- Create RewardRedemptions table
CREATE TABLE RewardRedemptions (
    RedemptionId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    RewardId INT NOT NULL,
    PointsDeducted INT NOT NULL,
    RedeemedAt DATETIME2 DEFAULT GETUTCDATE(),
    Status NVARCHAR(50) DEFAULT 'completed',
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (RewardId) REFERENCES Rewards(RewardId)
);

-- Create EventParticipants table
CREATE TABLE EventParticipants (
    ParticipantId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    EventId INT NOT NULL,
    JoinedAt DATETIME2 DEFAULT GETUTCDATE(),
    Status NVARCHAR(50) DEFAULT 'registered',
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (EventId) REFERENCES Events(EventId)
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
CREATE INDEX IX_Users_Role ON Users(Role);
CREATE INDEX IX_Events_StartDate ON Events(StartDate);
CREATE INDEX IX_Events_EndDate ON Events(EndDate);
CREATE INDEX IX_Events_CreatedBy ON Events(CreatedBy);
CREATE INDEX IX_Feedback_EventId ON Feedback(EventId);
CREATE INDEX IX_Feedback_UserId ON Feedback(UserId);
CREATE INDEX IX_AdminActivityLog_AdminId ON AdminActivityLog(AdminId);
CREATE INDEX IX_AdminActivityLog_CreatedAt ON AdminActivityLog(CreatedAt);
CREATE INDEX IX_RewardRedemptions_UserId ON RewardRedemptions(UserId);
CREATE INDEX IX_RewardRedemptions_RewardId ON RewardRedemptions(RewardId);
CREATE INDEX IX_EventParticipants_UserId ON EventParticipants(UserId);
CREATE INDEX IX_EventParticipants_EventId ON EventParticipants(EventId);

-- Insert sample admin user
INSERT INTO Users (Email, FirstName, LastName, Username, Role, RedeemablePoints, SsoId)
VALUES ('admin@ecowave.com', 'Admin', 'User', 'admin', 'admin', 0, 'admin-default-001');

PRINT 'Database schema created successfully!';
```

---

## 📊 Data Migration

### Step 5: Export Data from Supabase

#### 5.1 Export Script (Node.js)

Create a data export script:

```javascript
// export-supabase-data.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://cyaxqdwhbgjjubecxbnv.supabase.co';
const supabaseKey = 'your_supabase_anon_key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function exportData() {
    try {
        console.log('Starting data export...');

        // Export Users
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*');
        
        if (usersError) throw usersError;
        fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
        console.log(`Exported ${users.length} users`);

        // Export Events
        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('*');
        
        if (eventsError) throw eventsError;
        fs.writeFileSync('events.json', JSON.stringify(events, null, 2));
        console.log(`Exported ${events.length} events`);

        // Export Rewards
        const { data: rewards, error: rewardsError } = await supabase
            .from('rewards')
            .select('*');
        
        if (rewardsError) throw rewardsError;
        fs.writeFileSync('rewards.json', JSON.stringify(rewards, null, 2));
        console.log(`Exported ${rewards.length} rewards`);

        // Export Feedback
        const { data: feedback, error: feedbackError } = await supabase
            .from('feedback')
            .select('*');
        
        if (feedbackError) throw feedbackError;
        fs.writeFileSync('feedback.json', JSON.stringify(feedback, null, 2));
        console.log(`Exported ${feedback.length} feedback entries`);

        // Export Reward Redemptions
        const { data: redemptions, error: redemptionsError } = await supabase
            .from('reward_redemptions')
            .select('*');
        
        if (redemptionsError) throw redemptionsError;
        fs.writeFileSync('redemptions.json', JSON.stringify(redemptions, null, 2));
        console.log(`Exported ${redemptions.length} redemptions`);

        console.log('Data export completed successfully!');
    } catch (error) {
        console.error('Export failed:', error);
    }
}

exportData();
```

Run the export:
```bash
node export-supabase-data.js
```

#### 5.2 Data Transformation Script

```javascript
// transform-data.js
const fs = require('fs');

function transformData() {
    // Transform Users
    const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
    const transformedUsers = users.map(user => ({
        SsoId: user.sso_id,
        Email: user.email,
        FirstName: user.first_name,
        LastName: user.last_name,
        Username: user.username,
        Role: user.role,
        RedeemablePoints: user.redeemable_points || 0,
        ProfilePicture: user.profile_picture,
        CreatedAt: user.created_at,
        UpdatedAt: user.updated_at
    }));

    // Transform Events
    const events = JSON.parse(fs.readFileSync('events.json', 'utf8'));
    const transformedEvents = events.map(event => ({
        Title: event.title,
        Description: event.description,
        StartDate: event.start_date,
        EndDate: event.end_date,
        Location: event.location,
        Points: event.points || 100,
        CreatedBy: event.created_by,
        ThumbnailImage: event.thumbnail_image,
        CreatedAt: event.created_at,
        UpdatedAt: event.updated_at
    }));

    // Transform Rewards
    const rewards = JSON.parse(fs.readFileSync('rewards.json', 'utf8'));
    const transformedRewards = rewards.map(reward => ({
        Name: reward.name,
        Description: reward.description,
        PointsRequired: reward.points_required,
        Stock: reward.stock,
        ImageUrl: reward.image_url,
        CreatedAt: reward.created_at,
        UpdatedAt: reward.updated_at
    }));

    // Save transformed data
    fs.writeFileSync('transformed-users.json', JSON.stringify(transformedUsers, null, 2));
    fs.writeFileSync('transformed-events.json', JSON.stringify(transformedEvents, null, 2));
    fs.writeFileSync('transformed-rewards.json', JSON.stringify(transformedRewards, null, 2));

    console.log('Data transformation completed!');
}

transformData();
```

#### 5.3 SQL Server Import Script

```sql
-- Import Users
BULK INSERT Users
FROM 'C:\path\to\transformed-users.csv'
WITH (
    FIELDTERMINATOR = ',',
    ROWTERMINATOR = '\n',
    FIRSTROW = 2
);

-- Import Events
BULK INSERT Events
FROM 'C:\path\to\transformed-events.csv'
WITH (
    FIELDTERMINATOR = ',',
    ROWTERMINATOR = '\n',
    FIRSTROW = 2
);

-- Import Rewards
BULK INSERT Rewards
FROM 'C:\path\to\transformed-rewards.csv'
WITH (
    FIELDTERMINATOR = ',',
    ROWTERMINATOR = '\n',
    FIRSTROW = 2
);

-- Verify data import
SELECT 'Users' as TableName, COUNT(*) as RecordCount FROM Users
UNION ALL
SELECT 'Events', COUNT(*) FROM Events
UNION ALL
SELECT 'Rewards', COUNT(*) FROM Rewards
UNION ALL
SELECT 'Feedback', COUNT(*) FROM Feedback;
```

---

## 📁 File Storage Migration

### Step 6: Azure Blob Storage Setup

#### 6.1 Create Storage Account

```bash
# Create storage account
az storage account create \
    --name ecowavestorage \
    --resource-group EcoWaveHub-RG \
    --location "East US" \
    --sku Standard_LRS

# Get storage account key
az storage account keys list \
    --account-name ecowavestorage \
    --resource-group EcoWaveHub-RG

# Create blob container
az storage container create \
    --name images \
    --account-name ecowavestorage \
    --public-access blob
```

#### 6.2 File Upload Service

**Services/IFileUploadService.cs**
```csharp
namespace EcoWaveHub.API.Services
{
    public interface IFileUploadService
    {
        Task<string> UploadImageAsync(IFormFile file, string folder = "uploads");
        Task<bool> DeleteImageAsync(string imageUrl);
    }
}
```

**Services/FileUploadService.cs**
```csharp
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace EcoWaveHub.API.Services
{
    public class FileUploadService : IFileUploadService
    {
        private readonly BlobServiceClient _blobServiceClient;
        private readonly string _containerName = "images";

        public FileUploadService(IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("AzureStorage");
            _blobServiceClient = new BlobServiceClient(connectionString);
        }

        public async Task<string> UploadImageAsync(IFormFile file, string folder = "uploads")
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty");

            // Validate file type
            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
                throw new ArgumentException("Invalid file type");

            // Validate file size (10MB max)
            if (file.Length > 10 * 1024 * 1024)
                throw new ArgumentException("File too large");

            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

            var fileExtension = Path.GetExtension(file.FileName);
            var fileName = $"{folder}/{DateTime.UtcNow.Ticks}-{Guid.NewGuid():N}{fileExtension}";

            var blobClient = containerClient.GetBlobClient(fileName);

            using var stream = file.OpenReadStream();
            await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });

            return blobClient.Uri.ToString();
        }

        public async Task<bool> DeleteImageAsync(string imageUrl)
        {
            try
            {
                var uri = new Uri(imageUrl);
                var fileName = uri.Segments.Last();

                var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
                var blobClient = containerClient.GetBlobClient(fileName);

                await blobClient.DeleteIfExistsAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
```

---

## 🧪 Testing & Validation

### Step 7: Testing Strategy

#### 7.1 Unit Tests

Create test project:
```bash
dotnet new xunit -n EcoWaveHub.API.Tests
cd EcoWaveHub.API.Tests
dotnet add reference ../EcoWaveHub.API/EcoWaveHub.API.csproj
dotnet add package Microsoft.EntityFrameworkCore.InMemory
dotnet add package Microsoft.AspNetCore.Mvc.Testing
```

**Tests/UsersControllerTests.cs**
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc.Testing;
using EcoWaveHub.API.Data;
using EcoWaveHub.API.Controllers;
using Xunit;

namespace EcoWaveHub.API.Tests
{
    public class UsersControllerTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;

        public UsersControllerTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task GetUsers_ReturnsSuccessStatusCode()
        {
            // Arrange
            var client = _factory.CreateClient();

            // Act
            var response = await client.GetAsync("/api/users");

            // Assert
            response.EnsureSuccessStatusCode();
        }

        [Fact]
        public async Task CreateUser_WithValidData_ReturnsCreatedUser()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<EcoWaveDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            using var context = new EcoWaveDbContext(options);
            var controller = new UsersController(context);

            var createUserDto = new CreateUserDto
            {
                Email = "test@example.com",
                FirstName = "Test",
                LastName = "User",
                Role = "user"
            };

            // Act
            var result = await controller.CreateUser(createUserDto);

            // Assert
            Assert.NotNull(result.Value);
            Assert.Equal("test@example.com", result.Value.Email);
        }
    }
}
```

#### 7.2 Integration Tests

**Tests/IntegrationTests.cs**
```csharp
using Microsoft.AspNetCore.Mvc.Testing;
using System.Text;
using System.Text.Json;
using Xunit;

namespace EcoWaveHub.API.Tests
{
    public class IntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public IntegrationTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = _factory.CreateClient();
        }

        [Fact]
        public async Task FullUserWorkflow_CreateUpdateDelete_Success()
        {
            // Create user
            var createUserDto = new
            {
                Email = "integration@test.com",
                FirstName = "Integration",
                LastName = "Test",
                Role = "user"
            };

            var createContent = new StringContent(
                JsonSerializer.Serialize(createUserDto),
                Encoding.UTF8,
                "application/json");

            var createResponse = await _client.PostAsync("/api/users", createContent);
            createResponse.EnsureSuccessStatusCode();

            var createdUser = JsonSerializer.Deserialize<UserDto>(
                await createResponse.Content.ReadAsStringAsync());

            // Update user
            var updateUserDto = new
            {
                FullName = "Updated Name",
                Points = 100
            };

            var updateContent = new StringContent(
                JsonSerializer.Serialize(updateUserDto),
                Encoding.UTF8,
                "application/json");

            var updateResponse = await _client.PutAsync($"/api/users/{createdUser.Id}", updateContent);
            updateResponse.EnsureSuccessStatusCode();

            // Verify update
            var getResponse = await _client.GetAsync($"/api/users/{createdUser.Id}");
            getResponse.EnsureSuccessStatusCode();

            var updatedUser = JsonSerializer.Deserialize<UserDto>(
                await getResponse.Content.ReadAsStringAsync());

            Assert.Equal("Updated Name", updatedUser.FullName);
            Assert.Equal(100, updatedUser.Points);
        }
    }
}
```

#### 7.3 Frontend Testing

Test the frontend with both configurations:

```bash
# Test with Supabase
VITE_DATA_SERVICE_TYPE=supabase npm run dev

# Test with MS SQL
VITE_DATA_SERVICE_TYPE=mssql npm run dev
```

---

## 🚀 Deployment

### Step 8: Deploy to Azure

#### 8.1 Deploy API to Azure App Service

```bash
# Create App Service Plan
az appservice plan create \
    --name EcoWaveHub-Plan \
    --resource-group EcoWaveHub-RG \
    --sku B1 \
    --is-linux

# Create Web App
az webapp create \
    --resource-group EcoWaveHub-RG \
    --plan EcoWaveHub-Plan \
    --name ecowave-api \
    --runtime "DOTNETCORE|8.0"

# Configure connection string
az webapp config connection-string set \
    --resource-group EcoWaveHub-RG \
    --name ecowave-api \
    --connection-string-type SQLAzure \
    --settings DefaultConnection="Server=tcp:ecowave-sql-server.database.windows.net,1433;Initial Catalog=EcoWaveHub;Persist Security Info=False;User ID=ecowave_admin;Password=YourSecurePassword123!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

# Deploy from local Git
az webapp deployment source config-local-git \
    --name ecowave-api \
    --resource-group EcoWaveHub-RG

# Get deployment URL
az webapp show \
    --name ecowave-api \
    --resource-group EcoWaveHub-RG \
    --query defaultHostName \
    --output tsv
```

#### 8.2 Deploy Frontend to Azure Static Web Apps

```bash
# Build frontend for production
npm run build

# Create Static Web App
az staticwebapp create \
    --name ecowave-frontend \
    --resource-group EcoWaveHub-RG \
    --source https://github.com/your-username/ecowave-hub \
    --location "East US 2" \
    --branch main \
    --app-location "/" \
    --output-location "dist"
```

#### 8.3 Configure Environment Variables

Update your production `.env`:

```env
# Production Configuration
VITE_DATA_SERVICE_TYPE=mssql
VITE_API_BASE_URL=https://ecowave-api.azurewebsites.net

# Remove Supabase configuration
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
```

---

## 🔄 Rollback Strategy

### Step 9: Rollback Plan

#### 9.1 Immediate Rollback

If issues occur, immediately switch back to Supabase:

```env
# Emergency rollback - change environment variable
VITE_DATA_SERVICE_TYPE=supabase

# Restore Supabase configuration
VITE_SUPABASE_URL=https://cyaxqdwhbgjjubecxbnv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 9.2 Data Rollback

If data corruption occurs:

1. **Stop the application**
2. **Restore database from backup**
3. **Re-import clean data from Supabase**
4. **Restart with Supabase configuration**

#### 9.3 Gradual Migration

For safer migration, use feature flags:

```typescript
// Feature flag approach
const useNewDataService = import.meta.env.VITE_USE_NEW_DATA_SERVICE === 'true';

export const dataService = useNewDataService 
  ? DataServiceFactory.getInstance() 
  : new SupabaseDataService();
```

---

## 🔧 Troubleshooting

### Step 10: Common Issues and Solutions

#### 10.1 Database Connection Issues

**Problem**: Cannot connect to SQL Server
```
Error: Login failed for user 'ecowave_admin'
```

**Solution**:
```bash
# Check firewall rules
az sql server firewall-rule list \
    --resource-group EcoWaveHub-RG \
    --server ecowave-sql-server

# Add your IP address
az sql server firewall-rule create \
    --resource-group EcoWaveHub-RG \
    --server ecowave-sql-server \
    --name AllowMyIP \
    --start-ip-address YOUR_IP \
    --end-ip-address YOUR_IP
```

#### 10.2 CORS Issues

**Problem**: Frontend cannot access API
```
Access to fetch at 'https://ecowave-api.azurewebsites.net' from origin 'https://ecowave-frontend.azurestaticapps.net' has been blocked by CORS policy
```

**Solution**: Update CORS configuration in `Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173", 
            "https://ecowave-frontend.azurestaticapps.net",
            "https://your-custom-domain.com"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});
```

#### 10.3 Authentication Issues

**Problem**: JWT tokens not working
```
Error: 401 Unauthorized
```

**Solution**: Check JWT configuration:
```csharp
// Ensure JWT settings are correct in appsettings.json
{
  "Jwt": {
    "Key": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!",
    "Issuer": "EcoWaveHub",
    "Audience": "EcoWaveHub-Users"
  }
}
```

#### 10.4 File Upload Issues

**Problem**: Images not uploading to Azure Blob Storage
```
Error: The remote server returned an error: (403) Forbidden
```

**Solution**: Check storage account configuration:
```bash
# Verify storage account access
az storage account show \
    --name ecowavestorage \
    --resource-group EcoWaveHub-RG

# Update connection string in app settings
az webapp config appsettings set \
    --resource-group EcoWaveHub-RG \
    --name ecowave-api \
    --settings AzureStorage="DefaultEndpointsProtocol=https;AccountName=ecowavestorage;AccountKey=YOUR_KEY;EndpointSuffix=core.windows.net"
```

#### 10.5 Performance Issues

**Problem**: Slow API responses

**Solution**: Optimize database queries and add caching:
```csharp
// Add response caching
builder.Services.AddResponseCaching();

// Add memory cache
builder.Services.AddMemoryCache();

// Use in controllers
[ResponseCache(Duration = 300)] // 5 minutes
public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
{
    // Implementation
}
```

---

## 📋 Migration Checklist

### Pre-Migration
- [ ] Backup all Supabase data
- [ ] Set up Azure SQL Database
- [ ] Create .NET Core Web API project
- [ ] Set up Azure Blob Storage
- [ ] Configure development environment

### Database Migration
- [ ] Export data from Supabase
- [ ] Transform data format
- [ ] Create SQL Server schema
- [ ] Import data to SQL Server
- [ ] Verify data integrity
- [ ] Test database connections

### Backend Development
- [ ] Create Entity models
- [ ] Set up DbContext
- [ ] Implement API controllers
- [ ] Add authentication middleware
- [ ] Create file upload service
- [ ] Write unit tests
- [ ] Write integration tests

### Frontend Configuration
- [ ] Update environment variables
- [ ] Test with new data service
- [ ] Verify all functionality works
- [ ] Test authentication flow
- [ ] Test file uploads
- [ ] Test all CRUD operations

### Deployment
- [ ] Deploy API to Azure App Service
- [ ] Deploy frontend to Azure Static Web Apps
- [ ] Configure production environment variables
- [ ] Set up monitoring and logging
- [ ] Configure SSL certificates
- [ ] Test production deployment

### Post-Migration
- [ ] Monitor application performance
- [ ] Verify all features work correctly
- [ ] Check error logs
- [ ] Monitor database performance
- [ ] Set up automated backups
- [ ] Document any issues and solutions

---

## 📊 Summary

This migration guide provides a complete path from Supabase to Microsoft SQL Server while maintaining the existing frontend code through the MVC abstraction layer. The key benefits include:

### ✅ **Zero Frontend Changes**
- React components remain unchanged
- Hooks continue to work as before
- UI/UX stays consistent

### ✅ **Environment-Based Configuration**
- Simple environment variable change
- Easy rollback capability
- Flexible deployment options

### ✅ **Enterprise-Ready Architecture**
- Scalable SQL Server database
- Secure Azure hosting
- Professional-grade file storage

### ✅ **Comprehensive Testing**
- Unit tests for API endpoints
- Integration tests for workflows
- Frontend compatibility testing

### ✅ **Production-Ready Deployment**
- Azure App Service for API
- Azure Static Web Apps for frontend
- Automated CI/CD pipeline

The migration can be completed in phases, tested thoroughly, and rolled back quickly if needed. The MVC pattern ensures that future database changes will be equally straightforward.

---

## 📞 Support

For additional support during migration:

1. **Azure Documentation**: https://docs.microsoft.com/azure/
2. **Entity Framework Core**: https://docs.microsoft.com/ef/core/
3. **ASP.NET Core**: https://docs.microsoft.com/aspnet/core/
4. **SQL Server**: https://docs.microsoft.com/sql/

Remember to test thoroughly in a development environment before applying changes to production!