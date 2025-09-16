# Startup Pitch Showcase

A comprehensive web application where founders can submit startup pitches and expert reviewers can evaluate them through ratings and feedback. The system features a weighted scoring algorithm to surface the best startups naturally through community engagement.

## 🚀 Project Overview

The Startup Pitch Showcase is a platform designed to connect innovative founders with expert reviewers in a structured, fair evaluation process. Founders create teams and submit detailed pitches including demo videos and presentation decks, while reviewers provide ratings and constructive feedback. The system uses a sophisticated weighted scoring algorithm to rank teams based on both rating quality and engagement volume.

### Key Features
- **Role-based Access Control**: Separate interfaces for founders and reviewers
- **One Pitch Per Team**: Ensures focused, high-quality submissions
- **Weighted Scoring**: `avg_rating * log10(total_votes + 1)` algorithm for fair ranking
- **Rate Limiting**: Prevents abuse with 10 votes per minute limit
- **Content Moderation**: Profanity filtering for feedback
- **Real-time Leaderboard**: Dynamic ranking based on community engagement

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5.3 with React 19.1.0
- **Backend**: Next.js API Routes with serverless functions
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with role-based access control
- **Styling**: Tailwind CSS 4.0
- **Validation**: Joi schema validation
- **Security**: bcryptjs password hashing, rate limiting, profanity filtering
- **Environment**: Comprehensive configuration management

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd startup-pitch-showcase
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Copy the appropriate environment file
cp env.development.example .env.local

# Edit with your configuration
nano .env.local
```

### 4. Validate Configuration
```bash
npm run validate-env
```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔧 Environment Variables

### Required Variables
```bash
# Application Environment
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/startup-pitch-showcase

# Authentication & Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-characters
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# CORS & Frontend
FRONTEND_URL=http://localhost:3000
```

### Optional Variables
```bash
# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
VOTE_RATE_LIMIT_MAX=10
VOTE_RATE_LIMIT_WINDOW_MS=60000

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@startup-pitch-showcase.com

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Logging
LOG_LEVEL=debug
LOG_FILE_PATH=./logs/app.log

# External Services
OPENAI_API_KEY=sk-your-openai-api-key
STRIPE_SECRET_KEY=sk_your-stripe-secret-key
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Analytics & Monitoring
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## 👥 Roles & Permissions

### Founder Role
**Capabilities:**
- Create and manage one team per account
- Submit one pitch per team (including demo URL and deck URL)
- View all pitches and leaderboard
- Update their own team and pitch information

**Guardrails:**
- Cannot create multiple teams
- Cannot submit multiple pitches per team
- Cannot vote on pitches
- Cannot leave feedback

### Reviewer Role
**Capabilities:**
- Vote on pitches (1-5 star rating)
- Leave feedback on pitches (max 240 characters)
- View all pitches and leaderboard
- Update their own votes (latest vote counts)

**Guardrails:**
- One vote per pitch (updates allowed)
- Rate limited to 10 votes per minute
- One feedback per pitch
- Cannot create teams or submit pitches
- Feedback must pass profanity filter

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with configurable expiration
- Role-based access control with immutable roles
- Password hashing with bcryptjs (configurable rounds)
- Secure token generation and validation

### Rate Limiting
- API rate limiting (configurable requests per window)
- Voting rate limiting (10 votes per minute per user)
- Automatic rate limit reset with time-based tracking
- Graceful degradation with retry information

### Content Moderation
- Profanity filtering with configurable word lists
- Character limits for feedback (240 characters)
- Input sanitization and validation
- Empty content prevention

### Data Validation
- Joi schema validation for all inputs
- MongoDB ObjectId validation
- URL validation for demo and deck links
- Comprehensive error handling

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user (founder/reviewer) | No |
| POST | `/api/auth/signin` | User login | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |

### Teams
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/api/teams` | Create new team | Yes | Founder |
| GET | `/api/teams` | List all teams | No | - |
| GET | `/api/teams/[id]` | Get team details | No | - |
| PUT | `/api/teams/[id]` | Update team | Yes | Founder (Owner) |
| DELETE | `/api/teams/[id]` | Delete team | Yes | Founder (Owner) |

### Pitches
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/api/pitches` | Submit new pitch | Yes | Founder |
| GET | `/api/pitches` | List all pitches | No | - |
| GET | `/api/pitches/[id]` | Get pitch details | No | - |
| PUT | `/api/pitches/[id]` | Update pitch | Yes | Founder (Owner) |
| DELETE | `/api/pitches/[id]` | Delete pitch | Yes | Founder (Owner) |
| GET | `/api/pitches/filters` | Get available filters | No | - |

