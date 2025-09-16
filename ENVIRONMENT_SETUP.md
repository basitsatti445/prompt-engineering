# Environment Configuration Guide

This guide explains how to set up environment variables for the Startup Pitch Showcase application.

## Quick Start

1. **Copy the appropriate environment file:**
   ```bash
   # For development
   cp env.development.example .env.local
   
   # For production
   cp env.production.example .env.local
   ```

2. **Edit the `.env.local` file** with your actual values

3. **Restart your application**

## Environment Files

### Development Environment (`env.development.example`)
- Relaxed security settings for development
- Local MongoDB connection
- Debug mode enabled
- Sample data seeding enabled
- Verbose logging

### Production Environment (`env.production.example`)
- Strict security settings
- MongoDB Atlas connection
- Debug mode disabled
- Error tracking enabled
- Optimized performance settings

### General Environment (`env.example`)
- Balanced settings for general use
- All available configuration options
- Comprehensive documentation

## Required Variables

### Core Application
```bash
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/startup-pitch-showcase
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-characters
FRONTEND_URL=http://localhost:3000
```

### Authentication & Security
```bash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-characters
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```

### Database
```bash
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/startup-pitch-showcase

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/startup-pitch-showcase?retryWrites=true&w=majority
```

## Optional Variables

### Email Configuration
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@startup-pitch-showcase.com
```

### File Upload
```bash
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

### Rate Limiting
```bash
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
VOTE_RATE_LIMIT_MAX=10
VOTE_RATE_LIMIT_WINDOW_MS=60000
```

### External Services
```bash
# OpenAI (for AI features)
OPENAI_API_KEY=sk-your-openai-api-key

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_your-stripe-publishable-key

# AWS (for file storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

### Analytics & Monitoring
```bash
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## Environment-Specific Settings

### Development
- `DEBUG=true` - Enable debug mode
- `ENABLE_SWAGGER=true` - Enable API documentation
- `SEED_DATABASE=true` - Seed database with sample data
- `LOG_LEVEL=debug` - Verbose logging
- Relaxed rate limiting

### Production
- `DEBUG=false` - Disable debug mode
- `ENABLE_SWAGGER=false` - Disable API documentation
- `SEED_DATABASE=false` - Disable database seeding
- `LOG_LEVEL=info` - Standard logging
- Strict rate limiting
- `FORCE_HTTPS=true` - Force HTTPS
- `TRUST_PROXY=true` - Trust proxy headers

## Security Considerations

### Production Security Checklist
- [ ] Use a strong JWT secret (minimum 32 characters)
- [ ] Use HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting appropriately
- [ ] Use environment-specific database connections
- [ ] Enable error tracking (Sentry)
- [ ] Set up proper logging
- [ ] Use secure session settings

### JWT Secret Generation
```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Password Security
- Use strong passwords for all services
- Enable 2FA where possible
- Rotate secrets regularly
- Never commit secrets to version control

## Database Setup

### Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Set `MONGODB_URI=mongodb://localhost:27017/startup-pitch-showcase`

### MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address
5. Get the connection string
6. Set `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/startup-pitch-showcase?retryWrites=true&w=majority`

## Email Setup

### Gmail SMTP
1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password in `SMTP_PASS`

### Other SMTP Providers
- **SendGrid**: Use API key as password
- **Mailgun**: Use domain and API key
- **Amazon SES**: Use AWS credentials

## File Storage Setup

### Local Storage (Development)
- Files stored in `./uploads` directory
- No additional configuration needed

### AWS S3 (Production)
1. Create an AWS account
2. Create an S3 bucket
3. Create IAM user with S3 permissions
4. Set AWS credentials in environment

## Monitoring Setup

### Sentry Error Tracking
1. Create Sentry account
2. Create new project
3. Get DSN from project settings
4. Set `SENTRY_DSN` environment variable

### Google Analytics
1. Create Google Analytics account
2. Create property for your website
3. Get Measurement ID
4. Set `GOOGLE_ANALYTICS_ID` environment variable

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Check MongoDB URI format
- Verify database is running
- Check network connectivity
- Verify credentials

**JWT Token Invalid**
- Check JWT_SECRET is set
- Verify JWT_SECRET is consistent
- Check token expiration

**CORS Errors**
- Verify FRONTEND_URL is correct
- Check CORS configuration
- Ensure frontend URL matches exactly

**Rate Limiting Issues**
- Check rate limit configuration
- Verify window and max request settings
- Clear rate limit cache if needed

### Environment Validation
The application validates required environment variables on startup. Check the console for validation errors.

## Best Practices

1. **Never commit `.env.local` to version control**
2. **Use different secrets for different environments**
3. **Rotate secrets regularly**
4. **Use environment-specific configurations**
5. **Monitor environment variable usage**
6. **Document all custom environment variables**
7. **Use strong, random secrets**
8. **Test configuration changes in development first**

## Support

If you encounter issues with environment configuration:
1. Check this documentation
2. Verify all required variables are set
3. Check the application logs
4. Test with minimal configuration
5. Contact the development team
