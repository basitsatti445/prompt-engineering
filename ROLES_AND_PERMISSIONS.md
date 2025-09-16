# Roles and Permissions System

This document explains the comprehensive roles and permissions system implemented in the Startup Pitch Showcase application.

## Overview

The system implements two distinct roles with specific permissions and guardrails:

- **Founder**: Can create teams and submit pitches
- **Reviewer**: Can vote on pitches and leave feedback

## User Roles

### Founder Role
- **Primary Function**: Create and manage teams, submit pitches
- **Permissions**:
  - Create one team per account
  - Submit one pitch per team
  - View all pitches and leaderboard
  - Update their own team and pitch information

### Reviewer Role
- **Primary Function**: Evaluate pitches through voting and feedback
- **Permissions**:
  - Vote on pitches (1-5 stars)
  - Leave feedback on pitches
  - View all pitches and leaderboard
  - Update their own votes (latest vote counts)

## Enhanced User Model

The User model now includes comprehensive role management:

```javascript
// Role-based permission methods
user.hasPermission(permission)     // Check specific permission
user.isFounder()                   // Check if user is founder
user.isReviewer()                  // Check if user is reviewer
user.canCreateTeam()               // Check if founder can create team
user.canSubmitPitch()              // Check if founder can submit pitch
user.canVote()                     // Check if reviewer can vote
user.canLeaveFeedback()            // Check if reviewer can leave feedback

// Rate limiting methods
user.canVoteNow()                  // Check if within rate limit
user.updateVoteTracking()          // Update vote tracking
```

## Pitch Model Updates

Pitches now include required demo and deck URLs:

```javascript
{
  title: String,           // Required, 5-200 characters
  oneLiner: String,       // Required, 10-300 characters
  description: String,    // Required, 50-2000 characters
  category: String,       // Required, enum values
  stage: String,         // Required, enum values
  demoUrl: String,       // Required, valid HTTP/HTTPS URL
  deckUrl: String,       // Required, valid HTTP/HTTPS URL
  team: ObjectId,       // Required, reference to Team
  // ... other fields
}
```

## Permission Middleware

### Basic Permission Checks

```javascript
import { permissions } from '../lib/middleware';

// Check specific permission
app.use('/api/teams', permissions.hasPermission('canCreateTeam'));

// Check role
app.use('/api/pitches', permissions.requireFounder());
app.use('/api/vote', permissions.requireReviewer());

// Check capability
app.use('/api/teams', permissions.canCreateTeam());
app.use('/api/pitches', permissions.canSubmitPitch());
app.use('/api/vote', permissions.canVote());
app.use('/api/feedback', permissions.canLeaveFeedback());
```

### Resource Ownership

```javascript
// Check if user owns a specific resource
app.use('/api/teams/:id', permissions.ownsResource('team'));
app.use('/api/pitches/:id', permissions.ownsResource('pitch'));
```

## Voting Guardrails

### Rate Limiting
- **Limit**: 10 votes per minute per user
- **Tracking**: Automatic reset after 1 minute
- **Response**: 429 status with retry information

### One Vote Per Pitch
- **Rule**: Each reviewer can only vote once per pitch
- **Update**: Latest vote overwrites previous vote
- **Validation**: Automatic check before vote submission

### Vote Validation
- **Rating**: Must be integer between 1-5
- **Pitch**: Must exist and be active
- **User**: Must be active reviewer

## Feedback Validation

### Content Validation
- **Required**: Non-empty content after trimming
- **Length**: Maximum 240 characters
- **Profanity**: Automatic filtering with flagged words list

### Permission Checks
- **Role**: Only reviewers can leave feedback
- **Uniqueness**: One feedback per reviewer per pitch
- **Pitch**: Must exist and be active

## API Route Examples

### Team Creation (Founder Only)

```javascript
// POST /api/teams
export async function POST(request) {
  // 1. Authenticate user
  const authResult = await authenticate(request);
  if (!authResult.success) {
    return NextResponse.json(authResult, { status: 401 });
  }

  const user = authResult.user;

  // 2. Check if user can create a team
  if (!user.canCreateTeam()) {
    return NextResponse.json({
      success: false,
      message: 'Cannot create team. You must be a founder without an existing team.'
    }, { status: 403 });
  }

  // 3. Business logic...
}
```

### Pitch Submission (Founder with Team)

```javascript
// POST /api/pitches
export async function POST(request) {
  // 1. Authenticate user
  const authResult = await authenticate(request);
  if (!authResult.success) {
    return NextResponse.json(authResult, { status: 401 });
  }

  const user = authResult.user;

  // 2. Check if user can submit a pitch
  if (!user.canSubmitPitch()) {
    return NextResponse.json({
      success: false,
      message: 'Cannot submit pitch. You must be a founder with an existing team.'
    }, { status: 403 });
  }

  // 3. Validate pitch data including demoUrl and deckUrl
  // 4. Business logic...
}
```

### Voting (Reviewer with Rate Limiting)

