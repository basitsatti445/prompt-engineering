import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import { teamService } from '../../../../lib/services';
import { createTeamSchema } from '../../../../lib/dto/team';
import { authenticate } from '../../../../lib/middleware/auth';
import { permissions } from '../../../../lib/middleware';

// POST /api/teams
export async function POST(request) {
  try {
    await connectDB();

    // Authenticate user
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: authResult.status || 401 });
    }

    const user = authResult.user;

    // Check if user can create a team
    if (!user.canCreateTeam()) {
      return NextResponse.json({
        success: false,
        message: 'Cannot create team. You must be a founder without an existing team.'
      }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate request body
    const { error, value } = createTeamSchema.validate(body);
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

    // Create team
    const team = await teamService.createTeam(user._id, value);

    return NextResponse.json({
      success: true,
      message: 'Team created successfully',
      data: team
    }, { status: 201 });

  } catch (error) {
    console.error('Team creation error:', error);
    
    if (error.message.includes('already have a team')) {
      return NextResponse.json({
        success: false,
        message: error.message
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to create team',
      error: error.message
    }, { status: 500 });
  }
}

// GET /api/teams
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'newest';

    const options = {
      page,
      limit,
      search,
      sortBy
    };

    const result = await teamService.getAllTeams(options);

    return NextResponse.json({
      success: true,
      message: 'Teams retrieved successfully',
      data: result.teams,
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
    console.error('Teams retrieval error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve teams',
      error: error.message
    }, { status: 500 });
  }
}
