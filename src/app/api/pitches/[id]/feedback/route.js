import { NextResponse } from 'next/server';
import connectDB from '../../../../../../lib/db';
import { feedbackService } from '../../../../../../lib/services';
import { feedbackSchema } from '../../../../../../lib/dto/pitch';
import { authenticate } from '../../../../../../lib/middleware/auth';
import { checkProfanity } from '../../../../../../lib/utils/profanityFilter';

// POST /api/pitches/[id]/feedback
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

    // Check if user can leave feedback
    if (!user.canLeaveFeedback()) {
      return NextResponse.json({
        success: false,
        message: 'Feedback permission denied. Reviewer role required.'
      }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate request body
    const { error, value } = feedbackSchema.validate(body);
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

    const { content } = value;
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

    // Check if user has already left feedback for this pitch
    const { Feedback } = require('../../../../../../lib/models');
    const existingFeedback = await Feedback.findOne({
      pitch: pitchId,
      reviewer: user._id
    });

    if (existingFeedback) {
      return NextResponse.json({
        success: false,
        message: 'You have already left feedback for this pitch'
      }, { status: 400 });
    }

    // Submit feedback
    const feedback = await feedbackService.submitFeedback(pitchId, user._id, trimmedContent);

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    }, { status: 201 });

  } catch (error) {
    console.error('Feedback submission error:', error);
    
    if (error.message.includes('not found')) {
      return NextResponse.json({
        success: false,
        message: error.message
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    }, { status: 500 });
  }
}

// GET /api/pitches/[id]/feedback
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const sortBy = searchParams.get('sortBy') || 'newest';

    const options = {
      page,
      limit,
      sortBy
    };

    const result = await feedbackService.getPitchFeedback(pitchId, options);

    return NextResponse.json({
      success: true,
      message: 'Feedback retrieved successfully',
      data: result.feedback,
      pagination: {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        pages: result.pagination.pages,
        hasNext: result.pagination.page < result.pagination.pages,
        hasPrev: result.pagination.page > 1
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Feedback retrieval error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve feedback',
      error: error.message
    }, { status: 500 });
  }
}
