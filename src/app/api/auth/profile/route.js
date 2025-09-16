import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import { authService } from '../../../../lib/services';
import { authenticate, requireFounderOrReviewer } from '../../../../lib/middleware';

// GET /api/auth/profile
export async function GET(request) {
  try {
    await connectDB();

    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        message: 'Access denied. No token provided.'
      }, { status: 401 });
    }

    // Verify token and get user
    const { verifyToken, extractTokenFromHeader } = require('../../../../lib/utils/jwt');
    const token = extractTokenFromHeader(authHeader);
    const decoded = verifyToken(token);
    
    const { User } = require('../../../../lib/models');
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token. User not found.'
      }, { status: 401 });
    }

    // Get user profile
    const profile = await authService.getUserProfile(user._id);

    return NextResponse.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: profile
    }, { status: 200 });

  } catch (error) {
    console.error('Profile error:', error);
    
    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired token'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve profile',
      error: error.message
    }, { status: 500 });
  }
}

// PUT /api/auth/profile
export async function PUT(request) {
  try {
    await connectDB();

    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        message: 'Access denied. No token provided.'
      }, { status: 401 });
    }

    // Verify token and get user
    const { verifyToken, extractTokenFromHeader } = require('../../../../lib/utils/jwt');
    const token = extractTokenFromHeader(authHeader);
    const decoded = verifyToken(token);
    
    const { User } = require('../../../../lib/models');
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token. User not found.'
      }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate update data
    const { Joi } = require('joi');
    const updateSchema = Joi.object({
      name: Joi.string().trim().min(2).max(100).required()
    });

    const { error, value } = updateSchema.validate(body);
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

    // Update profile
    const updatedProfile = await authService.updateProfile(user._id, value);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    }, { status: 200 });

  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired token'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    }, { status: 500 });
  }
}
