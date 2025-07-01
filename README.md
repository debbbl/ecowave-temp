# EcoWave Hub - Admin Dashboard

A comprehensive admin dashboard for managing sustainability initiatives, built with React, TypeScript, and Supabase.

## 🌟 Features

- **Dashboard Analytics**: Real-time metrics and engagement trends
- **Event Management**: Create, edit, and track sustainability events
- **User Management**: Manage user accounts, roles, and points
- **Rewards System**: Create and track reward redemptions
- **Feedback Management**: View and analyze participant feedback
- **Admin Activity Logging**: Track all administrative actions
- **Authentication**: Secure admin login with Supabase Auth

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 18 or higher)
- **npm** or **yarn**
- **Supabase account** (for database and authentication)

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd ecowave-hub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

The project includes a `.env` file with the actual Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://cyaxqdwhbgjjubecxbnv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5YXhxZHdoYmdqanViZWN4Ym52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNzI3OTUsImV4cCI6MjA2Mjk0ODc5NX0.pbuCGdzY2cclUVJTrYezqEz3EG7p9c-uNfiOhKN6fRI

# Database Configuration (for direct database access if needed)
DB_HOST=db.cyaxqdwhbgjjubecxbnv.supabase.co
DB_USER=postgres
DB_PASS=?5kmh22K.jX7M4C
DB_NAME=postgres
DB_PORT=5432
DB_URL=postgresql://postgres:?5kmh22K.jX7M4C@db.cyaxqdwhbgjjubecxbnv.supabase.co:5432/postgres
DB_SSL=true
```

**Note**: These are the actual production credentials. Keep them secure and do not share publicly.

### 4. Database Setup

The project includes Supabase migrations in the `supabase/migrations/` directory. The database is already configured and ready to use with the provided credentials.

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### 6. Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
ecowave-hub/
├── public/                     # Static assets
│   ├── roche-logo.png         # Company logo
│   └── ...                    # Other static files
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── Auth/             # Authentication components
│   │   │   ├── AuthProvider.tsx    # Auth context provider
│   │   │   └── LoginForm.tsx       # Login/signup form
│   │   ├── Layout/           # Layout components
│   │   │   └── Layout.tsx          # Main app layout with sidebar
│   │   └── ui/               # Base UI components (shadcn/ui)
│   │       ├── button.tsx          # Button component
│   │       ├── card.tsx            # Card component
│   │       ├── dialog.tsx          # Modal dialog component
│   │       ├── input.tsx           # Input field component
│   │       └── ...                 # Other UI components
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts             # Authentication hook
│   │   ├── useDashboard.ts        # Dashboard data hook
│   │   ├── useEvents.ts           # Events management hook
│   │   ├── useUsers.ts            # User management hook
│   │   ├── useRewards.ts          # Rewards management hook
│   │   ├── useFeedback.ts         # Feedback management hook
│   │   └── useAdminHistory.ts     # Admin activity logging hook
│   ├── lib/                  # Utility libraries
│   │   ├── supabase.ts           # Supabase client and types
│   │   ├── adminLogger.ts        # Admin activity logging utility
│   │   └── utils.ts              # General utility functions
│   ├── screens/              # Main application pages
│   │   ├── DashboardMainPage/    # Dashboard overview
│   │   ├── Events/               # Event management
│   │   ├── Users/                # User management
│   │   ├── Rewards/              # Rewards management
│   │   ├── Feedback/             # Feedback management
│   │   ├── AdminHistory/         # Admin activity logs
│   │   └── AdminProfile/         # Admin profile management
│   └── index.tsx             # Application entry point
├── supabase/
│   └── migrations/           # Database migration files
├── .env                      # Environment variables (with actual credentials)
├── .env.example             # Environment variables template
├── package.json             # Project dependencies and scripts
├── tailwind.config.js       # Tailwind CSS configuration
├── tailwind.css             # Global styles
├── vite.config.ts           # Vite configuration
└── LOCAL_SETUP.md           # Local setup guide for ZIP downloads
```

