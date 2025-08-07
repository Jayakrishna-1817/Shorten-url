<<<<<<< HEAD
# URL Shortener - Full Stack Application

A modern, full-stack URL shortener application built with React and Node.js. This project features a robust backend microservice with comprehensive logging and analytics, paired with a responsive Material UI frontend.

## 🚀 Features

### Backend Microservice
- **Express.js Server**: RESTful API with comprehensive endpoints
- **In-Memory Storage**: Fast URL storage and analytics tracking
- **Custom Shortcodes**: Support for user-defined shortcodes
- **Configurable Expiry**: Customizable URL validity periods
- **Click Analytics**: Detailed tracking of clicks, referrers, and timestamps
- **Comprehensive Logging**: Structured logging for all operations
- **Error Handling**: Robust error responses with appropriate HTTP status codes
- **Health Check**: Server status monitoring endpoint

### Frontend React Application
- **Material UI**: Modern, responsive design with Material UI components
- **Multi-URL Support**: Shorten up to 5 URLs simultaneously
- **Real-time Validation**: Client-side input validation
- **Statistics Dashboard**: Comprehensive analytics view
- **Responsive Design**: Mobile-friendly interface
- **Copy & Share**: Easy URL copying and sharing functionality

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **nanoid** - Unique ID generation
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 19** - UI framework
- **Material UI** - Component library
- **Vite** - Build tool and dev server
- **Emotion** - CSS-in-JS styling

## 📁 Project Structure

```
url-shortener/
├── server/                     # Backend microservice
│   ├── package.json           # Backend dependencies
│   ├── server.js             # Main server file
│   ├── models/
│   │   └── urlStore.js       # URL storage and management
│   └── middleware/
│       └── logger.js         # Logging middleware
├── src/                      # React frontend
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # React entry point
│   ├── App.css              # Global styles
│   ├── index.css            # Base styles
│   └── components/
│       ├── URLShortenerPage.jsx  # URL shortening interface
│       └── StatisticsPage.jsx    # Analytics dashboard
├── package.json             # Frontend dependencies
├── vite.config.js          # Vite configuration
├── index.html              # HTML template
└── README.md               # This file
```

## 🚦 Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd url-shortener
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Start the backend server**
   ```bash
   npm run server
   ```
   The backend will be available at `http://localhost:3000`

5. **Start the frontend development server**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

### Quick Start Commands

```bash
# Start backend only
npm run server

# Start backend in development mode (with auto-restart)
npm run dev:server

# Start frontend development server
npm run dev

# Build frontend for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## 🌐 API Endpoints

### Base URL: `http://localhost:3000`

#### Create Short URL
```http
POST /shorturls
Content-Type: application/json

{
  "url": "https://example.com/very-long-url",
  "validity": 30,              # Optional: minutes (default: 30)
  "shortcode": "custom123"     # Optional: custom shortcode
}
```

**Response (201 Created):**
```json
{
  "shortLink": "http://localhost:3000/abc123",
  "expiry": "2025-08-01T12:30:00.000Z"
}
```

#### Redirect to Original URL
```http
GET /:shortcode
```
**Response:** 302 Redirect to original URL

#### Get URL Statistics
```http
GET /shorturls/:shortcode
```

**Response (200 OK):**
```json
{
  "shortcode": "abc123",
  "originalUrl": "https://example.com/very-long-url",
  "createdAt": "2025-08-01T12:00:00.000Z",
  "expiry": "2025-08-01T12:30:00.000Z",
  "totalClicks": 5,
  "clicks": [
    {
      "timestamp": "2025-08-01T12:05:00.000Z",
      "referrer": "https://google.com",
      "userAgent": "Mozilla/5.0...",
      "ip": "192.168.1.1"
    }
  ]
}
```

#### Get All Statistics
```http
GET /api/statistics
```

**Response (200 OK):**
```json
{
  "urls": [...],
  "totalUrls": 10,
  "totalClicks": 50
}
```

#### Health Check
```http
GET /health
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-01T12:00:00.000Z",
  "uptime": 3600.5
}
```

## 💻 Usage Guide

### Shortening URLs

1. **Access the Application**
   - Open `http://localhost:5173` in your browser
   - Navigate to the "URL Shortener" tab

2. **Create Short URLs**
   - Enter up to 5 URLs in the form fields
   - Optionally set custom validity periods (in minutes)
   - Optionally provide custom shortcodes
   - Click "Shorten URLs" to generate short links

3. **Manage Results**
   - Copy generated short URLs to clipboard
   - Open URLs directly in new tabs
   - View expiry times for each URL

### Viewing Analytics

1. **Access Statistics**
   - Navigate to the "Statistics" tab
   - View summary cards showing total URLs and clicks

2. **Detailed Analytics**
   - Expand individual URL rows for detailed click data
   - View timestamps, referrers, and IP addresses
   - Monitor URL performance over time

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the server directory for custom configuration:

```env
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

### Customization Options

- **Default Validity**: Modify the default URL expiry time in `server.js`
- **Port Configuration**: Change server port in `server.js` and update frontend API calls
- **Shortcode Length**: Adjust shortcode generation length in `urlStore.js`
- **Rate Limiting**: Add rate limiting middleware for production use

## 🔧 Development

### Code Style
- ESLint configuration for consistent code formatting
- Modern ES6+ JavaScript with modules
- Structured logging with contextual information
- Error handling with appropriate HTTP status codes

### Architecture Decisions
- **In-Memory Storage**: Chosen for simplicity; easily replaceable with database
- **RESTful API**: Standard REST conventions for predictable endpoints
- **Component-Based Frontend**: Reusable React components with Material UI
- **Middleware Pattern**: Extensible server middleware for logging and validation

### Testing
- Backend: API endpoints can be tested with tools like Postman or curl
- Frontend: Component testing can be added with React Testing Library
- Integration: End-to-end testing can be implemented with Cypress or Playwright

## 🚀 Deployment

### Production Considerations

1. **Database Integration**
   - Replace in-memory storage with persistent database (MongoDB, PostgreSQL)
   - Implement database migrations and connection pooling

2. **Security Enhancements**
   - Add rate limiting to prevent abuse
   - Implement input sanitization and validation
   - Add HTTPS in production
   - Consider authentication for admin features

3. **Performance Optimization**
   - Add caching layer (Redis) for frequently accessed URLs
   - Implement database indexing
   - Add monitoring and alerting

4. **Infrastructure**
   - Use process managers (PM2) for Node.js
   - Set up reverse proxy (Nginx)
   - Configure environment-specific settings
   - Implement health checks and logging aggregation

### Docker Deployment

Create `Dockerfile` for containerized deployment:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   Error: listen EADDRINUSE :::3000
   ```
   **Solution**: Change the PORT in `server.js` or kill the process using the port

2. **CORS Errors**
   **Solution**: Ensure the backend server is running and CORS is properly configured

3. **Module Not Found**
   **Solution**: Run `npm install` in both root and server directories

4. **Build Failures**
   **Solution**: Check Node.js version compatibility and clear npm cache

### Getting Help

- Check the browser console for frontend errors
- Check the server logs for backend issues
- Ensure all dependencies are installed
- Verify Node.js version compatibility

---

**Built with ❤️ using React and Node.js**+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
=======
# Shorten-url
>>>>>>> f56018d57bd1565cdbe5a0ea036c5651bcf551f5
