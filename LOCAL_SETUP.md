# EcoWave Hub - Local Development Setup

This guide will help you set up the EcoWave Hub project on your local machine after downloading it as a ZIP file.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **Git** (optional, for version control)
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

## Step-by-Step Setup Instructions

### 1. Extract the Project

1. Download the project ZIP file
2. Extract it to your desired location (e.g., `C:\Projects\` or `~/Projects/`)
3. Rename the extracted folder to `ecowave-hub` (if needed)

```bash
# Navigate to the project directory
cd path/to/ecowave-hub
```

### 2. Install Dependencies

Open a terminal/command prompt in the project directory and run:

```bash
# Install all project dependencies
npm install
```

This will install all required packages including:
- React and React DOM
- TypeScript
- Tailwind CSS
- Supabase client
- UI components (Radix UI)
- Vite (build tool)

### 3. Environment Configuration

The project already includes a `.env` file with the actual Supabase credentials:

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

**🔐 Important Security Note**: These are the actual production credentials for the EcoWave Hub project. Keep them secure and do not share them publicly or commit them to public repositories.

### 4. Start the Development Server

```bash
# Start the development server
npm run dev
```

The application will be available at: **http://localhost:5173/**

You should see output similar to:
```
  VITE v6.0.4  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 5. Access the Application

1. Open your web browser
2. Navigate to `http://localhost:5173/`
3. You should see the EcoWave Hub login page with the Roche logo

### 6. Create an Admin Account

Since this is an admin dashboard, you'll need to create an admin account:

1. Click "Need admin account? Create one"
2. Fill in the form:
   - **Full Name**: Your name
   - **Email**: Your email address
   - **Password**: At least 6 characters
3. Click "Create Admin Account"
4. You may receive a confirmation email (check your inbox)
5. Return to the login page and sign in with your credentials

**Note**: The application is connected to a live Supabase database, so your account will be created in the actual system.

## Project Structure Overview

```
ecowave-hub/
├── public/                 # Static assets (images, icons)
│   ├── roche-logo.png     # Company logo
│   └── ...                # Other static files
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Auth/         # Login and authentication
│   │   │   ├── AuthProvider.tsx    # Authentication context
│   │   │   └── LoginForm.tsx       # Login/signup form
│   │   ├── Layout/       # Main layout with sidebar
│   │   │   └── Layout.tsx          # App layout component
│   │   └── ui/           # Base UI components (shadcn/ui)
│   ├── hooks/            # Custom React hooks for data
│   │   ├── useAuth.ts           # Authentication logic
│   │   ├── useDashboard.ts      # Dashboard data
│   │   ├── useEvents.ts         # Event management
│   │   ├── useUsers.ts          # User management
│   │   ├── useRewards.ts        # Rewards system
│   │   ├── useFeedback.ts       # Feedback management
│   │   └── useAdminHistory.ts   # Activity logging
│   ├── lib/              # Utilities and configurations
│   │   ├── supabase.ts         # Supabase client setup
│   │   ├── adminLogger.ts      # Activity logging utility
│   │   └── utils.ts            # General utilities
│   ├── screens/          # Main application pages
│   │   ├── DashboardMainPage/  # Overview dashboard
│   │   ├── Events/             # Event management
│   │   ├── Users/              # User management
│   │   ├── Rewards/            # Rewards system
│   │   ├── Feedback/           # Feedback management
│   │   ├── AdminHistory/       # Activity logs
│   │   └── AdminProfile/       # Profile settings
│   └── index.tsx         # Application entry point
├── supabase/
│   └── migrations/       # Database schema files
├── .env                  # Environment variables (with actual credentials)
├── .env.example         # Environment template
├── package.json          # Dependencies and scripts
└── tailwind.config.js    # Styling configuration
```

## Available Features

Once logged in, you can access:

1. **📊 Dashboard**: Overview of metrics and engagement trends
2. **📅 Events**: Create and manage sustainability events
3. **👥 Users**: Manage user accounts, roles, and points
4. **🎁 Rewards**: Set up and track reward redemptions
5. **💬 Feedback**: View and analyze participant feedback
6. **📋 Admin History**: Track all administrative actions
7. **👤 Admin Profile**: Manage your profile settings

## Development Commands

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Database Information

The application connects to a live Supabase database with the following tables:

- **users**: User profiles and authentication data
- **events**: Sustainability events and details
- **rewards**: Reward items and point requirements
- **event_participants**: Event participation tracking
- **reward_redemptions**: Reward redemption history
- **feedback**: User feedback and ratings
- **admin_activity_log**: Administrative action logs

**Database Details**:
- **Host**: `db.cyaxqdwhbgjjubecxbnv.supabase.co`
- **Database**: `postgres`
- **Port**: `5432`
- **SSL**: Required

The database is fully configured and ready to use. All migrations have been applied.

## Troubleshooting

### Common Issues and Solutions

#### 1. **Port already in use**
```bash
# If port 5173 is busy, Vite will automatically use the next available port
# Check the terminal output for the actual URL
```

#### 2. **Dependencies installation fails**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 3. **Environment variables not loading**
- Make sure the `.env` file is in the root directory
- Restart the development server after changing `.env`
- Check that variable names start with `VITE_`

#### 4. **Supabase connection issues**
- Verify your internet connection
- Check if the Supabase service is accessible
- The credentials are pre-configured and should work out of the box

#### 5. **Login/Authentication problems**
- Try creating a new admin account
- Check browser console for error messages (F12 → Console)
- Clear browser cache and cookies
- Ensure you're using a valid email format

#### 6. **Build errors**
```bash
# Clear everything and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

#### 7. **TypeScript errors**
- Make sure all dependencies are installed
- Restart your IDE/editor
- Check for missing type definitions

#### 8. **Database connection errors**
- The database credentials are pre-configured
- Check your internet connection
- Verify the Supabase service status

## Development Workflow

### Making Changes

1. **Frontend Changes**: Edit files in the `src/` directory
2. **Styling**: Modify Tailwind classes or `tailwind.css`
3. **Components**: Add new components in `src/components/`
4. **Pages**: Create new pages in `src/screens/`
5. **Data Logic**: Update hooks in `src/hooks/`

### Hot Reloading

The development server supports hot reloading, so changes will automatically appear in your browser without needing to refresh.

### Code Organization

- Keep components small and focused
- Use TypeScript for type safety
- Follow the existing file structure
- Use custom hooks for data fetching
- Implement proper error handling

## Performance Tips

1. **Development Mode**: The app runs in development mode by default (slower but with debugging)
2. **Production Build**: Use `npm run build` for optimized production builds
3. **Browser DevTools**: Use React Developer Tools for debugging
4. **Network Tab**: Monitor API calls in browser DevTools

## Security Considerations

### Credential Security

The project includes actual production credentials:

```env
# These are REAL credentials - keep them secure!
VITE_SUPABASE_URL=https://cyaxqdwhbgjjubecxbnv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DB_PASS=?5kmh22K.jX7M4C
```

### Best Practices:

1. **Never share these credentials publicly**
2. **Don't commit the `.env` file to public repositories**
3. **Use different credentials for different environments**
4. **Monitor database access and usage**
5. **Regularly update dependencies for security patches**

## Getting Help

If you encounter issues:

1. **Check the browser console** for error messages (F12 → Console)
2. **Verify environment variables** are set correctly in `.env`
3. **Check terminal output** for any build or server errors
4. **Test internet connection** to Supabase services
5. **Try clearing browser cache** and restarting the dev server

### Debug Steps:

```bash
# 1. Check if Node.js is working
node --version

# 2. Check if dependencies are installed
ls node_modules

# 3. Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 4. Start with verbose output
npm run dev --verbose
```

## Next Steps

Once you have the application running locally:

1. **Explore the interface**: Navigate through all sections to understand the functionality
2. **Create test data**: Add some events, users, and rewards to see how everything works
3. **Review the code**: Examine the file structure and understand how features are implemented
4. **Start developing**: Make your desired modifications and enhancements
5. **Test thoroughly**: Ensure your changes work correctly before deploying

## Additional Resources

For more information, check the documentation for the technologies used:

- **[React Documentation](https://react.dev/)** - Frontend framework
- **[TypeScript Documentation](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS Documentation](https://tailwindcss.com/)** - Styling framework
- **[Supabase Documentation](https://supabase.com/docs)** - Backend and database
- **[Vite Documentation](https://vitejs.dev/)** - Build tool
- **[shadcn/ui Documentation](https://ui.shadcn.com/)** - UI components

---

**Happy coding! 🚀**

**Remember**: You're working with a live database, so any changes you make will be real. Be careful when testing CRUD operations!