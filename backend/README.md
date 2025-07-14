# Pocket Stylist API

Backend API for the Pocket Stylist AI application built with Cloudflare Workers, Hono, and Prisma.

## Architecture

- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: Cloudflare R2
- **Image Processing**: Cloudflare Images
- **Authentication**: Auth0
- **CDN**: Cloudflare CDN

## Features

- **File Upload API**: Upload images with automatic processing
- **Image Optimization**: Automatic resizing and format conversion
- **Security**: File validation, size limits, and content scanning
- **CDN Integration**: Fast global content delivery
- **Authentication**: JWT-based Auth0 integration
- **Database**: PostgreSQL with Prisma ORM

## Setup

### Prerequisites

- Node.js 18+
- Cloudflare account
- Auth0 account
- PostgreSQL database

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables:
```bash
# Copy the example environment file
cp .env.example .env
```

3. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/pocket_stylist"

# Cloudflare R2
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
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Format code
npm run format
```

### Deployment

```bash
# Deploy to Cloudflare Workers
npm run deploy

# Deploy to specific environment
wrangler deploy --env production
```

## API Endpoints

### Files

- `POST /v1/files/upload` - Upload a file
- `GET /v1/files/:id` - Get file details
- `DELETE /v1/files/:id` - Delete a file
- `GET /v1/files` - List user files

### Security Features

- **File Type Validation**: Only allows JPEG, PNG, WebP, and AVIF images
- **Size Limits**: Maximum 10MB per file
- **Content Validation**: Validates file signatures and headers
- **Authentication**: JWT-based authentication via Auth0
- **Access Control**: Users can only access their own files

### Image Processing

- **Automatic Resizing**: Generates multiple sizes (thumbnail, small, medium, large)
- **Format Optimization**: Converts to modern formats (WebP, AVIF)
- **CDN Delivery**: Fast global content delivery via Cloudflare
- **Lazy Loading**: Optimized for mobile and web consumption

## Configuration

### Cloudflare R2 Setup

1. Create an R2 bucket in your Cloudflare dashboard
2. Generate API tokens with R2 permissions
3. Configure custom domain for CDN (optional)

### Cloudflare Images Setup

1. Enable Cloudflare Images in your dashboard
2. Generate API token with Images permissions
3. Configure image variants and optimization settings

### Auth0 Setup

1. Create an Auth0 application
2. Configure JWT settings
3. Set up proper scopes and permissions

## Monitoring

- **Error Tracking**: Integrated with Cloudflare Analytics
- **Performance Monitoring**: Workers Analytics
- **Database Monitoring**: Prisma query logging
- **File Storage Monitoring**: R2 usage metrics

## Security Considerations

- All file uploads are validated for type and content
- Files are stored with secure, generated filenames
- Authentication required for all API endpoints
- Rate limiting enabled (via Cloudflare)
- No direct file access without authentication

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure DATABASE_URL is correct
2. **R2 Permissions**: Verify R2 API tokens have proper permissions
3. **Auth0 Configuration**: Check JWT audience and domain settings
4. **File Upload Limits**: Cloudflare Workers have size limits for requests

### Logs

```bash
# View deployment logs
wrangler tail

# Check database logs
npx prisma studio
```

## Contributing

1. Follow the existing code style
2. Run tests before submitting
3. Update documentation for new features
4. Use conventional commit messages

## License

MIT License - see LICENSE file for details