import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/db';
import { pitchService } from '../../../../../lib/services';
import { updatePitchSchema } from '../../../../../lib/dto/pitch';

// GET /api/pitches/[id]
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // Validate ObjectId
    const { isValidObjectId } = require('../../../../../lib/utils/validation');
    if (!isValidObjectId(id)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid pitch ID'
      }, { status: 400 });
    }

    const pitch = await pitchService.getPitchById(id);

    return NextResponse.json({
      success: true,
      message: 'Pitch retrieved successfully',
      data: pitch
    }, { status: 200 });

  } catch (error) {
    console.error('Pitch retrieval error:', error);
    
    if (error.message.includes('not found')) {
      return NextResponse.json({
        success: false,
        message: error.message
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve pitch',
      error: error.message
    }, { status: 500 });
  }
}

// PUT /api/pitches/[id]
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // Validate ObjectId
    const { isValidObjectId } = require('../../../../../lib/utils/validation');
    if (!isValidObjectId(id)) {
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
    const { error, value } = updatePitchSchema.validate(body);
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

    // Update pitch
    const updatedPitch = await pitchService.updatePitch(id, user._id, value);

    return NextResponse.json({
      success: true,
      message: 'Pitch updated successfully',
      data: updatedPitch
    }, { status: 200 });

  } catch (error) {
    console.error('Pitch update error:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      return NextResponse.json({
        success: false,
        message: error.message
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to update pitch',
      error: error.message
    }, { status: 500 });
  }
}

// DELETE /api/pitches/[id]
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // Validate ObjectId
    const { isValidObjectId } = require('../../../../../lib/utils/validation');
    if (!isValidObjectId(id)) {
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

    // Delete pitch
    await pitchService.deletePitch(id, user._id);

    return NextResponse.json({
      success: true,
      message: 'Pitch deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Pitch deletion error:', error);
    
    if (error.message.includes('not found') || error.message.includes('permission')) {
      return NextResponse.json({
        success: false,
        message: error.message
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to delete pitch',
      error: error.message
    }, { status: 500 });
  }
}