```javascript
// POST /api/pitches/[id]/vote
export async function POST(request, { params }) {
  // 1. Authenticate user
  const authResult = await authenticate(request);
  if (!authResult.success) {
    return NextResponse.json(authResult, { status: 401 });
  }

  const user = authResult.user;

  // 2. Check if user can vote
  if (!user.canVote()) {
    return NextResponse.json({
      success: false,
      message: 'Voting permission denied. Reviewer role required.'
    }, { status: 403 });
  }

  // 3. Check rate limiting
  if (!user.canVoteNow()) {
    const timeUntilReset = 60 - Math.floor((Date.now() - user.lastVoteTime.getTime()) / 1000);
    
    return NextResponse.json({
      success: false,
      message: 'Rate limit exceeded. Maximum 10 votes per minute.',
      retryAfter: Math.max(0, timeUntilReset),
      currentVoteCount: user.voteCount,
      maxVotes: 10
    }, { status: 429 });
  }

  // 4. Validate vote (1-5 stars)
  // 5. Check for existing vote (allow update)
  // 6. Submit vote and update tracking
  await user.updateVoteTracking();
}
```

### Feedback Submission (Reviewer with Validation)

```javascript
// POST /api/pitches/[id]/feedback
export async function POST(request, { params }) {
  // 1. Authenticate user
  const authResult = await authenticate(request);
  if (!authResult.success) {
    return NextResponse.json(authResult, { status: 401 });
  }

  const user = authResult.user;

  // 2. Check if user can leave feedback
  if (!user.canLeaveFeedback()) {
    return NextResponse.json({
      success: false,
      message: 'Feedback permission denied. Reviewer role required.'
    }, { status: 403 });
  }

  // 3. Validate feedback content
  const { content } = await request.json();
  const trimmedContent = content.trim();

  // Check if empty
  if (trimmedContent.length === 0) {
    return NextResponse.json({
      success: false,
      message: 'Feedback cannot be empty'
    }, { status: 400 });
  }

  // Check character limit
  if (trimmedContent.length > 240) {
    return NextResponse.json({
      success: false,
      message: 'Feedback cannot exceed 240 characters'
    }, { status: 400 });
  }

  // Check for profanity
  const profanityCheck = checkProfanity(trimmedContent);
  if (profanityCheck.hasProfanity) {
    return NextResponse.json({
      success: false,
      message: 'Feedback contains inappropriate content',
      flaggedWords: profanityCheck.flaggedWords
    }, { status: 400 });
  }

  // 4. Check if user has already left feedback
  // 5. Submit feedback
}
```

## Error Responses

### Authentication Errors
```javascript
{
  "success": false,
  "message": "Authentication required"
}
```

### Permission Errors
```javascript
{
  "success": false,
  "message": "Permission denied. Required permission: canCreateTeam"
}
```

### Rate Limiting Errors
```javascript
{
  "success": false,
  "message": "Rate limit exceeded. Maximum 10 votes per minute.",
  "retryAfter": 45,
  "currentVoteCount": 10,
  "maxVotes": 10
}
```

### Validation Errors
```javascript
{
  "success": false,
  "message": "Feedback contains inappropriate content",
  "flaggedWords": ["word1", "word2"]
}
```

## Testing the System

### Example API Endpoint
Use `/api/example/permissions` to test all permission checks:

- **POST**: Test team creation permissions
- **PUT**: Test pitch submission permissions  
- **PATCH**: Test voting permissions with rate limiting
- **DELETE**: Test feedback permissions with validation
- **GET**: Get current user permissions and status

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
   - Try to submit pitch (should fail)

3. **Rate Limiting Test**:
   - Submit 10 votes quickly
   - 11th vote should be rate limited
   - Wait 1 minute and try again

4. **Feedback Validation Test**:
   - Submit empty feedback (should fail)
   - Submit feedback > 240 chars (should fail)
   - Submit profane feedback (should fail)
   - Submit valid feedback

## Security Features

### Role Immutability
- User roles cannot be changed after account creation
- Role is marked as `immutable: true` in schema

### Rate Limiting
- Per-user vote tracking with automatic reset
- Configurable limits via environment variables
- Graceful degradation with retry information

### Content Validation
- Profanity filtering with configurable word lists
- Character limits enforced at multiple levels
- Input sanitization and trimming

### Resource Ownership
- Users can only modify their own resources
- Automatic ownership validation
- Secure resource access patterns

## Configuration

### Environment Variables
```bash
# Rate limiting
VOTE_RATE_LIMIT_MAX=10
VOTE_RATE_LIMIT_WINDOW_MS=60000

# Profanity filtering
PROFANITY_FILTER_ENABLED=true
PROFANITY_WORD_LIST=word1,word2,word3
```

### Database Indexes
- User role and permission indexes for fast lookups
- Vote tracking indexes for rate limiting
- Pitch ownership indexes for security

## Best Practices

1. **Always authenticate first** before checking permissions
2. **Use specific permission methods** rather than role checks
3. **Implement rate limiting** for all user actions
4. **Validate input thoroughly** at multiple levels
5. **Log permission failures** for security monitoring
6. **Use consistent error responses** across all endpoints
7. **Test edge cases** like rate limits and validation failures

This comprehensive roles and permissions system ensures secure, scalable, and maintainable access control throughout the application.
