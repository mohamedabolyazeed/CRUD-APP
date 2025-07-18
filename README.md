# 🚀 Modern CRUD Application

A modern, full-stack CRUD application built with React, Node.js, Express, MongoDB, and Tailwind CSS. Features user authentication, email verification, comprehensive admin system, and a sleek dark-themed UI. Now with Docker support! 🌟

## 🎨 Modern UI Features

### Dark Theme Implementation

- **Elegant Dark Mode**: Built-in dark theme with modern aesthetics
- **Glass Morphism Effects**: Subtle transparency and blur effects
- **Gradient Accents**: Beautiful gradient highlights and borders
- **Smooth Animations**: Polished transitions and hover effects
- **Consistent Design System**: Unified color palette and component styles

### Interactive Elements

- **Creative Action Buttons**: Modern, gradient-styled buttons with hover effects
- **Status Badges**: Stylish indicators for user roles and states
- **Form Elements**: Refined input fields with focus states
- **Cards & Containers**: Glass-effect containers with subtle borders
- **Loading States**: Elegant loading animations and transitions

### Responsive Design

- **Mobile-First Approach**: Fully responsive on all devices
- **Adaptive Layouts**: Dynamic grid and flex layouts
- **Touch-Friendly**: Optimized for touch interactions
- **Consistent Spacing**: Harmonious padding and margins
- **Flexible Components**: Adaptable to different screen sizes

## 🌟 Current Projects

### Active Development

- 🎨 Implementing modern dark theme across all components
- 📊 Building a robust user authentication system
- 🔄 Implementing real-time data visualization dashboard
- 🛡️ Enhancing security features and user privacy

### Recent Achievements

- ✨ Implemented comprehensive dark theme
- 🎯 Added modern UI components and animations
- 🔐 Successfully implemented user role management
- 📧 Integrated email verification system
- 🐳 Deployed containerized application architecture

### Upcoming Features

- 📱 Enhanced mobile responsiveness
- 🔄 Real-time data synchronization
- 🔌 Advanced API integration capabilities
- 📊 Extended analytics and reporting features

## 🏗️ Project Structure

```
CRUD-APP/
├── api/                            # API endpoints
├── client/                         # React Frontend
│   ├── src/
│   │   ├── api/                   # API integration
│   │   ├── components/            # React components
│   │   ├── contexts/              # React contexts
│   │   ├── pages/                # Page components
│   │   ├── App.js                # Main React component
│   │   ├── index.js              # Entry point
│   │   └── index.css             # Global styles
│   ├── package.json              # Frontend dependencies
│   ├── postcss.config.js         # PostCSS configuration
│   └── tailwind.config.js        # Tailwind configuration
├── server/                        # Backend logic
│   ├── config/                   # Configuration files
│   ├── controllers/              # Route controllers
│   ├── middleware/               # Express middleware
│   ├── models/                   # MongoDB models
│   ├── routes/                   # Express routes
│   └── utils/                    # Utility functions
├── docker-compose.yml            # Docker composition
├── Dockerfile                    # Main Dockerfile
├── Dockerfile.client             # Client Dockerfile
├── Dockerfile.prod               # Production Dockerfile
├── nginx.conf                    # Nginx configuration
├── server.js                     # Main server entry point
├── mongo-init.js                # MongoDB initialization
├── docker-run.sh                # Docker run script (Unix)
├── docker-run.ps1               # Docker run script (Windows)
├── vercel.json                  # Vercel deployment config
├── ADMIN.md                     # Admin documentation
└── env.example                  # Environment template
```

## ✨ Features

### Modern UI/UX

- **Dark Theme**: Elegant dark mode with glass morphism effects
- **Interactive Elements**: Smooth animations and transitions
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Component System**: Reusable, styled components
- **Toast Notifications**: Modern feedback system
- **Loading States**: Elegant progress indicators

### Authentication System

- **User Registration** with email verification
- **Secure Login/Logout** with session management
- **Password Reset** functionality with email tokens
- **Email Verification** with OTP codes
- **JWT Token** support for API access

### Admin System

- **Admin Dashboard** with real-time statistics
- **User Management** - view, edit, delete users
- **Role Management** - assign admin/user roles
- **Account Control** - activate/deactivate users
- **Site Statistics** - monitor user and data activity

