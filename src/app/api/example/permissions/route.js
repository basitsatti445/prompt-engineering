import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/db';
import { authenticate } from '../../../../../lib/middleware/auth';
import { permissions, votingGuardrails } from '../../../../../lib/middleware';

/**
 * Example API route demonstrating comprehensive permission system
 * This shows how to use all the permission checks and guardrails
 */

// Example: Create team (Founder only, no existing team)
export async function POST(request) {
  try {
    await connectDB();

    // Step 1: Authenticate user
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: authResult.status || 401 });
    }

    const user = authResult.user;

    // Step 2: Check if user can create a team
    if (!user.canCreateTeam()) {
      return NextResponse.json({
        success: false,
        message: 'Cannot create team. You must be a founder without an existing team.',
        userRole: user.role,
        hasTeam: !!user.team
      }, { status: 403 });
    }

    // Step 3: Business logic here...
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'Team creation example - permission checks passed',
      data: {
        userId: user._id,
        userRole: user.role,
        canCreateTeam: user.canCreateTeam(),
        permissions: user.permissions
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Permission example error:', error);
    return NextResponse.json({
      success: false,
      message: 'Permission check failed',
      error: error.message
    }, { status: 500 });
  }
}

// Example: Submit pitch (Founder with team only)
export async function PUT(request) {
  try {
    await connectDB();

    // Step 1: Authenticate user
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: authResult.status || 401 });
    }

    const user = authResult.user;

    // Step 2: Check if user can submit a pitch
    if (!user.canSubmitPitch()) {
      return NextResponse.json({
        success: false,
        message: 'Cannot submit pitch. You must be a founder with an existing team.',
        userRole: user.role,
        hasTeam: !!user.team
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      message: 'Pitch submission example - permission checks passed',
      data: {
        userId: user._id,
        userRole: user.role,
        canSubmitPitch: user.canSubmitPitch(),
        teamId: user.team
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Permission example error:', error);
    return NextResponse.json({
      success: false,
      message: 'Permission check failed',
      error: error.message
    }, { status: 500 });
  }
}

// Example: Vote on pitch (Reviewer only, with rate limiting)
export async function PATCH(request) {
  try {
    await connectDB();

    // Step 1: Authenticate user
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: authResult.status || 401 });
    }

    const user = authResult.user;

    // Step 2: Check if user can vote
    if (!user.canVote()) {
      return NextResponse.json({
        success: false,
        message: 'Voting permission denied. Reviewer role required.',
        userRole: user.role
      }, { status: 403 });
    }

    // Step 3: Check rate limiting
    if (!user.canVoteNow()) {
      const timeUntilReset = 60 - Math.floor((Date.now() - user.lastVoteTime.getTime()) / 1000);
      
      return NextResponse.json({
        success: false,
        message: 'Rate limit exceeded. Maximum 10 votes per minute.',
        retryAfter: Math.max(0, timeUntilReset),
        currentVoteCount: user.voteCount,
        maxVotes: 10,
        lastVoteTime: user.lastVoteTime
      }, { status: 429 });
    }

    return NextResponse.json({
      success: true,
      message: 'Voting example - permission checks passed',
      data: {
        userId: user._id,
        userRole: user.role,
        canVote: user.canVote(),
        canVoteNow: user.canVoteNow(),
        currentVoteCount: user.voteCount,
        lastVoteTime: user.lastVoteTime
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Permission example error:', error);
    return NextResponse.json({
      success: false,
      message: 'Permission check failed',
      error: error.message
    }, { status: 500 });
  }
}

// Example: Leave feedback (Reviewer only, with validation)
export async function DELETE(request) {
  try {
    await connectDB();

    // Step 1: Authenticate user
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: authResult.status || 401 });
    }

    const user = authResult.user;

    // Step 2: Check if user can leave feedback
    if (!user.canLeaveFeedback()) {
      return NextResponse.json({
        success: false,
        message: 'Feedback permission denied. Reviewer role required.',
        userRole: user.role
      }, { status: 403 });
    }

    const body = await request.json();
    const { content } = body;

    // Step 3: Validate feedback content
    if (!content || typeof content !== 'string') {
      return NextResponse.json({
        success: false,
        message: 'Feedback content is required'
      }, { status: 400 });
    }

    const trimmedContent = content.trim();

    // Check if empty after trimming
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
        message: 'Feedback cannot exceed 240 characters',
        currentLength: trimmedContent.length,
        maxLength: 240
      }, { status: 400 });
    }

    // Check for profanity
    const { checkProfanity } = require('../../../../../lib/utils/profanityFilter');
    const profanityCheck = checkProfanity(trimmedContent);
    if (profanityCheck.hasProfanity) {
      return NextResponse.json({
        success: false,
        message: 'Feedback contains inappropriate content',
        flaggedWords: profanityCheck.flaggedWords
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback example - all validation checks passed',
      data: {
        userId: user._id,
        userRole: user.role,
        canLeaveFeedback: user.canLeaveFeedback(),
        contentLength: trimmedContent.length,
        contentPreview: trimmedContent.substring(0, 50) + '...'
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Permission example error:', error);
    return NextResponse.json({
      success: false,
      message: 'Permission check failed',
      error: error.message
    }, { status: 500 });
  }
}

// Example: Get user permissions (Any authenticated user)
export async function GET(request) {
  try {
    await connectDB();

    // Step 1: Authenticate user
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: authResult.status || 401 });
    }

    const user = authResult.user;

    return NextResponse.json({
      success: true,
      message: 'User permissions retrieved successfully',
      data: {
        userId: user._id,
        userRole: user.role,
        isActive: user.isActive,
        permissions: {
          canCreateTeam: user.canCreateTeam(),
          canSubmitPitch: user.canSubmitPitch(),
          canVote: user.canVote(),
          canLeaveFeedback: user.canLeaveFeedback()
        },
        votingStatus: {
          canVoteNow: user.canVoteNow(),
          currentVoteCount: user.voteCount,
          lastVoteTime: user.lastVoteTime,
          timeUntilReset: user.lastVoteTime ? 
            Math.max(0, 60 - Math.floor((Date.now() - user.lastVoteTime.getTime()) / 1000)) : 0
        },
        teamInfo: {
          hasTeam: !!user.team,
          teamId: user.team
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Permission example error:', error);
    return NextResponse.json({
      success: false,
      message: 'Permission check failed',
      error: error.message
    }, { status: 500 });
  }
}
