# Pocket Stylist Backend API

Comprehensive backend API for the Pocket Stylist AI application featuring Claude AI styling recommendations and advanced file management.

## 🏗️ Architecture

- **Runtime**: Node.js / Cloudflare Workers
- **Framework**: Express.js / Hono
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: Cloudflare R2
- **Image Processing**: Cloudflare Images
- **AI Integration**: Claude API by Anthropic
- **Caching**: Redis
- **Authentication**: JWT / Auth0
- **CDN**: Cloudflare CDN

## 🚀 Features

### Core AI Features
- **Claude API Integration**: Advanced AI-powered styling recommendations
- **Personalized Recommendations**: Tailored outfit suggestions based on user preferences, body type, and style history
- **Multiple Recommendation Types**:
  - Styling recommendations
  - Outfit suggestions
  - Seasonal updates
  - Trend analysis
  - Color matching
  - Body type optimization

### File Management & Media Processing
- **File Upload API**: Upload images with automatic processing
- **Image Optimization**: Automatic resizing and format conversion
- **Security**: File validation, size limits, and content scanning
- **CDN Integration**: Fast global content delivery

### AI Capabilities
- **Style Analysis**: Analyze user's clothing preferences and style patterns
- **Color Palette Generation**: Generate personalized color palettes based on skin tone
- **Weather-Based Recommendations**: Outfit suggestions based on current weather conditions
- **User Feedback Learning**: Improve recommendations based on user interactions

### Technical Features
- **Rate Limiting**: Protect Claude API usage with intelligent rate limiting
- **Caching**: Redis-based caching for improved performance
- **Authentication**: JWT-based Auth0 integration
- **Error Handling**: Comprehensive error handling and logging

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- Cloudflare account (for file storage and CDN)
- Auth0 account (for authentication)
- Claude API key from Anthropic

## 🛠️ Installation

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration - see Environment Variables section below.

4. **Set up database**:
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # Optional: Seed database
   npm run db:seed
   ```

5. **Start Redis** (if not already running):
   ```bash
   redis-server
   ```

## 🚀 Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Other Commands
```bash
# Run linting
npm run lint

# Format code
npm run format

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📚 API Endpoints

### AI Recommendations
- `POST /api/v1/ai/styling-recommendations` - Generate styling recommendations
- `GET /api/v1/ai/recommendations/:id` - Get recommendation details
- `POST /api/v1/ai/feedback` - Submit user feedback
- `GET /api/v1/ai/user-profile/:userId` - Get user style profile
- `POST /api/v1/ai/analyze-style` - Analyze user style preferences
- `GET /api/v1/ai/color-palette/:userId` - Get personalized color palette

### File Management
- `POST /v1/files/upload` - Upload a file
- `GET /v1/files/:id` - Get file details
- `DELETE /v1/files/:id` - Delete a file
- `GET /v1/files` - List user files

### Advanced Features
- `GET /api/v1/ai/collaborative-recommendations/:userId` - Collaborative filtering
- `POST /api/v1/ai/weather-based-recommendations` - Weather-based styling
- `GET /api/v1/ai/trends` - Current fashion trends
- `GET /api/v1/ai/health` - Health check

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following configuration:

```env
# Environment
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/pocket_stylist

# Cloudflare R2 (File Storage)
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
R2_BUCKET_NAME="pocket-stylist-files"

# Cloudflare Images
CLOUDFLARE_IMAGES_ACCOUNT_ID="your-account-id"
CLOUDFLARE_IMAGES_API_TOKEN="your-images-api-token"

# Auth0
AUTH0_DOMAIN="your-domain.auth0.com"
AUTH0_AUDIENCE="your-api-audience"

# CDN
CDN_BASE_URL="https://cdn.pocket-stylist.com"

# Claude API
CLAUDE_API_KEY=your_claude_api_key_here
CLAUDE_MODEL=claude-3-sonnet-20240229
CLAUDE_MAX_TOKENS=4096
CLAUDE_TEMPERATURE=0.7

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your_jwt_secret_here_minimum_32_characters_long
JWT_EXPIRES_IN=24h

# Rate Limiting & Performance
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
CLAUDE_RATE_LIMIT_WINDOW_MS=60000
CLAUDE_RATE_LIMIT_MAX=20
CACHE_TTL=3600
RECOMMENDATION_CACHE_TTL=1800
```

### Setup Instructions

#### Cloudflare R2 & Images Setup
1. Create an R2 bucket in your Cloudflare dashboard
2. Generate API tokens with R2 permissions
3. Enable Cloudflare Images and generate API token
4. Configure custom domain for CDN (optional)

#### Auth0 Setup
1. Create an Auth0 application
2. Configure JWT settings
3. Set up proper scopes and permissions

#### Database Setup
The application uses PostgreSQL with Prisma ORM. Migrations are handled automatically.

#### Redis Setup
Redis is used for caching and rate limiting. Ensure Redis is running before starting the application.

## 🏗️ Architecture

### Services
- **ClaudeService**: Handles Claude API interactions
- **RecommendationService**: Core recommendation logic
- **RedisService**: Caching and rate limiting
- **R2Service**: File upload and management

### Database Models
- **User**: User profiles and preferences
- **File**: File storage metadata
- **AiRecommendation**: Stores recommendation requests and results
- **AiRecommendationItem**: Individual outfit recommendations
- **UserStyleProfile**: User style analysis and preferences
- **WeatherData**: Weather information for recommendations

### Security Features
- **File Type Validation**: Only allows JPEG, PNG, WebP, and AVIF images
- **Size Limits**: Maximum 10MB per file
- **Content Validation**: Validates file signatures and headers
- **Authentication**: JWT-based authentication via Auth0
- **Rate Limiting**: Multiple levels of rate limiting
- **Input Validation**: Zod schema validation for all endpoints

## 📊 Monitoring & Logging

### Logging
- Winston-based logging with multiple transports
- Structured logging in JSON format
- Error tracking and performance monitoring

### Health Checks
- `/health` endpoint for basic health check
- `/api/v1/ai/health` for AI service health

### Analytics
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Response time tracking
- **Database Monitoring**: Prisma query logging
- **File Storage Monitoring**: R2 usage metrics

## 🚀 Deployment

### Docker
```bash
# Build Docker image
docker build -t pocket-stylist-backend .

# Run with Docker Compose
docker-compose up -d
```

### Cloudflare Workers (Alternative)
```bash
# Deploy to Cloudflare Workers
npm run deploy

# Deploy to specific environment
wrangler deploy --env production
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection**: Ensure DATABASE_URL is correct
2. **Redis Connection**: Verify Redis is running
3. **Claude API**: Check API key and rate limits
4. **R2 Permissions**: Verify R2 API tokens have proper permissions
5. **Auth0 Configuration**: Check JWT audience and domain settings

### Debugging

```bash
# View logs in development
npm run dev

# Check database with Prisma Studio
npx prisma studio

# Monitor Redis
redis-cli monitor
```

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add tests for new features
3. Update documentation for changes
4. Follow the existing code style
5. Use conventional commit messages

## 📄 License

MIT License - see LICENSE file for details