## 🛠️ Development Guide

### Adding New Features

#### Frontend Components

1. **UI Components**: Add reusable components to `src/components/ui/`
2. **Feature Components**: Add feature-specific components to `src/components/`
3. **Pages**: Add new pages to `src/screens/`

#### Backend Integration

1. **Database Types**: Update types in `src/lib/supabase.ts`
2. **API Hooks**: Create custom hooks in `src/hooks/`
3. **Database Migrations**: Add new migrations to `supabase/migrations/`

### Page-Specific Modifications

#### Dashboard (`src/screens/DashboardMainPage/`)
- **Metrics**: Modify `useDashboard.ts` hook
- **Charts**: Update chart components in `DashboardMainPage.tsx`
- **Stats Cards**: Edit the metric cards section

#### Events (`src/screens/Events/`)
- **Event CRUD**: Modify `useEvents.ts` hook
- **Event Form**: Update form in `Events.tsx`
- **Event Display**: Edit event card components

#### Users (`src/screens/Users/`)
- **User Management**: Modify `useUsers.ts` hook
- **User Table**: Update table in `Users.tsx`
- **Role Management**: Edit role change dialogs

#### Rewards (`src/screens/Rewards/`)
- **Reward CRUD**: Modify `useRewards.ts` hook
- **Reward Form**: Update form components
- **Redemption Tracking**: Edit redemption history

#### Feedback (`src/screens/Feedback/`)
- **Feedback Display**: Modify `useFeedback.ts` hook
- **Feedback Management**: Update feedback cards
- **Event Feedback**: Edit event-specific feedback views

#### Admin Profile (`src/screens/AdminProfile/`)
- **Profile Management**: Edit profile form
- **Password Change**: Modify security settings
- **Profile Display**: Update profile information layout

### Database Schema

The application uses the following main tables:

- **users**: User accounts and profiles
- **events**: Sustainability events
- **rewards**: Reward items
- **event_participants**: Event participation tracking
- **reward_redemptions**: Reward redemption history
- **feedback**: User feedback
- **admin_activity_log**: Admin action logging

### Authentication

The app uses Supabase Auth with:
- Email/password authentication
- Role-based access control
- Admin-only access to dashboard

### Styling

- **Framework**: Tailwind CSS
- **Components**: shadcn/ui component library
- **Theme**: Custom green theme for sustainability focus
- **Responsive**: Mobile-first responsive design

## 🔧 Configuration

### Supabase Connection

The application is pre-configured to connect to the Supabase instance:

- **Project URL**: `https://cyaxqdwhbgjjubecxbnv.supabase.co`
- **Database Host**: `db.cyaxqdwhbgjjubecxbnv.supabase.co`
- **Database**: `postgres`

All necessary environment variables are included in the `.env` file.

### Supabase Setup

The database is already configured with:
- All required tables and relationships
- Row Level Security (RLS) policies
- Authentication settings
- Migration files for schema management

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**: The credentials are pre-configured, but verify internet connectivity
2. **Migration Errors**: All migrations are already applied to the database
3. **Authentication Issues**: Create an admin account through the signup form
4. **Build Errors**: Clear `node_modules` and reinstall dependencies

### Performance Optimization

- Use React.memo for expensive components
- Implement pagination for large data sets
- Optimize database queries with proper indexing
- Use Supabase real-time subscriptions sparingly

## 🔐 Security Notes

**Important**: This repository contains actual production credentials:

- **Supabase URL**: `https://cyaxqdwhbgjjubecxbnv.supabase.co`
- **Anon Key**: Included in `.env` file
- **Database Password**: `?5kmh22K.jX7M4C`

### Security Best Practices:

1. **Do not share these credentials publicly**
2. **Do not commit the `.env` file to public repositories**
3. **Use environment-specific configurations for different deployments**
4. **Regularly rotate credentials in production**
5. **Monitor database access logs**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the troubleshooting section above
- Review the Supabase documentation
- Create an issue in the repository

---

Built with ❤️ for sustainability initiatives