### CRUD Operations

- **Create** new data entries with validation
- **Read** user-specific data with pagination
- **Update** existing records with form validation
- **Delete** records with confirmation dialogs
- **Search and Filter** capabilities

## 🚀 Quick Start

### Docker Setup (Recommended)

1. **Clone the repository**

   ```bash
   git clone https://github.com/mohamedabolyazeed/CRUD-APP.git
   cd CRUD-APP
   ```

2. **Environment Setup**
   Copy `env.example` to `.env` and configure your environment variables.

3. **Start with Docker**

   ```bash
   # Windows
   ./docker-run.ps1

   # Linux/Mac
   ./docker-run.sh
   ```

4. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

### Traditional Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/mohamedabolyazeed/CRUD-APP.git
   cd CRUD-APP
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory based on `env.example`:

   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/crud-app

   # Session Configuration
   SESSION_SECRET=your-super-secret-session-key-change-this-in-production

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Email Configuration (Choose one option)
   # Option 1: Gmail Configuration
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # Option 2: Mailtrap Configuration (Recommended for testing)
   MAILTRAP_HOST=smtp.mailtrap.io
   MAILTRAP_PORT=2525
   MAILTRAP_USER=your-mailtrap-username
   MAILTRAP_PASS=your-mailtrap-password

   # Admin Configuration (Optional - for custom admin creation)
   ADMIN_EMAIL=
   ADMIN_PASSWORD=
   ADMIN_NAME=
   ```

4. **Create Admin User (Optional)**

   ```bash
   bun run create-admin
   ```

   This creates a default admin user for testing purposes.

5. **Start the application**

   ```bash
   # Development mode with auto-reload
   bun run dev

   # Production mode
   bun start
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:3001`

## 📋 Available Scripts

- `bun start` - Start the production server
- `bun run dev` - Start development server with auto-reload
- `bun run server` - Start only the server
- `bun run client` - Start only the client
- `bun run build` - Build the client application
- `bun run install-client` - Install client dependencies
- `bun run create-admin` - Create default admin user

## 🔧 Configuration

### Database Configuration

The application uses MongoDB with Mongoose ODM. Update the `MONGODB_URI` in your `.env` file to connect to your database.

**Supported MongoDB Options:**

- Local MongoDB: `mongodb://localhost:27017/crud-app`
- MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/crud-app?retryWrites=true&w=majority`

### Email Configuration

For email functionality (verification, password reset), you have two options:

**Option 1: Gmail (Production)**

- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASS`: Your Gmail app password

**Option 2: Mailtrap (Testing - Recommended)**

- `MAILTRAP_HOST`: smtp.mailtrap.io
- `MAILTRAP_PORT`: 2525
- `MAILTRAP_USER`: Your Mailtrap username
- `MAILTRAP_PASS`: Your Mailtrap password

### Session Configuration

- `SESSION_SECRET`: A strong secret key for session encryption
- `JWT_SECRET`: A strong secret key for JWT tokens

## 🎯 API Endpoints

### Authentication Routes

- `GET /auth/signin` - Sign in page
- `POST /auth/signin` - Sign in process
- `GET /auth/signup` - Sign up page
- `POST /auth/signup` - Sign up process
- `GET /auth/verify-email` - Email verification page
- `POST /auth/verify-email` - Email verification process
- `POST /auth/resend-otp` - Resend verification code
- `GET /auth/forgot-password` - Forgot password page
- `POST /auth/forgot-password` - Forgot password process
- `GET /auth/reset-password/:token` - Reset password page
- `POST /auth/reset-password` - Reset password process
- `GET /auth/logout` - Logout

### CRUD Routes

- `GET /` - Home page (protected)
- `POST /` - Create new data entry
- `GET /edit/:id` - Edit form page
- `POST /update/:id` - Update data entry
- `POST /delete/:id` - Delete data entry

### Admin Routes

- `GET /admin` - Admin dashboard
- `GET /admin/users` - User management page
- `PUT /admin/users/:userId/role` - Update user role
- `PUT /admin/users/:userId/status` - Toggle user status
- `DELETE /admin/users/:userId` - Delete user
- `GET /admin/stats` - Get site statistics (API)

