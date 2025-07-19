# Claude Development Guidelines

This file contains guidelines and rules for Claude when working on the Pocket Stylist project.

## 🚫 Code Quality Rules

### No Hardcoding Policy

**NEVER hardcode the following values in the codebase:**

1. **Environment Variables**
   - API keys, secrets, tokens
   - Database URLs and credentials
   - Service endpoints and URLs
   - Port numbers and host addresses
   - Feature flags and configuration values

2. **API Configurations**
   - Service URLs (Auth0, Cloudflare, Claude API, etc.)
   - Bucket names and storage paths
   - Rate limits and timeouts
   - API versions and endpoints

3. **Business Logic Values**
   - File size limits
   - Validation rules and constraints
   - Default categories and enums
   - Pricing and quota values

### ✅ Correct Approach

Always use environment variables or configuration files:

```typescript
// ❌ BAD - Hardcoded
const bucketName = 'pocket-stylist-files'
const apiUrl = 'https://api.example.com/v1'
const maxFileSize = 10485760 // 10MB

// ✅ GOOD - Environment variables
const bucketName = env.R2_BUCKET_NAME
const apiUrl = env.API_BASE_URL
const maxFileSize = parseInt(env.MAX_FILE_SIZE_BYTES || '10485760')
```

```typescript
// ❌ BAD - Hardcoded in service
r2Bucket: 'pocket-stylist'

// ✅ GOOD - From environment
r2Bucket: this.env.R2_BUCKET_NAME
```

### Configuration Management

1. **Store all configurable values in `.env.example`**
2. **Document required environment variables in README**
3. **Use type-safe environment variable loading**
4. **Provide sensible defaults where appropriate**
5. **Validate environment variables at startup**

### Examples of What to Extract

- **Service URLs**: Auth0 domain, Cloudflare endpoints, API base URLs
- **Resource Names**: Bucket names, database names, queue names
- **Limits**: File size limits, rate limits, pagination sizes
- **Timeouts**: Request timeouts, cache TTL, retry intervals
- **Credentials**: API keys, database passwords, JWT secrets

## 🔧 Implementation Guidelines

### Environment Variable Naming

Use consistent naming conventions:
- `SERVICE_SETTING_NAME` format
- Prefix with service name (e.g., `R2_BUCKET_NAME`, `AUTH0_DOMAIN`)
- Use descriptive names (e.g., `CLAUDE_MAX_TOKENS` not `MAX_TOKENS`)

### Configuration Validation

Always validate configuration at startup:

```typescript
// ✅ Validate required environment variables
const requiredEnvVars = ['R2_BUCKET_NAME', 'AUTH0_DOMAIN', 'CLAUDE_API_KEY']
for (const envVar of requiredEnvVars) {
  if (!env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}
```

## 📋 Review Checklist

Before submitting code, ensure:

- [ ] No hardcoded URLs or endpoints
- [ ] No hardcoded credentials or secrets  
- [ ] No hardcoded bucket names or resource identifiers
- [ ] No hardcoded business logic values
- [ ] All configurable values use environment variables
- [ ] New environment variables are documented in `.env.example`
- [ ] Environment variables are validated at startup

## 🎯 Benefits

Following these rules ensures:
- **Environment Portability**: Code works across dev/staging/prod
- **Security**: No credentials in source code
- **Flexibility**: Easy configuration changes without code deployment
- **Maintainability**: Clear separation of code and configuration
- **Team Collaboration**: Consistent configuration management

## 🚨 Enforcement

Any PR containing hardcoded values will be flagged for revision. Use this checklist during code review to maintain code quality standards.