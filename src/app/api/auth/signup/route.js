import { NextResponse } from 'next/server';
import { authService } from '../../../../../lib/services';
import { signupSchema } from '../../../../../lib/dto/auth';
import { asyncHandler } from '../../../../../lib/middleware';
import connectDB from '../../../../../lib/db';

// POST /api/auth/signup
export async function POST(request) {
  return asyncHandler(async (req) => {
    await connectDB();

    try {
      const body = await request.json();
      
      // Validate request body
      const { error, value } = signupSchema.validate(body);
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

      // Create user
      const result = await authService.signup(value);

      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        data: result
      }, { status: 201 });

    } catch (error) {
      console.error('Signup error:', error);
      
      if (error.message.includes('already exists')) {
        return NextResponse.json({
          success: false,
          message: error.message
        }, { status: 409 });
      }

      return NextResponse.json({
        success: false,
        message: 'Failed to create user',
        error: error.message
      }, { status: 500 });
    }
  })(request);
}
