import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import { pitchService } from '../../../../lib/services';
import { createPitchSchema, pitchQuerySchema } from '../../../../lib/dto/pitch';
import { authenticate } from '../../../../lib/middleware/auth';

// POST /api/pitches
export async function POST(request) {
  try {
    await connectDB();

    // Authenticate user
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: authResult.status || 401 });
    }

    const user = authResult.user;

    // Check if user can submit a pitch
    if (!user.canSubmitPitch()) {
      return NextResponse.json({
        success: false,
        message: 'Cannot submit pitch. You must be a founder with an existing team.'
      }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate request body
    const { error, value } = createPitchSchema.validate(body);
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

    // Create pitch
    const pitch = await pitchService.createPitch(user.team, value);

    return NextResponse.json({
      success: true,
      message: 'Pitch created successfully',
      data: pitch
    }, { status: 201 });

  } catch (error) {
    console.error('Pitch creation error:', error);
    
    if (error.message.includes('already has a pitch')) {
      return NextResponse.json({
        success: false,
        message: error.message
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to create pitch',
      error: error.message
    }, { status: 500 });
  }
}

// GET /api/pitches
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const queryData = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      category: searchParams.get('category') || '',
      stage: searchParams.get('stage') || '',
      search: searchParams.get('search') || '',
      sortBy: searchParams.get('sortBy') || 'newest'
    };

    const { error, value } = pitchQuerySchema.validate(queryData);
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

    const result = await pitchService.getAllPitches(value);

    return NextResponse.json({
      success: true,
      message: 'Pitches retrieved successfully',
      data: result.pitches,
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
    console.error('Pitches retrieval error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve pitches',
      error: error.message
    }, { status: 500 });
  }
}
