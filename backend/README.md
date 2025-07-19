# Pocket Stylist Backend - Claude AI Styling Recommendations

This is the backend API server for the Pocket Stylist AI application, featuring Claude API integration for personalized styling recommendations.

## 🚀 Features

### Core Features
- **Claude API Integration**: Advanced AI-powered styling recommendations using Anthropic's Claude
- **Personalized Recommendations**: Tailored outfit suggestions based on user preferences, body type, and style history
- **Multiple Recommendation Types**:
  - Styling recommendations
  - Outfit suggestions
  - Seasonal updates
  - Trend analysis
  - Color matching
  - Body type optimization

### AI Capabilities
- **Style Analysis**: Analyze user's clothing preferences and style patterns
- **Color Palette Generation**: Generate personalized color palettes based on skin tone
- **Weather-Based Recommendations**: Outfit suggestions based on current weather conditions
- **Collaborative & Content-Based Filtering**: Hybrid recommendation algorithms
- **User Feedback Learning**: Improve recommendations based on user interactions

### Technical Features
- **Rate Limiting**: Protect Claude API usage with intelligent rate limiting
- **Caching**: Redis-based caching for improved performance
- **Error Handling**: Comprehensive error handling and logging
- **Database**: PostgreSQL with Prisma ORM
- **API Documentation**: RESTful API with clear endpoints

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- Claude API key from Anthropic

## 🛠️ Installation

1. **Clone the repository and navigate to backend**:
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
   Edit `.env` with your configuration:
   - `CLAUDE_API_KEY`: Your Claude API key
   - `DATABASE_URL`: PostgreSQL connection string
   - `REDIS_URL`: Redis connection string
   - `JWT_SECRET`: Secure random string for JWT tokens

4. **Set up database**:
   ```bash
   npm run db:generate
   npm run db:migrate
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

## 📚 API Endpoints

### AI Recommendations
- `POST /api/v1/ai/styling-recommendations` - Generate styling recommendations
- `GET /api/v1/ai/recommendations/:id` - Get recommendation details
- `POST /api/v1/ai/feedback` - Submit user feedback

### User Profile & Style Analysis
- `GET /api/v1/ai/user-profile/:userId` - Get user style profile
- `POST /api/v1/ai/analyze-style` - Analyze user style preferences
- `GET /api/v1/ai/color-palette/:userId` - Get personalized color palette

### Advanced Features
- `GET /api/v1/ai/collaborative-recommendations/:userId` - Collaborative filtering
- `GET /api/v1/ai/content-based-recommendations/:userId` - Content-based filtering
- `POST /api/v1/ai/weather-based-recommendations` - Weather-based styling
- `GET /api/v1/ai/trends` - Current fashion trends

### Utility Endpoints
- `POST /api/v1/ai/generate-outfit-description` - Generate outfit descriptions
- `GET /api/v1/ai/recommendation-history/:userId` - User's recommendation history
- `GET /api/v1/ai/health` - Health check

## 🎯 Usage Examples

### Generate Styling Recommendations
```bash
curl -X POST http://localhost:3001/api/v1/ai/styling-recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "type": "styling_recommendations",
    "context": {
      "occasion": "work",
      "season": "fall",
      "weather": "cool"
    },
    "preferences": {
      "maxOutfits": 5,
      "includeColorAnalysis": true
    }
  }'
```

### Submit Feedback
```bash
curl -X POST http://localhost:3001/api/v1/ai/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "recommendationId": "rec-uuid",
    "outfitId": "outfit-1",
    "feedbackType": "like",
    "rating": 5
  }'
```

## 🏗️ Architecture

### Services
- **ClaudeService**: Handles Claude API interactions
- **RecommendationService**: Core recommendation logic
- **RedisService**: Caching and rate limiting

### Database Models
- **AiRecommendation**: Stores recommendation requests and results
- **AiRecommendationItem**: Individual outfit recommendations
- **AiRecommendationFeedback**: User feedback data
- **UserStyleProfile**: User style analysis and preferences
- **WeatherData**: Weather information for recommendations

### Key Features
- **Rate Limiting**: 20 requests/minute for Claude API
- **Caching**: 30-minute cache for recommendations
- **Error Handling**: Comprehensive error types and logging
- **Validation**: Zod schema validation for all endpoints

## 🔧 Configuration

### Environment Variables
See `.env.example` for all available configuration options.

### Database
The application uses PostgreSQL with Prisma ORM. Database migrations are handled automatically.

### Redis
Redis is used for:
- Caching recommendations
- Rate limiting
- Session management

## 📊 Monitoring

### Logging
- Winston-based logging with multiple transports
- Structured logging in JSON format
- Error tracking and performance monitoring

### Health Checks
- `/health` endpoint for basic health check
- `/api/v1/ai/health` for AI service health

## 🔐 Security

- JWT-based authentication
- Rate limiting on all endpoints
- Input validation with Zod
- CORS protection
- Helmet.js security headers

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Docker
```bash
# Build Docker image
docker build -t pocket-stylist-backend .

# Run with Docker Compose
docker-compose up -d
```

### Environment Setup
1. Set up PostgreSQL database
2. Configure Redis instance
3. Set environment variables
4. Run database migrations
5. Start the application

## 📝 API Documentation

The API follows RESTful conventions with JSON responses. All endpoints return:

```json
{
  "success": true,
  "data": { ... },
  "error": "Error message (if any)"
}
```

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add tests for new features
3. Update documentation
4. Follow the existing code style

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues related to:
- Claude API: Check Anthropic documentation
- Database: Verify PostgreSQL connection
- Redis: Ensure Redis is running
- Rate limiting: Check current usage limits

## 🔮 Future Enhancements

- Machine learning model integration
- Image analysis for garment recognition
- Social features for outfit sharing
- Mobile app integration
- Advanced trend analysis