### API Routes

- `PUT /api/users/:id` - Update user via API
- `DELETE /api/users/:id` - Delete user via API

## 👑 Admin System

### Quick Admin Access

1. Create admin user: `bun run create-admin`
2. Login with the provided admin credentials
3. Access admin panel via "👑 Admin Panel" link in the header

### Admin Features

- **Dashboard**: Real-time site statistics and recent activity
- **User Management**: View, edit, delete, and manage user roles
- **Site Monitoring**: Track user registrations and data entries
- **Security**: Role-based access control and admin protection
- **Self-Protection**: Admins cannot delete themselves or remove their own admin role

### Admin Security

- All admin routes are protected with middleware
- Role-based access control (RBAC)
- Secure session management
- Input validation and sanitization
- Error handling and logging

For detailed admin documentation, see [ADMIN.md](./ADMIN.md).

## 🎨 Customization

### Styling

The application uses Tailwind CSS for styling. Customize the theme in `client/tailwind.config.js`.

### Templates

React components are located in:

- `client/src/components/` - Reusable components
- `client/src/pages/` - Page components
- `client/src/contexts/` - React contexts

### Adding New Features

1. **New Routes**: Add to `server/routes/`
2. **New Controllers**: Add to `server/controllers/`
3. **New Models**: Add to `server/models/`
4. **New Middleware**: Add to `server/middleware/`
5. **New Components**: Add to `client/src/components/`
6. **New Pages**: Add to `client/src/pages/`

## 🔍 Development Tips

### Live Reload

The application includes hot reloading for development:

- React components automatically refresh on changes
- Server restarts automatically with nodemon
- Tailwind CSS rebuilds on changes

### Debugging

- Check the browser console for client-side errors
- Monitor the terminal for server logs
- Use React Developer Tools for component debugging
- Check Network tab for API request/response debugging

### Database

- Use MongoDB Compass for database visualization
- Check the connection status in the server logs
- Verify your MongoDB URI is correct

### Admin Development

- Test admin functions with the created admin credentials
- Check admin middleware for role-based access
- Verify admin routes are properly protected

## 🚀 Deployment

### Environment Variables

Make sure to set all required environment variables in production:

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=your-production-mongodb-uri
SESSION_SECRET=your-production-session-secret
JWT_SECRET=your-production-jwt-secret
EMAIL_USER=your-production-email
EMAIL_PASS=your-production-email-password
```

### Production Considerations

- Disable live reload in production
- Use a production MongoDB instance
- Set up proper email service
- Configure HTTPS
- Set up proper logging
- Use a process manager like PM2
- Secure admin access in production
- Regular database backups
- Implement rate limiting
- Set up monitoring and alerting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (including admin functions)
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your environment variables
3. Ensure MongoDB is running
4. Check your email configuration
5. Review the documentation
6. Check admin system documentation in [ADMIN.md](./ADMIN.md)

## 🔗 Related Documentation

- [ADMIN.md](./ADMIN.md) - Complete admin system guide
- [env.example](./env.example) - Environment variables template

## 🎨 Modern UI Features

### React Components

- **Navbar**: Responsive navigation with user context
- **Authentication Forms**: Modern form handling with validation
- **Admin Dashboard**: Real-time data visualization
- **User Management**: Interactive user controls
- **Data Management**: CRUD operations with real-time updates

### Tailwind CSS Integration

- **Custom Theme**: Modern color schemes and gradients
- **Responsive Design**: Mobile-first approach
- **Component Classes**: Reusable styling patterns
- **Dark Mode Support**: Built-in dark mode capability
- **Animation Classes**: Smooth transitions and effects

## 🐳 Docker Configuration

### Container Architecture

- **Frontend**: React development server / production build
- **Backend**: Node.js Express server
- **Database**: MongoDB instance
- **Proxy**: Nginx reverse proxy

### Development Mode

```bash
# Start development environment
docker-compose up

# Rebuild containers
docker-compose up --build

# Stop containers
docker-compose down
```

### Production Mode

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production environment
docker-compose -f docker-compose.prod.yml up -d
```