### Voting & Feedback
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/api/pitches/[id]/vote` | Submit/update vote | Yes | Reviewer |
| GET | `/api/pitches/[id]/vote` | Get user's vote | Yes | Reviewer |
| POST | `/api/pitches/[id]/feedback` | Submit feedback | Yes | Reviewer |

### Leaderboard
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/leaderboard` | Get ranked leaderboard | No |
| GET | `/api/leaderboard/stats` | Get leaderboard statistics | No |

### Examples & Testing
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/example/permissions` | Test permission system | Yes |
| POST | `/api/example/permissions` | Test team creation | Yes |
| PUT | `/api/example/permissions` | Test pitch submission | Yes |
| PATCH | `/api/example/permissions` | Test voting with rate limiting | Yes |
| DELETE | `/api/example/permissions` | Test feedback validation | Yes |

## 🏗️ Project Structure

```
startup-pitch-showcase/
├── src/
│   ├── app/
│   │   ├── api/                 # API routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── teams/          # Team management
│   │   │   ├── pitches/        # Pitch management
│   │   │   ├── leaderboard/    # Leaderboard data
│   │   │   └── example/        # Permission testing
│   │   ├── components/         # Reusable UI components
│   │   ├── auth/              # Authentication pages
│   │   ├── founder/           # Founder dashboard
│   │   ├── reviewer/          # Reviewer dashboard
│   │   └── leaderboard/       # Leaderboard page
├── lib/
│   ├── config/                # Environment configuration
│   ├── models/                # MongoDB schemas
│   ├── services/              # Business logic
│   ├── middleware/            # Authentication & validation
│   ├── utils/                 # Utility functions
│   └── dto/                   # Data validation schemas
├── scripts/                   # Utility scripts
├── public/                    # Static assets
└── docs/                      # Documentation
```

## 🚀 Deployment

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Environment Validation
```bash
npm run validate-env
```

### Setup Script (Development)
```bash
npm run setup  # Validates env and starts dev server
```

## 🧪 Testing

### Test Permission System
Use the example endpoint to test all permission checks:
```bash
# Test team creation permissions
curl -X POST http://localhost:3000/api/example/permissions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test voting with rate limiting
curl -X PATCH http://localhost:3000/api/example/permissions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get current user permissions
curl -X GET http://localhost:3000/api/example/permissions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Scenarios

1. **Founder Flow**:
   - Sign up as founder
   - Create team
   - Submit pitch with demo/deck URLs
   - Try to create second team (should fail)
   - Try to vote (should fail)

2. **Reviewer Flow**:
   - Sign up as reviewer
   - Vote on pitches (test rate limiting)
   - Leave feedback (test validation)
   - Try to create team (should fail)

3. **Rate Limiting Test**:
   - Submit 10 votes quickly
   - 11th vote should be rate limited
   - Wait 1 minute and try again

## 📊 Scoring Algorithm

The leaderboard uses a weighted scoring system:
```
weighted_score = average_rating * log10(total_votes + 1)
```

This ensures that:
- Higher ratings contribute more to the score
- More votes increase the score logarithmically
- Teams with both high ratings and engagement rank higher
- Tie-breaking uses the most recent vote timestamp

## 🔧 Configuration

### Database Setup
- **Local MongoDB**: `mongodb://localhost:27017/startup-pitch-showcase`
- **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/database`

### Security Configuration
- **JWT Secret**: Minimum 32 characters in production
- **Password Rounds**: 12 rounds for bcrypt (configurable)
- **Rate Limits**: Configurable per endpoint
- **CORS**: Environment-specific origins

## 📚 Documentation

- [Environment Setup Guide](ENVIRONMENT_SETUP.md)
- [Roles & Permissions System](ROLES_AND_PERMISSIONS.md)
- [API Documentation](docs/api.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation files
- Review the example API endpoints
- Test with the permission validation script
- Check environment configuration

---

**Built with ❤️ using Next.js, MongoDB, and modern web technologies.**
