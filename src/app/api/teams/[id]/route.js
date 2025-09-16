import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/db';
import { teamService } from '../../../../../lib/services';
import { updateTeamSchema } from '../../../../../lib/dto/team';

// GET /api/teams/[id]
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // Validate ObjectId
    const { isValidObjectId } = require('../../../../../lib/utils/validation');
    if (!isValidObjectId(id)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid team ID'
      }, { status: 400 });
    }

    const team = await teamService.getTeamById(id);

    return NextResponse.json({
      success: true,
      message: 'Team retrieved successfully',
      data: team
    }, { status: 200 });

  } catch (error) {
    console.error('Team retrieval error:', error);
    
    if (error.message.includes('not found')) {
      return NextResponse.json({
        success: false,
        message: error.message
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve team',
      error: error.message
    }, { status: 500 });
  }
}

// PUT /api/teams/[id]
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // Validate ObjectId
    const { isValidObjectId } = require('../../../../../lib/utils/validation');
    if (!isValidObjectId(id)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid team ID'
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
    const { verifyToken, extractTokenFromHeader } = require('../../../../../lib/utils/jwt');
    const token = extractTokenFromHeader(authHeader);
    const decoded = verifyToken(token);
    
    const { User } = require('../../../../../lib/models');
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token. User not found.'
      }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate request body
    const { error, value } = updateTeamSchema.validate(body);
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

    // Update team
    const updatedTeam = await teamService.updateTeam(id, user._id, value);

    return NextResponse.json({
      success: true,
      message: 'Team updated successfully',
      data: updatedTeam
    }, { status: 200 });

  } catch (error) {
    console.error('Team update error:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      return NextResponse.json({
        success: false,
        message: error.message
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to update team',
      error: error.message
    }, { status: 500 });
  }
}

// DELETE /api/teams/[id]
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // Validate ObjectId
    const { isValidObjectId } = require('../../../../../lib/utils/validation');
    if (!isValidObjectId(id)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid team ID'
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
    const { verifyToken, extractTokenFromHeader } = require('../../../../../lib/utils/jwt');
    const token = extractTokenFromHeader(authHeader);
    const decoded = verifyToken(token);
    
    const { User } = require('../../../../../lib/models');
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token. User not found.'
      }, { status: 401 });
    }

    // Delete team
    await teamService.deleteTeam(id, user._id);

    return NextResponse.json({
      success: true,
      message: 'Team deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Team deletion error:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      return NextResponse.json({
        success: false,
        message: error.message
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to delete team',
      error: error.message
    }, { status: 500 });
  }
}
