/**
 * Environment Configuration
 * Centralized configuration management for the Startup Pitch Showcase application
 */

// Database Configuration
const database = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/startup-pitch-showcase',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }
};

// Authentication Configuration
const auth = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    algorithm: 'HS256'
  },
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
  },
  password: {
    minLength: 6,
    requireUppercase: false,
    requireNumbers: false,
    requireSpecialChars: false
  }
};

// CORS Configuration
const cors = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
};

// Rate Limiting Configuration
const rateLimit = {
  api: {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000 // 15 minutes
  },
  vote: {
    maxRequests: parseInt(process.env.VOTE_RATE_LIMIT_MAX) || 10,
    windowMs: parseInt(process.env.VOTE_RATE_LIMIT_WINDOW_MS) || 60 * 1000 // 1 minute
  }
};

// Email Configuration
const email = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  from: process.env.SMTP_FROM || 'noreply@startup-pitch-showcase.com',
  templates: {
    welcome: 'welcome',
    passwordReset: 'password-reset',
    pitchNotification: 'pitch-notification'
  }
};

// File Upload Configuration
const upload = {
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(','),
  destination: process.env.UPLOAD_DESTINATION || './uploads',
  tempDir: process.env.UPLOAD_TEMP_DIR || './temp'
};

// Logging Configuration
const logging = {
  level: process.env.LOG_LEVEL || 'info',
  file: {
    path: process.env.LOG_FILE_PATH || './logs/app.log',
    maxSize: '10m',
    maxFiles: 5
  },
  console: {
    enabled: process.env.NODE_ENV !== 'production'
  }
};

// Application Configuration
const app = {
  name: 'Startup Pitch Showcase',
  version: process.env.APP_VERSION || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 3000,
  host: process.env.HOST || 'localhost',
  url: process.env.APP_URL || `http://localhost:${parseInt(process.env.PORT) || 3000}`,
  debug: process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development'
};

// External Services Configuration
const services = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-3.5-turbo',
    maxTokens: 1000
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET
  },
  analytics: {
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
    sentryDsn: process.env.SENTRY_DSN
  }
};

// Security Configuration
const security = {
  forceHttps: process.env.FORCE_HTTPS === 'true',
  trustProxy: process.env.TRUST_PROXY === 'true',
  session: {
    secure: process.env.SESSION_SECURE === 'true',
    sameSite: process.env.SESSION_SAME_SITE || 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    }
  }
};

// Development Configuration
const development = {
  enableSwagger: process.env.ENABLE_SWAGGER === 'true',
  seedDatabase: process.env.SEED_DATABASE === 'true',
  hotReload: process.env.HOT_RELOAD === 'true',
  sourceMaps: process.env.SOURCE_MAPS === 'true',
  detailedErrors: process.env.DETAILED_ERRORS === 'true',
  mockServices: {
    email: process.env.MOCK_EMAIL === 'true',
    fileUpload: process.env.MOCK_FILE_UPLOAD === 'true',
    externalApis: process.env.MOCK_EXTERNAL_APIS === 'true'
  }
};

// Testing Configuration
const testing = {
  database: {
    uri: process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/startup-pitch-showcase-test'
  },
  jwt: {
    secret: process.env.TEST_JWT_SECRET || 'test-jwt-secret-key'
  },
  timeout: 10000
};

// Validation function to check required environment variables
const validateConfig = () => {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate JWT secret strength in production
  if (app.environment === 'production' && auth.jwt.secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long in production');
  }

  return true;
};

// Export configuration
module.exports = {
  database,
  auth,
  cors,
  rateLimit,
  email,
  upload,
  logging,
  app,
  services,
  security,
  development,
  testing,
  validateConfig
};
