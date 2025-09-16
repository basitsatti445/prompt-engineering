import { NextResponse } from 'next/server';
import connectDB from '../../../../../../lib/db';
import { voteService } from '../../../../../../lib/services';
import { voteSchema } from '../../../../../../lib/dto/pitch';
import { authenticate } from '../../../../../../lib/middleware/auth';
import { votingGuardrails } from '../../../../../../lib/middleware';

// POST /api/pitches/[id]/vote
export async function POST(request, { params }) {
  try {
    await connectDB();

    const { id: pitchId } = params;

    // Validate ObjectId
    const { isValidObjectId } = require('../../../../../../lib/utils/validation');
    if (!isValidObjectId(pitchId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid pitch ID'
      }, { status: 400 });
    }

    // Authenticate user
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: authResult.status || 401 });
    }

    const user = authResult.user;

    // Check if user can vote
    if (!user.canVote()) {
      return NextResponse.json({
        success: false,
        message: 'Voting permission denied. Reviewer role required.'
      }, { status: 403 });
    }

    // Check rate limiting
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

    const body = await request.json();
    
    // Validate request body
    const { error, value } = voteSchema.validate(body);
    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      }, { status: 400 });
    }

    // Submit vote
    const vote = await voteService.submitVote(pitchId, user._id, value.rating);

    // Update vote tracking for rate limiting
    await user.updateVoteTracking();

    return NextResponse.json({
      success: true,
      message: 'Vote submitted successfully',
      data: vote
    }, { status: 200 });

  } catch (error) {
    console.error('Vote submission error:', error);
    
    if (error.message.includes('Rate limit exceeded')) {
      return NextResponse.json({
        success: false,
        message: error.message
      }, { status: 429 });
    }

    if (error.message.includes('not found')) {
      return NextResponse.json({
        success: false,
        message: error.message
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to submit vote',
      error: error.message
    }, { status: 500 });
  }
}

// GET /api/pitches/[id]/vote
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id: pitchId } = params;

    // Validate ObjectId
    const { isValidObjectId } = require('../../../../../../lib/utils/validation');
    if (!isValidObjectId(pitchId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid pitch ID'
      }, { status: 400 });
    }

    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        message: 'Access denied. No token provided.'
      }, { status: 401 });
    }

    // Verify token and get user
    const { verifyToken, extractTokenFromHeader } = require('../../../../../../lib/utils/jwt');
    const token = extractTokenFromHeader(authHeader);
    const decoded = verifyToken(token);
    
    const { User } = require('../../../../../../lib/models');
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token. User not found.'
      }, { status: 401 });
    }

    // Get user's vote for this pitch
    const vote = await voteService.getVoteByReviewer(pitchId, user._id);

    return NextResponse.json({
      success: true,
      message: 'Vote retrieved successfully',
      data: vote
    }, { status: 200 });

  } catch (error) {
    console.error('Vote retrieval error:', error);
    
    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired token'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve vote',
      error: error.message
    }, { status: 500 });
  }
}
